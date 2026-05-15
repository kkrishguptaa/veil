import type {
  CandidateVault,
  EvidenceDocument,
  EvidenceDocumentKind,
} from "./domain";
import { buildVaultFromEvidence } from "./pipeline";

export interface DemoEvidenceSubmission {
  title: string;
  rawText: string;
  kind?: EvidenceDocumentKind;
  candidateId?: string;
  legalName?: string;
  anonymousHandle?: string;
  uploadedAt?: string;
}

const defaultCandidate = {
  candidateId: "candidate-demo-upload",
  legalName: "Demo Candidate",
  anonymousHandle: "Anonymous Candidate Demo",
};

export function buildDemoVaultFromSubmittedEvidence(
  submission: DemoEvidenceSubmission,
): CandidateVault {
  const rawText = submission.rawText.trim();
  const title = submission.title.trim();

  if (!rawText) {
    throw new Error("evidence text is required");
  }
  if (!title) {
    throw new Error("evidence title is required");
  }

  const candidateId = submission.candidateId ?? defaultCandidate.candidateId;
  const document = buildSubmittedEvidenceDocument({
    candidateId,
    title,
    rawText,
    kind: submission.kind ?? "other",
    uploadedAt: submission.uploadedAt ?? "2026-05-16T10:00:00.000Z",
  });

  return buildVaultFromEvidence({
    candidateId,
    legalName: submission.legalName ?? defaultCandidate.legalName,
    anonymousHandle: submission.anonymousHandle ?? defaultCandidate.anonymousHandle,
    approvedForDiscovery: true,
    evidenceDocuments: [document],
  });
}

function buildSubmittedEvidenceDocument(input: {
  candidateId: string;
  title: string;
  rawText: string;
  kind: EvidenceDocumentKind;
  uploadedAt: string;
}): EvidenceDocument {
  const digest = stableDigest(
    `${input.candidateId}:${input.title}:${input.rawText}:${input.uploadedAt}`,
  );

  return {
    id: `doc-demo-${digest}`,
    candidateId: input.candidateId,
    title: input.title,
    kind: input.kind,
    uploadedAt: input.uploadedAt,
    rawText: input.rawText,
    privateSummary: summarizePrivateEvidence(input.rawText),
    midnightCommitment: `midnight:commitment:${input.candidateId}:${digest}`,
  };
}

function summarizePrivateEvidence(rawText: string): string {
  const normalized = rawText.replace(/\s+/g, " ").trim();
  const preview = normalized.length > 96 ? `${normalized.slice(0, 96)}...` : normalized;

  return `Candidate-side evidence submitted for extraction. Preview: ${preview}`;
}

function stableDigest(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}
