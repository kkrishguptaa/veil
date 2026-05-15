import {
  claimKinds,
  type ClaimKind,
  type CandidateVault,
  type EvidenceDocument,
  type EvidenceDocumentKind,
  type VerifiedClaim,
} from "./domain";

const blockedOutputs = [
  "culture fit",
  "personality",
  "protected trait",
  "demographic",
  "psychometric",
];

export interface AiIntelligenceProvider {
  name: string;
  classify(document: EvidenceDocument): EvidenceDocumentKind;
  extract(candidateId: string, documents: EvidenceDocument[]): VerifiedClaim[];
  summarize(candidateId: string, claims: VerifiedClaim[]): string;
}

export interface PipelineRun {
  provider: string;
  candidateId: string;
  classifications: Array<{
    documentId: string;
    kind: EvidenceDocumentKind;
  }>;
  claims: VerifiedClaim[];
  summary: string;
}

export function createLocalDeterministicProvider(): AiIntelligenceProvider {
  return {
    name: "local-deterministic-ai-intelligence-provider",
    classify: classifyEvidenceDocument,
    extract: extractClaimsFromEvidence,
    summarize: summarizeCandidateIntelligence,
  };
}

export function runAiIntelligencePipeline(
  candidateId: string,
  documents: EvidenceDocument[],
  provider: AiIntelligenceProvider = createLocalDeterministicProvider(),
): PipelineRun {
  const classifications = documents.map((document) => ({
    documentId: document.id,
    kind: provider.classify(document),
  }));
  const claims = provider.extract(candidateId, documents).filter((claim) =>
    rejectUnsafeIntelligence(`${claim.label} ${claim.coarseValue} ${claim.preciseValue}`),
  );

  return {
    provider: provider.name,
    candidateId,
    classifications,
    claims,
    summary: provider.summarize(candidateId, claims),
  };
}

export function buildVaultFromEvidence(input: {
  candidateId: string;
  legalName: string;
  anonymousHandle: string;
  approvedForDiscovery: boolean;
  evidenceDocuments: EvidenceDocument[];
  provider?: AiIntelligenceProvider;
}): CandidateVault {
  const run = runAiIntelligencePipeline(input.candidateId, input.evidenceDocuments, input.provider);

  return {
    candidateId: input.candidateId,
    legalName: input.legalName,
    anonymousHandle: input.anonymousHandle,
    approvedForDiscovery: input.approvedForDiscovery,
    evidenceDocuments: input.evidenceDocuments,
    verifiedClaims: run.claims,
    aiSummary: run.summary,
  };
}

export function classifyEvidenceDocument(document: Pick<EvidenceDocument, "kind" | "rawText">): EvidenceDocumentKind {
  const text = document.rawText.toLowerCase();

  if (document.kind !== "other") return document.kind;
  if (text.includes("offer") || text.includes("cash") || text.includes("equity")) return "offer-letter";
  if (hasAny(text, ["pay slip", "compensation", "salary", "cash inr", "inr"])) return "pay-statement";
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

  if (hasAny(text, ["backend", "platform", "distributed"])) {
    claims.push(makeClaim(candidateId, documents, "role-family", "Role family", "Backend engineering", "Backend platform engineer", 0.86, evidenceIds));
  }

  if (hasAny(text, ["typescript", "distributed", "java", "kotlin", "privacy"])) {
    claims.push(makeClaim(candidateId, documents, "skills", "Skills", extractSkillBand(text), "Specific language and systems evidence", 0.84, evidenceIds));
  }

  if (hasAny(text, ["staff", "principal", "senior", "lead"])) {
    claims.push(makeClaim(candidateId, documents, "seniority", "Seniority", seniorityBand(text), "Exact title and leveling evidence", 0.81, evidenceIds));
  }

  if (hasAny(text, ["series a", "series b", "series c", "startup"])) {
    claims.push(makeClaim(candidateId, documents, "startup-exposure", "Startup exposure", "Series A-C operating history", "Exact company stage and employer", 0.82, evidenceIds));
  }

  if (text.includes("inr")) {
    claims.push(makeClaim(candidateId, documents, "compensation-band", "Compensation band", compensationBand(text), "Exact cash amount gated", 0.8, evidenceIds));
  }

  if (hasAny(text, ["led", "managed", "team of"])) {
    claims.push(makeClaim(candidateId, documents, "leadership-scope", "Leadership scope", "Led multi-person delivery", "Exact team size and project", 0.78, evidenceIds, "precise"));
  }

  if (hasAny(text, ["years tenure", "year recent tenure", "years in role", "months"])) {
    claims.push(makeClaim(candidateId, documents, "employment-tenure", "Employment tenure", "Stable 3+ year recent tenure", "Exact tenure and employer dates", 0.74, evidenceIds, "precise"));
  }

  if (hasAny(text, ["master", "degree"])) {
    claims.push(makeClaim(candidateId, documents, "education-credential", "Education credential", "Graduate technical degree", "Institution and legal name gated", 0.76, evidenceIds));
  }

  if (hasAny(text, ["exceeded expectations", "top performance", "performance band"])) {
    claims.push(makeClaim(candidateId, documents, "performance-tier", "Performance tier", "Top performance band", "Exact review text and cycles gated", 0.79, evidenceIds, "precise"));
  }

  return claims.filter((claim) => claimKinds.includes(claim.kind));
}

