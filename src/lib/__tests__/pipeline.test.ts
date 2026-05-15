import { describe, expect, it } from "vitest";
import type { EvidenceDocument } from "../domain";
import {
  classifyEvidenceDocument,
  extractClaimsFromEvidence,
  rejectUnsafeIntelligence,
} from "../pipeline";

const document: EvidenceDocument = {
  id: "doc-test",
  candidateId: "candidate-test",
  title: "Flexible evidence upload",
  kind: "other",
  uploadedAt: "2026-05-16T09:00:00.000Z",
  rawText:
    "Offer letter for backend platform role at Series B startup. TypeScript, privacy systems, INR 48L cash, led launch team. Master degree.",
  privateSummary: "Private source text for extraction.",
  midnightCommitment: "midnight:commitment:test",
};

describe("AI intelligence pipeline scaffold", () => {
  it("classifies flexible evidence documents", () => {
    expect(classifyEvidenceDocument(document)).toBe("offer-letter");
  });

  it("extracts structured claims inside the supported taxonomy", () => {
    const claims = extractClaimsFromEvidence("candidate-test", [document]);
    const kinds = claims.map((claim) => claim.kind);

    expect(kinds).toContain("role-family");
    expect(kinds).toContain("startup-exposure");
    expect(kinds).toContain("compensation-band");
    expect(kinds).toContain("leadership-scope");
    expect(claims.every((claim) => claim.evidenceIds.includes("doc-test"))).toBe(true);
  });

  it("rejects unsafe recruiting intelligence outputs", () => {
    expect(rejectUnsafeIntelligence("Strong culture fit and personality score")).toBe(false);
    expect(rejectUnsafeIntelligence("Backend systems claim supported by offer letter")).toBe(true);
  });
});
