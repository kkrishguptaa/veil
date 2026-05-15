import { describe, expect, it } from "vitest";
import type { CandidateVault, VerifiedClaim } from "../domain";
import { candidateVaults } from "../fixtures";
import { parseRecruiterSearchIntent, searchRecruiterViews } from "../matching";

describe("recruiter matching", () => {
  it("ranks approved anonymous views for the backend startup compensation query", () => {
    const results = searchRecruiterViews(
      candidateVaults,
      "Find backend engineers with startup experience and compensation under INR 50L",
    );

    expect(results[0].view.anonymousHandle).toBe("Anonymous Candidate 7KQ");
    expect(results[0].matchScore).toBeGreaterThan(results[1].matchScore);
    expect(results.map((result) => result.view.anonymousHandle)).not.toContain("Anonymous Candidate 4PX");
  });

  it("keeps exact pay and legal identity out of recruiter search results", () => {
    const results = searchRecruiterViews(
      candidateVaults,
      "Find backend engineers with startup experience and compensation under INR 50L",
    );
    const serialized = JSON.stringify(results);

    expect(serialized).not.toContain("Priya Raman");
    expect(serialized).not.toContain("INR 46L exact cash");
    expect(serialized).not.toContain("Northstar Robotics offer");
  });

  it("parses budget ceilings instead of hard-coding INR 50L", () => {
    const under50 = searchRecruiterViews(
      candidateVaults,
      "Find backend platform engineers with startup experience and budget under INR 50L",
    );
    const under65 = searchRecruiterViews(
      candidateVaults,
      "Find backend platform engineers with startup experience and budget up to INR 65L",
    );

    const under50Scores = new Map(
      under50.map((result) => [result.view.anonymousHandle, result.matchScore]),
    );
    const under65Scores = new Map(
      under65.map((result) => [result.view.anonymousHandle, result.matchScore]),
    );

    expect(under50Scores.get("Anonymous Candidate 7KQ")).toBeGreaterThan(
      under50Scores.get("Anonymous Candidate 2VM") ?? 0,
    );
    expect(under65Scores.get("Anonymous Candidate 2VM")).toBeGreaterThan(
      under50Scores.get("Anonymous Candidate 2VM") ?? 0,
    );
  });

  it("parses recruiter budget variants robustly", () => {
    expect(parseRecruiterSearchIntent("backend under ₹50L").maxCompensationLakh).toBe(50);
    expect(parseRecruiterSearchIntent("platform budget INR 48 lakh").maxCompensationLakh).toBe(48);
    expect(parseRecruiterSearchIntent("engineer less than Rs 5000000").maxCompensationLakh).toBe(50);
  });

  it("matches requested role and startup stage from coarse claims", () => {
    const vaults = [
      makeVault("candidate-backend-seed", "Backend Seed", [
        claim("candidate-backend-seed", "role-family", "Backend platform engineering", 0.92),
        claim("candidate-backend-seed", "startup-exposure", "seed-stage startup exposure", 0.9),
        claim("candidate-backend-seed", "compensation-band", "INR 45L-55L target cash", 0.8),
      ]),
      makeVault("candidate-mobile-growth", "Mobile Growth", [
        claim("candidate-mobile-growth", "role-family", "Mobile engineering", 0.92),
        claim("candidate-mobile-growth", "startup-exposure", "growth-stage startup exposure", 0.9),
        claim("candidate-mobile-growth", "compensation-band", "INR 45L-55L target cash", 0.8),
      ]),
    ];

    const results = searchRecruiterViews(
      vaults,
      "Need backend platform engineer with seed startup experience under INR 60L",
    );

    expect(results[0].view.anonymousHandle).toBe("Backend Seed");
    expect(results[0].matchScore).toBeGreaterThan(results[1].matchScore);
  });

  it("parses recruiter budget variants robustly", () => {
    expect(parseRecruiterSearchIntent("backend under ₹50L").maxCompensationLakh).toBe(50);
    expect(parseRecruiterSearchIntent("platform budget INR 48 lakh").maxCompensationLakh).toBe(48);
    expect(parseRecruiterSearchIntent("engineer less than Rs 5000000").maxCompensationLakh).toBe(50);
  });
});

function makeVault(
  candidateId: string,
  anonymousHandle: string,
  verifiedClaims: VerifiedClaim[],
): CandidateVault {
  return {
    candidateId,
    legalName: `${anonymousHandle} Legal Name`,
    anonymousHandle,
    approvedForDiscovery: true,
    evidenceDocuments: [],
    verifiedClaims,
    aiSummary: "Synthetic recruiter matching fixture.",
  };
}

function claim(
  candidateId: string,
  kind: VerifiedClaim["kind"],
  coarseValue: string,
  confidence: number,
): VerifiedClaim {
  return {
    id: `claim-${candidateId}-${kind}`,
    candidateId,
    kind,
    label: kind,
    coarseValue,
    preciseValue: `${coarseValue} precise detail`,
    privacyLevel: "coarse",
    confidence,
    evidenceIds: [],
    provenance: [],
    privacyPolicy: {
      defaultVisibility: "recruiter-view",
      preciseClaimRequiresDisclosureGrant: true,
      rawEvidenceVisibleToRecruiter: false,
    },
    extractionNotes: "Synthetic claim.",
    source: "fixture",
    midnightCommitment: `midnight:claim:${candidateId}:${kind}`,
  };
}
