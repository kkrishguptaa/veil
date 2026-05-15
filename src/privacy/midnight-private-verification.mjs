import { createHash, randomBytes } from "node:crypto";

export const CLAIM_TAXONOMY = Object.freeze([
  "role_family",
  "skills",
  "seniority",
  "startup_exposure",
  "compensation_band",
  "leadership_scope",
  "employment_tenure",
  "education_credential",
  "performance_tier",
]);

export const MIDNIGHT_PRIVACY_PATH = Object.freeze({
  adapter: "local-midnight-commitment-adapter",
  plannedContract: "VeilClaimRegistry.compact",
  commitmentPrimitive: "Compact transientCommit over private witness payload",
  disclosurePrimitive: "candidate-approved explicit disclosure receipt",
  ledgerModel:
    "Store claim commitments, recruiter-view approvals, disclosure grants, and receipt commitments; never store raw evidence.",
});

const COMMITMENT_VERSION = "veil-midnight-claim-v1";
const VIEW_VERSION = "veil-midnight-recruiter-view-v1";
const RECEIPT_VERSION = "veil-midnight-disclosure-receipt-v1";

export function createLocalMidnightPrivacyBoundary({ now = () => new Date().toISOString() } = {}) {
  return {
    createEvidenceDocument,
    createVerifiedClaim,
    verifyClaimCommitment,
    approveRecruiterView: (input) => approveRecruiterView({ ...input, now }),
    requestDisclosureGrant,
    approveDisclosureGrant: (input) => approveDisclosureGrant({ ...input, now }),
    verifyDisclosureReceipt,
  };
}

export function createEvidenceDocument({ documentId, candidateId, kind, body, metadata = {} }) {
  requireString(documentId, "documentId");
  requireString(candidateId, "candidateId");
  requireString(kind, "kind");

  const rawBody = typeof body === "string" ? body : canonicalJson(body);

  return Object.freeze({
    documentId,
    candidateId,
    kind,
    bodyHash: sha256(rawBody),
    byteLength: Buffer.byteLength(rawBody),
    metadata: freezePlain(metadata),
  });
}

export function createVerifiedClaim({
  claimId,
  candidateId,
  type,
  coarseValue,
  preciseValue,
  evidenceDocuments,
  confidence,
  extractionSummary,
  salt = randomSalt(),
}) {
  requireString(claimId, "claimId");
  requireString(candidateId, "candidateId");
  assertClaimType(type);
  assertEvidence(evidenceDocuments);

  if (typeof confidence !== "number" || confidence < 0 || confidence > 1) {
    throw new TypeError("confidence must be a number from 0 to 1");
  }

  const evidenceRefs = evidenceDocuments.map(toEvidenceRef);
  const privateClaim = Object.freeze({
    version: COMMITMENT_VERSION,
    claimId,
    candidateId,
    type,
    coarseValue,
    preciseValue,
    confidence,
    extractionSummary,
    evidenceRefs,
    salt,
  });

  const commitment = commitPrivateClaim(privateClaim);

  const publicClaim = Object.freeze({
    version: COMMITMENT_VERSION,
    claimId,
    candidateId,
    type,
    coarseValue,
    confidence,
    extractionSummary,
    evidenceRefs,
    commitment,
    privacy: Object.freeze({
      defaultVisibility: "coarse",
      preciseClaimRequiresDisclosureGrant: true,
      rawEvidenceVisibleToRecruiter: false,
      midnightPath: MIDNIGHT_PRIVACY_PATH.adapter,
    }),
  });

  return Object.freeze({ privateClaim, publicClaim });
}

export function verifyClaimCommitment({ privateClaim, commitment }) {
  if (!privateClaim || !commitment) {
    return false;
  }

  return commitPrivateClaim(privateClaim) === commitment;
}

export function approveRecruiterView({ viewId, candidateId, publicClaims, candidateApprovedBy, now }) {
  requireString(viewId, "viewId");
  requireString(candidateId, "candidateId");
  requireString(candidateApprovedBy, "candidateApprovedBy");
  if (!Array.isArray(publicClaims) || publicClaims.length === 0) {
    throw new TypeError("publicClaims must include at least one claim");
  }

  const approvedClaims = publicClaims.map(toRecruiterSafeClaim);
  const approvedAt = now();
  const viewPayload = {
    version: VIEW_VERSION,
    viewId,
    candidateId,
    candidateApprovedBy,
    approvedAt,
    claimCommitments: approvedClaims.map((claim) => claim.commitment),
  };

  return Object.freeze({
    ...viewPayload,
    status: "approved",
    publicClaims: Object.freeze(approvedClaims),
    midnight: Object.freeze({
      ...MIDNIGHT_PRIVACY_PATH,
      recruiterViewCommitment: hashJson("midnight.recruiter-view", viewPayload),
    }),
  });
}

export function requestDisclosureGrant({
  grantId,
  recruiterId,
  recruiterViewId,
  claimId,
  requestedFields,
  reason,
}) {
  requireString(grantId, "grantId");
  requireString(recruiterId, "recruiterId");
  requireString(recruiterViewId, "recruiterViewId");
  requireString(claimId, "claimId");
  if (!Array.isArray(requestedFields) || requestedFields.length === 0) {
    throw new TypeError("requestedFields must include at least one field");
  }

  const invalidField = requestedFields.find((field) => field !== "preciseValue");
  if (invalidField) {
    throw new Error(`unsupported disclosure field: ${invalidField}`);
  }

  return Object.freeze({
    grantId,
    recruiterId,
    recruiterViewId,
    claimId,
    requestedFields: Object.freeze([...requestedFields]),
    reason,
    status: "pending_candidate_approval",
  });
}

