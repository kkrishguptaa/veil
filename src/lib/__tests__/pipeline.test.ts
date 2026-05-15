import { describe, expect, it } from "vitest";
import type { EvidenceDocument } from "../domain";
import { buildDemoVaultFromSubmittedEvidence } from "../demo-upload";
import {
  classifyEvidenceDocument,
  createLocalDeterministicProvider,
  extractClaimsFromEvidence,
  rejectUnsafeIntelligence,
  runAiIntelligencePipeline,
} from "../pipeline";

const document: EvidenceDocument = {
  id: "doc-test",
  candidateId: "candidate-test",
  title: "Flexible evidence upload",
  kind: "other",
  uploadedAt: "2026-05-16T09:00:00.000Z",
  rawText:
    "Offer letter for backend platform Staff role at Series B startup. TypeScript, privacy systems, INR 48L cash, led launch team across 3 years tenure. Master degree. Exceeded expectations performance band.",
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

    expect(kinds).toEqual([
      "role-family",
      "skills",
      "seniority",
      "startup-exposure",
      "compensation-band",
      "leadership-scope",
      "employment-tenure",
      "education-credential",
      "performance-tier",
    ]);
    expect(claims.every((claim) => claim.evidenceIds.includes("doc-test"))).toBe(true);
    expect(claims.every((claim) => claim.privacyPolicy.rawEvidenceVisibleToRecruiter === false)).toBe(true);
    expect(claims.every((claim) => claim.source === "ai-intelligence-pipeline")).toBe(true);
  });

  it("runs through a pluggable provider boundary", () => {
    const provider = createLocalDeterministicProvider();
    const run = runAiIntelligencePipeline("candidate-test", [document], provider);

    expect(run.provider).toBe("local-deterministic-ai-intelligence-provider");
    expect(run.classifications).toEqual([{ documentId: "doc-test", kind: "offer-letter" }]);
    expect(run.summary).toContain("Trusted Extraction Boundary");
  });

  it("rejects unsafe recruiting intelligence outputs", () => {
    expect(rejectUnsafeIntelligence("Strong culture fit and personality score")).toBe(false);
    expect(rejectUnsafeIntelligence("Backend systems claim supported by offer letter")).toBe(true);
  });

  it("builds a demo vault from submitted text evidence through the AI pipeline", () => {
    const vault = buildDemoVaultFromSubmittedEvidence({
      title: "Candidate pasted offer packet",
      rawText:
        "Offer letter for Staff backend platform role at Series B startup. TypeScript privacy systems, INR 48L cash, led 7 engineers across 4 years tenure.",
      kind: "other",
    });

    expect(vault.evidenceDocuments).toHaveLength(1);
    expect(vault.evidenceDocuments[0].midnightCommitment).toMatch(/^midnight:commitment:/);
    expect(vault.verifiedClaims.map((claim) => claim.kind)).toEqual(
      expect.arrayContaining([
        "role-family",
        "skills",
        "seniority",
        "startup-exposure",
        "compensation-band",
        "leadership-scope",
        "employment-tenure",
      ]),
    );
    expect(vault.verifiedClaims.every((claim) => claim.source === "ai-intelligence-pipeline")).toBe(true);
  });
});
