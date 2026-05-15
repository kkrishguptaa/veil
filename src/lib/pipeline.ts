import { claimKinds, type ClaimKind, type EvidenceDocument, type VerifiedClaim } from "./domain";

const blockedOutputs = [
  "culture fit",
  "personality",
  "protected trait",
  "demographic",
  "psychometric",
];

export function classifyEvidenceDocument(document: Pick<EvidenceDocument, "kind" | "rawText">) {
  const text = document.rawText.toLowerCase();

  if (document.kind !== "other") return document.kind;
  if (text.includes("offer") || text.includes("cash") || text.includes("equity")) return "offer-letter";
  if (text.includes("performance") || text.includes("manager notes")) return "performance-review";
  if (text.includes("master") || text.includes("degree")) return "education-record";
  if (text.includes("linkedin")) return "linkedin-export";

  return "other";
}

export function extractClaimsFromEvidence(
  candidateId: string,
  documents: EvidenceDocument[],
): VerifiedClaim[] {
  const text = documents.map((document) => document.rawText).join(" ").toLowerCase();
  const evidenceIds = documents.map((document) => document.id);
  const claims: VerifiedClaim[] = [];

  if (hasAny(text, ["backend", "platform"])) {
    claims.push(makeClaim(candidateId, "role-family", "Role family", "Backend engineering", "Backend platform engineer", 0.86, evidenceIds));
  }

  if (hasAny(text, ["typescript", "distributed", "java", "kotlin", "privacy"])) {
    claims.push(makeClaim(candidateId, "skills", "Skills", "Backend systems and privacy engineering", "Specific language and systems evidence", 0.84, evidenceIds));
  }

  if (hasAny(text, ["series a", "series b", "series c", "startup"])) {
    claims.push(makeClaim(candidateId, "startup-exposure", "Startup exposure", "Series A-C operating history", "Exact company stage and employer", 0.82, evidenceIds));
  }

  if (text.includes("inr")) {
    claims.push(makeClaim(candidateId, "compensation-band", "Compensation band", "INR 40L-50L target cash", "Exact cash amount gated", 0.8, evidenceIds));
  }

  if (hasAny(text, ["led", "managed"])) {
    claims.push(makeClaim(candidateId, "leadership-scope", "Leadership scope", "Led multi-person delivery", "Exact team size and project", 0.78, evidenceIds, "precise"));
  }

  if (hasAny(text, ["master", "degree"])) {
    claims.push(makeClaim(candidateId, "education-credential", "Education credential", "Graduate technical degree", "Institution and legal name gated", 0.76, evidenceIds));
  }

  return claims.filter((claim) => claimKinds.includes(claim.kind));
}

export function rejectUnsafeIntelligence(output: string) {
  const normalized = output.toLowerCase();
  return !blockedOutputs.some((blocked) => normalized.includes(blocked));
}

function makeClaim(
  candidateId: string,
  kind: ClaimKind,
  label: string,
  coarseValue: string,
  preciseValue: string,
  confidence: number,
  evidenceIds: string[],
  privacyLevel: VerifiedClaim["privacyLevel"] = "coarse",
): VerifiedClaim {
  return {
    id: `claim-${candidateId}-${kind}`,
    candidateId,
    kind,
    label,
    coarseValue,
    preciseValue,
    privacyLevel,
    confidence,
    evidenceIds,
    midnightCommitment: `midnight:claim:${candidateId}:${kind}`,
  };
}

function hasAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}
