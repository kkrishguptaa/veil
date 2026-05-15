import { createHash } from "node:crypto";
import { createLocalMidnightPrivacyBoundary } from "../privacy/midnight-private-verification";
import type { CandidateVault, DisclosureGrant, RecruiterView } from "./domain";
import { buildAnonymousRecruiterView } from "./privacy";
import {
  evidenceDocumentToMidnightWitness,
  fingerprintDisclosureGrantRequest,
  materializeVerifiedClaimMidnight,
} from "./midnight-helpers";

const seedNow = () => "2026-05-16T09:20:00.000Z";
const seedBoundary = createLocalMidnightPrivacyBoundary({ now: seedNow });
const fixtureViewId = (candidateId: string) => `view-${candidateId}-seed`;

function fixtureSalt(claimId: string): string {
  return createHash("sha256").update(`fixture-salt:${claimId}`).digest("hex");
}

export function materializeMidnightForVault(vault: CandidateVault): CandidateVault {
  const witnessByDocId = new Map(
    vault.evidenceDocuments.map((document) => {
      const witness = evidenceDocumentToMidnightWitness(document);
      return [document.id, witness] as const;
    }),
  );

  const evidenceDocuments = vault.evidenceDocuments.map((document) => {
    const witness = witnessByDocId.get(document.id)!;
    return {
      ...document,
      midnightCommitment: `veil:evidence:${witness.bodyHash}`,
    };
  });

  const verifiedClaims = vault.verifiedClaims.map((claim) => {
    const witnesses = claim.evidenceIds
      .map((evidenceId) => witnessByDocId.get(evidenceId))
      .filter((value): value is NonNullable<typeof value> => Boolean(value));
    if (witnesses.length === 0) {
      throw new Error(`fixture claim ${claim.id} is missing evidence witnesses`);
    }
    const commitment = materializeVerifiedClaimMidnight(claim, witnesses, fixtureSalt(claim.id));
    return {
      ...claim,
      midnightCommitment: commitment.publicClaim.commitment,
      midnightPrivateClaim: commitment.privateClaim,
      midnightPublicClaim: commitment.publicClaim,
    };
  });

  return {
    ...vault,
    evidenceDocuments,
    verifiedClaims,
  };
}

export function sealRecruiterViewForSeed(vault: CandidateVault): RecruiterView {
  const base = buildAnonymousRecruiterView(vault);
  const publicClaims = vault.verifiedClaims
    .map((claim) => claim.midnightPublicClaim)
    .filter((claim): claim is NonNullable<typeof claim> => Boolean(claim));
  if (publicClaims.length === 0) {
    return base;
  }

  const viewId = fixtureViewId(vault.candidateId);
  const approval = seedBoundary.approveRecruiterView({
    viewId,
    candidateId: vault.candidateId,
    publicClaims,
    candidateApprovedBy: vault.candidateId,
  });

  return {
    ...base,
    recruiterViewId: approval.viewId,
    midnightRecruiterViewCommitment: approval.midnight.recruiterViewCommitment,
    visibleReceipts: [...approval.claimCommitments],
  };
}

export function buildFixtureDisclosureGrants(vaults: CandidateVault[]): DisclosureGrant[] {
  const now = "2026-05-16T09:20:00.000Z";
  const v7 = vaults.find((vault) => vault.candidateId === "candidate-7kq");
  if (!v7) {
    throw new Error("expected candidate-7kq fixture vault");
  }

  const viewId = fixtureViewId("candidate-7kq");
  const leadershipGrantId = "grant-7kq-leadership-northstar";
  const tenureGrantId = "grant-7kq-tenure-northstar";
  const performanceGrantId = "grant-7kq-performance-contoso";

  const leadershipFingerprint = fingerprintDisclosureGrantRequest({
    grantId: leadershipGrantId,
    recruiterId: "recruiter-northstar",
    recruiterViewId: viewId,
    claimId: "claim-7kq-leadership",
    requestedFields: ["preciseValue"],
  });

  const tenureClaim = v7.verifiedClaims.find((claim) => claim.id === "claim-7kq-tenure");
  if (!tenureClaim?.midnightPrivateClaim || !tenureClaim.midnightPublicClaim) {
    throw new Error("fixture tenure claim missing Midnight artifacts");
  }

  const tenureRequest = seedBoundary.requestDisclosureGrant({
    grantId: tenureGrantId,
    recruiterId: "recruiter-northstar",
    recruiterViewId: viewId,
    claimId: "claim-7kq-tenure",
    requestedFields: ["preciseValue"],
  });
  const tenureReceipt = seedBoundary.approveDisclosureGrant({
    grantRequest: tenureRequest,
    privateClaim: tenureClaim.midnightPrivateClaim,
    publicClaim: tenureClaim.midnightPublicClaim,
    candidateApprovedBy: "candidate-7kq",
  });

  const performanceRequest = seedBoundary.requestDisclosureGrant({
    grantId: performanceGrantId,
    recruiterId: "recruiter-contoso",
    recruiterViewId: viewId,
    claimId: "claim-7kq-performance",
    requestedFields: ["preciseValue"],
  });

  const performanceDeniedReceipt = createHash("sha256")
    .update(`veil.grant-denied:${canonicalGrantDeniedPayload(performanceRequest)}`)
    .digest("hex");

  return [
    {
      id: leadershipGrantId,
      candidateId: "candidate-7kq",
      recruiterId: "recruiter-northstar",
      recruiterName: "Northstar Robotics",
      claimId: "claim-7kq-leadership",
      state: "requested",
      requestedAt: now,
      midnightReceipt: `midnight:grant-request:${leadershipFingerprint.slice(0, 24)}`,
    },
    {
      id: tenureGrantId,
      candidateId: "candidate-7kq",
      recruiterId: "recruiter-northstar",
      recruiterName: "Northstar Robotics",
      claimId: "claim-7kq-tenure",
      state: "approved",
      requestedAt: "2026-05-16T09:30:00.000Z",
      decidedAt: "2026-05-16T09:35:00.000Z",
      midnightReceipt: tenureReceipt.midnight.receiptCommitment,
    },
    {
      id: performanceGrantId,
      candidateId: "candidate-7kq",
      recruiterId: "recruiter-contoso",
      recruiterName: "Contoso Talent",
      claimId: "claim-7kq-performance",
      state: "denied",
      requestedAt: "2026-05-16T09:40:00.000Z",
      decidedAt: "2026-05-16T09:44:00.000Z",
      midnightReceipt: `midnight:grant-denied:${performanceDeniedReceipt.slice(0, 24)}`,
    },
  ];
}

function canonicalGrantDeniedPayload(request: ReturnType<typeof seedBoundary.requestDisclosureGrant>) {
  return JSON.stringify({
    grantId: request.grantId,
    recruiterId: request.recruiterId,
    claimId: request.claimId,
  });
}
