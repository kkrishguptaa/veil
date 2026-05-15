export const claimKinds = [
  "role-family",
  "skills",
  "seniority",
  "startup-exposure",
  "compensation-band",
  "leadership-scope",
  "employment-tenure",
  "education-credential",
  "performance-tier",
] as const;

export type ClaimKind = (typeof claimKinds)[number];

export type EvidenceDocumentKind =
  | "resume"
  | "offer-letter"
  | "pay-statement"
  | "performance-review"
  | "education-record"
  | "linkedin-export"
  | "certificate"
  | "other";

export type PrivacyLevel = "coarse" | "precise" | "sealed";

export type DisclosureState = "requested" | "approved" | "denied";

export type AuditAction =
  | "evidence.uploaded"
  | "ai.extracted"
  | "claim.created"
  | "recruiter-view.approved"
  | "recruiter-search.visible"
  | "disclosure.requested"
  | "disclosure.approved"
  | "disclosure.denied"
  | "claim.upgraded";

export interface EvidenceDocument {
  id: string;
  candidateId: string;
  title: string;
  kind: EvidenceDocumentKind;
  uploadedAt: string;
  rawText: string;
  privateSummary: string;
  midnightCommitment: string;
}

export interface VerifiedClaim {
  id: string;
  candidateId: string;
  kind: ClaimKind;
  label: string;
  coarseValue: string;
  preciseValue: string;
  privacyLevel: PrivacyLevel;
  confidence: number;
  evidenceIds: string[];
  midnightCommitment: string;
}

export type RecruiterVisibleClaim = Omit<VerifiedClaim, "preciseValue">;

export interface CandidateVault {
  candidateId: string;
  legalName: string;
  anonymousHandle: string;
  approvedForDiscovery: boolean;
  evidenceDocuments: EvidenceDocument[];
  verifiedClaims: VerifiedClaim[];
  aiSummary: string;
}

export interface RecruiterView {
  candidateId: string;
  anonymousHandle: string;
  approvedForDiscovery: boolean;
  aiSummary: string;
  coarseClaims: RecruiterVisibleClaim[];
  gatedClaimKinds: ClaimKind[];
  visibleReceipts: string[];
}

export interface RecruiterSearchResult {
  view: RecruiterView;
  matchScore: number;
  explanation: string[];
}

export interface DisclosureGrant {
  id: string;
  candidateId: string;
  recruiterId: string;
  recruiterName: string;
  claimId: string;
  state: DisclosureState;
  requestedAt: string;
  decidedAt?: string;
  midnightReceipt: string;
}

export interface AuditEvent {
  id: string;
  candidateId: string;
  actor: "candidate" | "recruiter" | "veil";
  action: AuditAction;
  targetId: string;
  timestamp: string;
  receipt?: string;
}