export function rejectUnsafeIntelligence(output: string): boolean {
  const normalized = output.toLowerCase();
  return !blockedOutputs.some((blocked) => normalized.includes(blocked));
}

export function summarizeCandidateIntelligence(_candidateId: string, claims: VerifiedClaim[]): string {
  const values = new Map(claims.map((claim) => [claim.kind, claim.coarseValue]));
  const role = values.get("role-family") ?? "Private candidate";
  const skills = values.get("skills") ?? "document-backed skills";
  const startup = values.get("startup-exposure") ? "startup exposure" : "private professional evidence";
  const compensation = values.get("compensation-band") ?? "compensation band hidden";

  return `${role} with ${skills}, ${startup}, and ${compensation}. Raw evidence remains inside the Trusted Extraction Boundary.`;
}

function makeClaim(
  candidateId: string,
  documents: EvidenceDocument[],
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
    provenance: documents
      .filter((document) => evidenceIds.includes(document.id))
      .map((document) => ({
        evidenceId: document.id,
        documentKind: document.kind,
        support: "direct" as const,
      })),
    privacyPolicy: {
      defaultVisibility: privacyLevel === "coarse" ? "recruiter-view" : "gated",
      preciseClaimRequiresDisclosureGrant: true,
      rawEvidenceVisibleToRecruiter: false,
    },
    extractionNotes: `${label} extracted by deterministic local provider from ${evidenceIds.length} private evidence document(s).`,
    source: "ai-intelligence-pipeline",
    midnightCommitment: `midnight:claim:${candidateId}:${kind}`,
  };
}

function hasAny(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(term));
}

function extractSkillBand(text: string): string {
  const skills = [
    ["typescript", "TypeScript"],
    ["distributed", "distributed systems"],
    ["privacy", "privacy engineering"],
    ["java", "Java"],
    ["kotlin", "Kotlin"],
  ]
    .filter(([needle]) => text.includes(needle))
    .map(([, label]) => label);

  return skills.length > 0 ? skills.join(", ") : "Document-backed backend systems";
}

function seniorityBand(text: string): string {
  if (hasAny(text, ["staff", "principal"])) return "Senior+";
  if (hasAny(text, ["senior", "lead"])) return "Senior";
  return "Experienced";
}

function compensationBand(text: string): string {
  const lakhMatch = text.match(/inr\s*(\d+(?:\.\d+)?)\s*l/i);
  if (lakhMatch) {
    const lakh = Number(lakhMatch[1]);
    if (lakh < 40) return "INR 30L-40L target cash";
    if (lakh <= 50) return "INR 40L-50L target cash";
    if (lakh <= 65) return "INR 55L-65L target cash";
  }

  const rupeeMatch = text.match(/inr\s*(\d{7,})/i);
  if (rupeeMatch) {
    const lakh = Number(rupeeMatch[1]) / 100000;
    if (lakh <= 50) return "INR 40L-50L target cash";
    if (lakh <= 65) return "INR 55L-65L target cash";
  }

  return "INR banded compensation";
}
