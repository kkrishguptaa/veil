import { describe, expect, it } from "vitest";
import { candidateVaults } from "../fixtures";
import { searchRecruiterViews } from "../matching";

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
});
