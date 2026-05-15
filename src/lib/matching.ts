import type {
  CandidateVault,
  ClaimKind,
  RecruiterSearchResult,
  RecruiterView,
  RecruiterVisibleClaim,
} from "./domain";
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

export interface RecruiterSearchIntent {
  normalizedQuery: string;
  wantsBackend: boolean;
  wantsStartup: boolean;
  desiredSkills: string[];
  maxCompensationLakh: number | null;
}

interface ParsedRecruiterQuery {
  normalized: string;
  roleFamilies: Set<"backend" | "frontend" | "fullstack" | "mobile" | "manager">;
  skills: Set<string>;
  startupStages: Set<"seed" | "series-a" | "series-b" | "series-c" | "growth">;
  wantsStartup: boolean;
  seniority: Set<"senior" | "staff" | "principal" | "lead">;
  budget?: {
    maxLakh: number;
  };
}

export function searchRecruiterViews(
  vaults: CandidateVault[],
  query: string,
): RecruiterSearchResult[] {
  return searchApprovedRecruiterViews(
    vaults
      .filter((vault) => vault.approvedForDiscovery)
      .map(buildAnonymousRecruiterView),
    query,
  );
}

export function searchApprovedRecruiterViews(
  views: RecruiterView[],
  query: string,
): RecruiterSearchResult[] {
  const parsedQuery = parseRecruiterQuery(query);

  return views
    .filter((view) => view.approvedForDiscovery)
    .map((view) => {
      const explanation: string[] = [];
      let score = 0;

      for (const claim of view.coarseClaims) {
        const contribution = scoreClaim(parsedQuery, claim);
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

export function parseRecruiterSearchIntent(query: string): RecruiterSearchIntent {
  const parsed = parseRecruiterQuery(query);

  return {
    normalizedQuery: parsed.normalized,
    wantsBackend: parsed.roleFamilies.has("backend"),
    wantsStartup: parsed.wantsStartup,
    desiredSkills: [...parsed.skills],
    maxCompensationLakh: parsed.budget?.maxLakh ?? null,
  };
}

function scoreClaim(query: ParsedRecruiterQuery, claim: RecruiterVisibleClaim) {
  const claimText = claim.coarseValue.toLowerCase();
  const base = queryWeights[claim.kind] * claim.confidence;

  if (claim.kind === "role-family") {
    return roleMatches(query, claimText) ? base : 0;
  }
  if (claim.kind === "skills" && skillMatches(query, claimText)) return base;
  if (claim.kind === "startup-exposure" && startupMatches(query, claimText)) return base;
  if (claim.kind === "compensation-band") {
    return compensationMatches(query, claim.coarseValue) ? base : base * 0.15;
  }
  if (claim.kind === "seniority" && seniorityMatches(query, claimText)) return base;
  if (claim.kind === "leadership-scope" && hasAny(query.normalized, ["led", "lead", "managed", "manager"])) return base;
  if (claim.kind === "employment-tenure" && hasAny(query.normalized, ["stable", "tenure", "retention"])) return base;

  return 0;
}

function parseRecruiterQuery(query: string): ParsedRecruiterQuery {
  const normalized = normalizeCurrency(query);

  return {
    normalized,
    roleFamilies: new Set([
      ...(hasAny(normalized, ["backend", "platform", "api"]) ? ["backend" as const] : []),
      ...(hasAny(normalized, ["frontend", "react", "web"]) ? ["frontend" as const] : []),
      ...(hasAny(normalized, ["fullstack", "full-stack"]) ? ["fullstack" as const] : []),
      ...(hasAny(normalized, ["mobile", "react native", "ios", "android"]) ? ["mobile" as const] : []),
      ...(hasAny(normalized, ["manager", "management", "em"]) ? ["manager" as const] : []),
    ]),
    skills: new Set(
      ["typescript", "distributed", "privacy", "api", "java", "kotlin", "react", "postgres", "aws"].filter(
        (skill) => normalized.includes(skill),
      ),
    ),
    startupStages: parseStartupStages(normalized),
    wantsStartup: hasAny(normalized, ["startup", "scaleup", "founding", "venture"]),
    seniority: new Set(
      (["senior", "staff", "principal", "lead"] as const).filter((term) =>
        normalized.includes(term),
      ),
    ),
    budget: parseBudget(normalized),
  };
}

function roleMatches(query: ParsedRecruiterQuery, claimText: string) {
  if (query.roleFamilies.size === 0) return true;

  return (
    (query.roleFamilies.has("backend") && hasAny(claimText, ["backend", "platform", "api"])) ||
    (query.roleFamilies.has("frontend") && hasAny(claimText, ["frontend", "react", "web"])) ||
    (query.roleFamilies.has("fullstack") && hasAny(claimText, ["fullstack", "full-stack"])) ||
    (query.roleFamilies.has("mobile") && hasAny(claimText, ["mobile", "react native", "ios", "android"])) ||
    (query.roleFamilies.has("manager") && hasAny(claimText, ["manager", "management"]))
  );
}

function skillMatches(query: ParsedRecruiterQuery, claimText: string) {
  if (query.skills.size === 0) return true;

  return [...query.skills].some((skill) => claimText.includes(skill));
}

function startupMatches(query: ParsedRecruiterQuery, claimText: string) {
  if (!query.wantsStartup && query.startupStages.size === 0) return false;
  if (!hasAny(claimText, ["startup", "series", "growth", "seed"])) return false;
  if (query.startupStages.size === 0) return true;

  const claimStages = parseStartupStages(claimText);
  if (claimText.includes("series a-c")) {
    claimStages.add("series-a");
    claimStages.add("series-b");
    claimStages.add("series-c");
  }

  return [...query.startupStages].some((stage) => claimStages.has(stage));
}

function seniorityMatches(query: ParsedRecruiterQuery, claimText: string) {
  if (query.seniority.size === 0) return true;

  return [...query.seniority].some((level) => claimText.includes(level));
}

function compensationMatches(query: ParsedRecruiterQuery, claimValue: string) {
  const range = parseCompensationRange(claimValue);
  if (!range || !query.budget) return Boolean(range);

  return range.upperLakh <= query.budget.maxLakh;
}

function parseBudget(normalizedQuery: string) {
  const lakhMatch = normalizedQuery.match(
    /(?:under|below|up to|upto|<=|less than|max(?:imum)?|within|budget)\s*(?:inr|rs\.?|rupees)?\s*(\d+(?:\.\d+)?)\s*(?:l|lakh|lakhs)/,
  );
  if (lakhMatch) {
    return { maxLakh: Number(lakhMatch[1]) };
  }

  const rupeeMatch = normalizedQuery.match(
    /(?:under|below|up to|upto|<=|less than|max(?:imum)?|within|budget)\s*(?:inr|rs\.?|rupees)?\s*(\d{7,})/,
  );
  if (rupeeMatch) {
    return { maxLakh: Number(rupeeMatch[1]) / 100000 };
  }

  const bareBudget = normalizedQuery.match(
    /(?:under|below|up to|upto|<=|less than|max(?:imum)?|within|budget)\s*(\d+(?:\.\d+)?)\b/,
  );
  if (bareBudget) {
    return { maxLakh: Number(bareBudget[1]) };
  }

  return undefined;
}

function parseCompensationRange(value: string) {
  const normalized = normalizeCurrency(value);
  const rangeMatch = normalized.match(/(?:inr|rs\.?)?\s*(\d+(?:\.\d+)?)\s*l\s*-\s*(\d+(?:\.\d+)?)\s*l/);
  if (rangeMatch) {
    return {
      lowerLakh: Number(rangeMatch[1]),
      upperLakh: Number(rangeMatch[2]),
    };
  }

  const lakhMatch = normalized.match(/(?:inr|rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:l|lakh|lakhs)/);
  if (lakhMatch) {
    const lakh = Number(lakhMatch[1]);
    return { lowerLakh: lakh, upperLakh: lakh };
  }

  return undefined;
}

function parseStartupStages(value: string) {
  const stages = new Set<"seed" | "series-a" | "series-b" | "series-c" | "growth">();
  if (hasAny(value, ["seed", "pre-seed"])) stages.add("seed");
  if (hasAny(value, ["series a", "series-a"])) stages.add("series-a");
  if (hasAny(value, ["series b", "series-b"])) stages.add("series-b");
  if (hasAny(value, ["series c", "series-c"])) stages.add("series-c");
  if (hasAny(value, ["growth", "scaleup", "scale-up"])) stages.add("growth");
  return stages;
}

function hasAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function normalizeCurrency(value: string) {
  return value
    .toLowerCase()
    .replace(/₹/g, "inr ")
    .replace(/\brs\.?/g, "inr")
    .replace(/\blpa\b/g, "l")
    .replace(/\blakhs\b/g, "lakh")
    .replace(/,/g, "");
}
