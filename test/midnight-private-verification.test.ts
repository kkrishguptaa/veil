import { describe, expect, it } from "vitest";

import {
  containsPrivateEvidence,
  createLocalMidnightPrivacyBoundary,
} from "../src/privacy/midnight-private-verification";

const boundary = createLocalMidnightPrivacyBoundary({
  now: () => "2026-05-16T00:00:00.000Z",
});

const rawPaySlip =
  "Pay slip: Mira Sen, exact employer Northstar AI, exact annual compensation INR 4,850,000.";
const rawResume =
  "Mira Sen led backend platform work at Northstar AI with TypeScript, Postgres, and AWS.";

function buildFixture() {
  const payEvidence = boundary.createEvidenceDocument({
    documentId: "doc_pay",
    candidateId: "candidate_mira",
    kind: "pay_slip",
    body: rawPaySlip,
  });
  const resumeEvidence = boundary.createEvidenceDocument({
    documentId: "doc_resume",
    candidateId: "candidate_mira",
    kind: "resume",
    body: rawResume,
  });

  const compensation = boundary.createVerifiedClaim({
    claimId: "claim_comp",
    candidateId: "candidate_mira",
    type: "compensation_band",
    coarseValue: "INR 40L-50L",
    preciseValue: "INR 48.5L annual compensation",
    confidence: 0.96,
    evidenceDocuments: [payEvidence],
    extractionSummary: "Pay evidence supports compensation band.",
    salt: "compensation-test-salt",
  });
  const skills = boundary.createVerifiedClaim({
    claimId: "claim_skills",
    candidateId: "candidate_mira",
    type: "skills",
    coarseValue: ["TypeScript", "Postgres", "AWS"],
    preciseValue: "Led backend platform work with TypeScript, Postgres, and AWS",
    confidence: 0.91,
    evidenceDocuments: [resumeEvidence],
    extractionSummary: "Resume evidence supports skill claims.",
    salt: "skills-test-salt",
  });

  return { compensation, skills };
}

describe("Midnight-backed private verification boundary", () => {
  it("creates verifiable claim commitments without exposing raw evidence", () => {
    const { compensation } = buildFixture();

    expect(
      boundary.verifyClaimCommitment({
        privateClaim: compensation.privateClaim,
        commitment: compensation.publicClaim.commitment,
      }),
    ).toBe(true);

    expect(
      containsPrivateEvidence(compensation.publicClaim, [rawPaySlip, rawResume, "Northstar AI"]),
    ).toBe(false);
  });

  it("detects tampered precise claims against the original commitment", () => {
    const { compensation } = buildFixture();
    const tamperedPrivateClaim = {
      ...compensation.privateClaim,
      preciseValue: "INR 25L annual compensation",
    };

    expect(
      boundary.verifyClaimCommitment({
        privateClaim: tamperedPrivateClaim,
        commitment: compensation.publicClaim.commitment,
      }),
    ).toBe(false);
  });

  it("requires candidate approval before building recruiter-visible views", () => {
    const { compensation, skills } = buildFixture();

    const recruiterView = boundary.approveRecruiterView({
      viewId: "view_mira",
      candidateId: "candidate_mira",
      candidateApprovedBy: "candidate_mira",
      publicClaims: [compensation.publicClaim, skills.publicClaim],
    });

    expect(recruiterView.status).toBe("approved");
    expect(recruiterView.publicClaims.map((claim) => claim.type)).toEqual([
      "compensation_band",
      "skills",
    ]);
    expect(
      containsPrivateEvidence(recruiterView, [
        rawPaySlip,
        rawResume,
        "Northstar AI",
        "INR 48.5L annual compensation",
      ]),
    ).toBe(false);
  });

  it("creates and verifies disclosure receipts for precise claim upgrades only", () => {
    const { compensation } = buildFixture();
    const recruiterView = boundary.approveRecruiterView({
      viewId: "view_mira",
      candidateId: "candidate_mira",
      candidateApprovedBy: "candidate_mira",
      publicClaims: [compensation.publicClaim],
    });
    const grantRequest = boundary.requestDisclosureGrant({
      grantId: "grant_comp",
      recruiterId: "recruiter_venture",
      recruiterViewId: recruiterView.viewId,
      claimId: compensation.publicClaim.claimId,
      requestedFields: ["preciseValue"],
      reason: "Confirm exact budget fit.",
    });

    const receipt = boundary.approveDisclosureGrant({
      grantRequest,
      privateClaim: compensation.privateClaim,
      publicClaim: compensation.publicClaim,
      candidateApprovedBy: "candidate_mira",
    });

    expect(receipt.status).toBe("approved");
    expect(receipt.disclosedClaim).toEqual({
      preciseValue: "INR 48.5L annual compensation",
    });
    expect(
      boundary.verifyDisclosureReceipt({
        receipt,
        privateClaim: compensation.privateClaim,
        publicClaim: compensation.publicClaim,
      }),
    ).toBe(true);
    expect(containsPrivateEvidence(receipt, [rawPaySlip, rawResume, "Northstar AI"])).toBe(false);
  });
});
