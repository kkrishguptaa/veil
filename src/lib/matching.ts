import type { CandidateVault, ClaimKind, RecruiterSearchResult, RecruiterVisibleClaim } from "./domain";
import { buildAnonymousRecruiterView } from "./privacy";

const queryWeights: Record<ClaimKind, number> = {
  "role-family": 28,
  skills: 14,
  seniority: 6,
  "startup-exposure": 22,
  "compensation-band": 24,
  "leadership-scope": 4,
  "employment-tenure": 2,
  "education-credential": 0,
  "performance-tier": 0,
};

export function searchRecruiterViews(
  vaults: CandidateVault[],
  query: string,
): RecruiterSearchResult[] {
  return vaults
    .filter((vault) => vault.approvedForDiscovery)
    .map((vault) => {
      const view = buildAnonymousRecruiterView(vault);
      const explanation: string[] = [];
      let score = 0;

      for (const claim of view.coarseClaims) {
        const contribution = scoreClaim(query, claim);
        if (contribution > 0) {
          score += contribution;
          explanation.push(
            `${claim.label}: ${claim.coarseValue} (${Math.round(claim.confidence * 100)}% confidence, ${claim.evidenceIds.length} evidence ref${claim.evidenceIds.length === 1 ? "" : "s"})`,
          );
        }
      }

      return {
        view,
        matchScore: Math.min(99, Math.round(score)),
        explanation,
      };
    })
    .filter((result) => result.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

function scoreClaim(query: string, claim: RecruiterVisibleClaim) {
  const normalized = `${query} ${claim.coarseValue}`.toLowerCase();
  const base = queryWeights[claim.kind] * claim.confidence;

  if (claim.kind === "role-family" && normalized.includes("backend")) return base;
  if (claim.kind === "skills" && hasAny(normalized, ["typescript", "distributed", "privacy", "api", "java", "kotlin"])) return base;
  if (claim.kind === "startup-exposure" && normalized.includes("startup")) return base;
  if (claim.kind === "compensation-band") {
    return isUnderInr50L(claim.coarseValue) ? base : base * 0.2;
  }
  if (claim.kind === "seniority" && hasAny(normalized, ["senior", "staff"])) return base;
  if (claim.kind === "leadership-scope" && normalized.includes("led")) return base;
  if (claim.kind === "employment-tenure" && normalized.includes("stable")) return base;

  return 0;
}

function hasAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function isUnderInr50L(value: string) {
  const upperBound = value.match(/-(\d+)L/)?.[1] ?? value.match(/(\d+)L(?:\s|$)/)?.[1];
  return upperBound ? Number(upperBound) <= 50 : false;
}
