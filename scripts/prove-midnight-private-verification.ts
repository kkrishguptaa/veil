import {
  containsPrivateEvidence,
  createLocalMidnightPrivacyBoundary,
} from "../src/privacy/midnight-private-verification";

const boundary = createLocalMidnightPrivacyBoundary({
  now: () => "2026-05-16T00:00:00.000Z",
});

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const privatePaySlip =
  "Pay slip for Asha Rao at BluePeak Labs. Gross annual cash compensation INR 4,420,000.";
const privateResume =
  "Asha Rao, backend engineer at BluePeak Labs, shipped Node.js and Postgres systems for a 38-person seed startup.";

const payEvidence = boundary.createEvidenceDocument({
  documentId: "evidence_pay_001",
  candidateId: "candidate_asha",
  kind: "pay_slip",
  body: privatePaySlip,
});

const resumeEvidence = boundary.createEvidenceDocument({
  documentId: "evidence_resume_001",
  candidateId: "candidate_asha",
  kind: "resume",
  body: privateResume,
});

const compensationClaim = boundary.createVerifiedClaim({
  claimId: "claim_comp_001",
  candidateId: "candidate_asha",
  type: "compensation_band",
  coarseValue: "INR 40L-50L",
  preciseValue: "INR 44.2L gross annual cash compensation",
  confidence: 0.94,
  evidenceDocuments: [payEvidence],
  extractionSummary:
    "Compensation band derived from pay evidence; exact amount stays precise and gated.",
  salt: "demo-compensation-salt",
});

const startupClaim = boundary.createVerifiedClaim({
  claimId: "claim_startup_001",
  candidateId: "candidate_asha",
  type: "startup_exposure",
  coarseValue: "seed-stage startup experience",
  preciseValue: "BluePeak Labs, 38-person seed startup",
  confidence: 0.89,
  evidenceDocuments: [resumeEvidence],
  extractionSummary:
    "Startup exposure derived from resume evidence; employer name stays precise and gated.",
  salt: "demo-startup-salt",
});

const recruiterView = boundary.approveRecruiterView({
  viewId: "view_asha_backend_private",
  candidateId: "candidate_asha",
  candidateApprovedBy: "candidate_asha",
  publicClaims: [compensationClaim.publicClaim, startupClaim.publicClaim],
});

const grantRequest = boundary.requestDisclosureGrant({
  grantId: "grant_comp_precise_001",
  recruiterId: "recruiter_acme",
  recruiterViewId: recruiterView.viewId,
  claimId: compensationClaim.publicClaim.claimId,
  requestedFields: ["preciseValue"],
  reason: "Confirm budget fit before candidate identity reveal.",
});

const disclosureReceipt = boundary.approveDisclosureGrant({
  grantRequest,
  privateClaim: compensationClaim.privateClaim,
  publicClaim: compensationClaim.publicClaim,
  candidateApprovedBy: "candidate_asha",
});

const output = {
  path: "Midnight-backed claim commitments + candidate-approved selective disclosure receipts",
  commitmentsVerified: [
    boundary.verifyClaimCommitment({
      privateClaim: compensationClaim.privateClaim,
      commitment: compensationClaim.publicClaim.commitment,
    }),
    boundary.verifyClaimCommitment({
      privateClaim: startupClaim.privateClaim,
      commitment: startupClaim.publicClaim.commitment,
    }),
  ],
  disclosureReceiptVerified: boundary.verifyDisclosureReceipt({
    receipt: disclosureReceipt,
    privateClaim: compensationClaim.privateClaim,
    publicClaim: compensationClaim.publicClaim,
  }),
  recruiterView,
  disclosureReceipt,
  privacyCheck: {
    rawEvidenceVisible: containsPrivateEvidence(
      { recruiterView, disclosureReceipt },
      [privatePaySlip, privateResume],
    ),
    note: "Receipt reveals approved precise claim only; raw evidence body remains outside recruiter flows.",
  },
};

assert(
  output.commitmentsVerified.every(Boolean),
  "Midnight claim commitment verification failed",
);
assert(output.disclosureReceiptVerified, "Midnight disclosure receipt verification failed");
assert(
  output.privacyCheck.rawEvidenceVisible === false,
  "Recruiter-visible proof output leaked raw private evidence",
);
assert(
  containsPrivateEvidence(recruiterView, [
    privatePaySlip,
    privateResume,
    "INR 44.2L gross annual cash compensation",
    "BluePeak Labs, 38-person seed startup",
  ]) === false,
  "Recruiter view leaked precise claim or raw evidence",
);

console.log(JSON.stringify(output, null, 2));