export function approveDisclosureGrant({
  grantRequest,
  privateClaim,
  publicClaim,
  candidateApprovedBy,
  now,
}) {
  requireString(candidateApprovedBy, "candidateApprovedBy");
  if (!grantRequest || grantRequest.status !== "pending_candidate_approval") {
    throw new Error("grantRequest must be pending candidate approval");
  }
  if (grantRequest.claimId !== privateClaim.claimId || grantRequest.claimId !== publicClaim.claimId) {
    throw new Error("grantRequest claimId must match claim");
  }
  if (!verifyClaimCommitment({ privateClaim, commitment: publicClaim.commitment })) {
    throw new Error("claim commitment verification failed");
  }

  const approvedAt = now();
  const disclosedClaim = Object.freeze(
    Object.fromEntries(
      grantRequest.requestedFields.map((field) => [field, privateClaim[field]]),
    ),
  );

  const receiptPayload = {
    version: RECEIPT_VERSION,
    grantId: grantRequest.grantId,
    recruiterId: grantRequest.recruiterId,
    recruiterViewId: grantRequest.recruiterViewId,
    claimId: grantRequest.claimId,
    candidateId: privateClaim.candidateId,
    candidateApprovedBy,
    approvedAt,
    requestedFields: grantRequest.requestedFields,
    disclosedClaim,
    claimCommitment: publicClaim.commitment,
  };

  return Object.freeze({
    ...receiptPayload,
    receiptId: shortId("receipt", receiptPayload),
    status: "approved",
    midnight: Object.freeze({
      ...MIDNIGHT_PRIVACY_PATH,
      disclosureDigest: hashJson("midnight.disclosure-digest", {
        claimCommitment: publicClaim.commitment,
        recruiterId: grantRequest.recruiterId,
        requestedFields: grantRequest.requestedFields,
        disclosedClaim,
      }),
      receiptCommitment: hashJson("midnight.disclosure-receipt", receiptPayload),
    }),
    rawEvidenceVisibleToRecruiter: false,
  });
}

export function verifyDisclosureReceipt({ receipt, privateClaim, publicClaim }) {
  if (!receipt || !privateClaim || !publicClaim) {
    return false;
  }
  if (receipt.claimId !== privateClaim.claimId || receipt.claimId !== publicClaim.claimId) {
    return false;
  }
  if (receipt.claimCommitment !== publicClaim.commitment) {
    return false;
  }
  if (!verifyClaimCommitment({ privateClaim, commitment: publicClaim.commitment })) {
    return false;
  }

  const expectedDisclosure = hashJson("midnight.disclosure-digest", {
    claimCommitment: publicClaim.commitment,
    recruiterId: receipt.recruiterId,
    requestedFields: receipt.requestedFields,
    disclosedClaim: receipt.disclosedClaim,
  });

  const expectedReceiptPayload = {
    version: RECEIPT_VERSION,
    grantId: receipt.grantId,
    recruiterId: receipt.recruiterId,
    recruiterViewId: receipt.recruiterViewId,
    claimId: receipt.claimId,
    candidateId: receipt.candidateId,
    candidateApprovedBy: receipt.candidateApprovedBy,
    approvedAt: receipt.approvedAt,
    requestedFields: receipt.requestedFields,
    disclosedClaim: receipt.disclosedClaim,
    claimCommitment: receipt.claimCommitment,
  };

  return (
    receipt.midnight?.disclosureDigest === expectedDisclosure &&
    receipt.midnight?.receiptCommitment ===
      hashJson("midnight.disclosure-receipt", expectedReceiptPayload)
  );
}

export function containsPrivateEvidence(value, privateNeedles) {
  const haystack = canonicalJson(value);
  return privateNeedles.some((needle) => haystack.includes(needle));
}

export function canonicalJson(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

function commitPrivateClaim(privateClaim) {
  return hashJson("midnight.claim-commitment", {
    version: privateClaim.version,
    claimId: privateClaim.claimId,
    candidateId: privateClaim.candidateId,
    type: privateClaim.type,
    coarseValue: privateClaim.coarseValue,
    preciseValue: privateClaim.preciseValue,
    confidence: privateClaim.confidence,
    extractionSummary: privateClaim.extractionSummary,
    evidenceRefs: privateClaim.evidenceRefs,
    salt: privateClaim.salt,
  });
}

function toEvidenceRef(document) {
  return Object.freeze({
    documentId: document.documentId,
    kind: document.kind,
    bodyHash: document.bodyHash,
  });
}

function toRecruiterSafeClaim(claim) {
  return Object.freeze({
    version: claim.version,
    claimId: claim.claimId,
    candidateId: claim.candidateId,
    type: claim.type,
    coarseValue: claim.coarseValue,
    confidence: claim.confidence,
    extractionSummary: claim.extractionSummary,
    evidenceRefs: claim.evidenceRefs,
    commitment: claim.commitment,
    privacy: claim.privacy,
  });
}

function assertClaimType(type) {
  if (!CLAIM_TAXONOMY.includes(type)) {
    throw new Error(`unsupported claim type: ${type}`);
  }
}

function assertEvidence(evidenceDocuments) {
  if (!Array.isArray(evidenceDocuments) || evidenceDocuments.length === 0) {
    throw new TypeError("evidenceDocuments must include at least one document");
  }
}

function requireString(value, fieldName) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${fieldName} must be a non-empty string`);
  }
}

function freezePlain(value) {
  return Object.freeze(JSON.parse(JSON.stringify(value)));
}

function randomSalt() {
  return randomBytes(32).toString("hex");
}

function shortId(prefix, value) {
  return `${prefix}_${hashJson(prefix, value).slice(0, 16)}`;
}

function hashJson(prefix, value) {
  return sha256(`${prefix}:${canonicalJson(value)}`);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
