import type {
  AuditEvent,
  CandidateVault,
  DisclosureGrant,
  RecruiterView,
  VerifiedClaim,
} from "./domain";

export function buildAnonymousRecruiterView(vault: CandidateVault): RecruiterView {
  const coarseClaims = vault.verifiedClaims
    .filter((claim) => claim.privacyLevel === "coarse")
    .map(({ preciseValue: _preciseValue, ...claim }) => claim);
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
  input: Omit<DisclosureGrant, "id" | "state" | "requestedAt" | "midnightReceipt">,
): DisclosureGrant[] {
  return [
    ...grants,
    {
      ...input,
      id: `grant-${input.claimId}-${input.recruiterId}`,
      state: "requested",
      requestedAt: new Date(0).toISOString(),
      midnightReceipt: `midnight:grant-request:${input.claimId}:${input.recruiterId}`,
    },
  ];
}

export function decideDisclosureGrant(
  grants: DisclosureGrant[],
  grantId: string,
  decision: Extract<DisclosureGrant["state"], "approved" | "denied">,
): DisclosureGrant[] {
  return grants.map((grant) =>
    grant.id === grantId
      ? {
          ...grant,
          state: decision,
          decidedAt: new Date(0).toISOString(),
          midnightReceipt: `midnight:grant-${decision}:${grant.claimId}:${grant.recruiterId}`,
        }
      : grant,
  );
}

export function getCandidateAuditEvents(events: AuditEvent[], candidateId: string) {
  return events.filter((event) => event.candidateId === candidateId);
}
