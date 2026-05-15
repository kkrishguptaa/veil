import type {
  AuditEvent,
  CandidateVault,
  DisclosureGrant,
  RecruiterView,
  VerifiedClaim,
} from "./domain";

type DisclosureDecision = Extract<DisclosureGrant["state"], "approved" | "denied">;

export interface DisclosureMutationResult {
  grants: DisclosureGrant[];
  auditEvents: AuditEvent[];
  grant: DisclosureGrant;
  auditEvent: AuditEvent;
}

export interface RequestDisclosureGrantInput
  extends Omit<DisclosureGrant, "id" | "state" | "requestedAt" | "midnightReceipt" | "decidedAt"> {
  actorRecruiterId: string;
  requestedAt?: string;
}

export interface DecideDisclosureGrantInput {
  grantId: string;
  decision: DisclosureDecision;
  actorCandidateId: string;
  decidedAt?: string;
}

const disclosureClock = () => new Date(0).toISOString();

export function buildAnonymousRecruiterView(vault: CandidateVault): RecruiterView {
  const coarseClaims = vault.verifiedClaims
    .filter((claim) => claim.privacyLevel === "coarse")
    .map(
      ({
        preciseValue: _preciseValue,
        midnightPrivateClaim: _midnightPrivateClaim,
        midnightPublicClaim: _midnightPublicClaim,
        ...claim
      }) => claim,
    );
  const gatedClaimKinds = vault.verifiedClaims
    .filter((claim) => claim.privacyLevel === "precise")
    .map((claim) => claim.kind);

  return {
    candidateId: vault.candidateId,
    anonymousHandle: vault.anonymousHandle,
    approvedForDiscovery: vault.approvedForDiscovery,
    aiSummary: vault.aiSummary,
    coarseClaims,
    gatedClaimKinds,
    visibleReceipts: coarseClaims.map((claim) => claim.midnightCommitment),
  };
}

export function recruiterEvidenceBoundary(vault: CandidateVault) {
  return vault.evidenceDocuments.map((document) => ({
    id: document.id,
    title: document.title,
    kind: document.kind,
    rawTextVisible: false,
    midnightCommitment: document.midnightCommitment,
  }));
}

export function getRecruiterVisibleClaim(
  claim: VerifiedClaim,
  grants: DisclosureGrant[],
  recruiterId: string,
) {
  const approvedGrant = grants.find(
    (grant) =>
      grant.candidateId === claim.candidateId &&
      grant.claimId === claim.id &&
      grant.recruiterId === recruiterId &&
      grant.state === "approved",
  );

  return {
    claimId: claim.id,
    label: claim.label,
    value: approvedGrant ? claim.preciseValue : claim.coarseValue,
    precision: approvedGrant ? "precise" : "coarse",
    rawEvidenceVisible: false,
    receipt: approvedGrant?.midnightReceipt ?? claim.midnightCommitment,
  };
}

export function requestDisclosureGrant(
  grants: DisclosureGrant[],
  auditEvents: AuditEvent[],
  input: RequestDisclosureGrantInput,
): DisclosureMutationResult {
  if (input.actorRecruiterId !== input.recruiterId) {
    throw new Error("recruiter can request disclosure only for their own recruiter scope");
  }

  const requestedAt = input.requestedAt ?? disclosureClock();
  const grant: DisclosureGrant = {
    candidateId: input.candidateId,
    recruiterId: input.recruiterId,
    recruiterName: input.recruiterName,
    claimId: input.claimId,
    id: `grant-${input.claimId}-${input.recruiterId}`,
    state: "requested",
    requestedAt,
    midnightReceipt: `midnight:grant-request:${input.claimId}:${input.recruiterId}`,
  };
  const auditEvent = makeAuditEvent(
    grant,
    "recruiter",
    "disclosure.requested",
    grant.requestedAt,
  );

  return {
    grants: [...grants, grant],
    auditEvents: [...auditEvents, auditEvent],
    grant,
    auditEvent,
  };
}

export function decideDisclosureGrant(
  grants: DisclosureGrant[],
  auditEvents: AuditEvent[],
  input: DecideDisclosureGrantInput,
): DisclosureMutationResult {
  const grant = grants.find((candidateGrant) => candidateGrant.id === input.grantId);

  if (!grant) {
    throw new Error(`disclosure grant not found: ${input.grantId}`);
  }
  if (grant.candidateId !== input.actorCandidateId) {
    throw new Error("candidate can decide disclosure only for their own vault");
  }
  if (grant.state !== "requested") {
    throw new Error("disclosure grant decisions require requested state");
  }

  const decidedAt = input.decidedAt ?? disclosureClock();
  const decidedGrant: DisclosureGrant = {
    ...grant,
    state: input.decision,
    decidedAt,
    midnightReceipt: `midnight:grant-${input.decision}:${grant.claimId}:${grant.recruiterId}`,
  };
  const auditEvent = makeAuditEvent(
    decidedGrant,
    "candidate",
    input.decision === "approved" ? "disclosure.approved" : "disclosure.denied",
    decidedAt,
  );

  return {
    grants: grants.map((candidateGrant) =>
      candidateGrant.id === input.grantId ? decidedGrant : candidateGrant,
    ),
    auditEvents: [...auditEvents, auditEvent],
    grant: decidedGrant,
    auditEvent,
  };
}

export function getCandidateAuditEvents(events: AuditEvent[], candidateId: string) {
  return events.filter((event) => event.candidateId === candidateId);
}

function makeAuditEvent(
  grant: DisclosureGrant,
  actor: AuditEvent["actor"],
  action: AuditEvent["action"],
  timestamp: string,
): AuditEvent {
  return {
    id: `audit-${action}-${grant.claimId}-${grant.recruiterId}`,
    candidateId: grant.candidateId,
    actor,
    action,
    targetId: grant.claimId,
    timestamp,
    receipt: grant.midnightReceipt,
  };
}
