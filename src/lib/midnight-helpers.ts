import { createHash } from "node:crypto";
import {
  CLAIM_TAXONOMY,
  canonicalJson,
  createEvidenceDocument,
  createVerifiedClaim,
  requestDisclosureGrant,
  type CreateVerifiedClaimInput,
  type MidnightClaimType,
  type MidnightEvidenceDocument,
} from "../privacy/midnight-private-verification";
import type { ClaimKind, EvidenceDocument, VerifiedClaim } from "./domain";

export function claimKindToMidnightType(kind: ClaimKind): MidnightClaimType {
  const mapped = kind.replace(/-/g, "_") as MidnightClaimType;
  if (!CLAIM_TAXONOMY.includes(mapped)) {
    throw new Error(`unsupported claim kind for Midnight mapping: ${kind}`);
  }
  return mapped;
}

export function evidenceDocumentToMidnightWitness(
  document: EvidenceDocument,
): Readonly<MidnightEvidenceDocument> {
  return createEvidenceDocument({
    documentId: document.id,
    candidateId: document.candidateId,
    kind: document.kind,
    body: document.rawText,
    metadata: { title: document.title, uploadedAt: document.uploadedAt },
  });
}

export function fingerprintDisclosureGrantRequest(
  input: Parameters<typeof requestDisclosureGrant>[0],
): string {
  const request = requestDisclosureGrant(input);
  return createHash("sha256").update(`veil.grant-request:${canonicalJson(request)}`).digest("hex");
}

export function materializeVerifiedClaimMidnight(
  claim: Pick<
    VerifiedClaim,
    | "id"
    | "candidateId"
    | "kind"
    | "coarseValue"
    | "preciseValue"
    | "confidence"
    | "extractionNotes"
    | "evidenceIds"
  >,
  evidenceWitnesses: readonly Readonly<MidnightEvidenceDocument>[],
  salt: string,
): ReturnType<typeof createVerifiedClaim> {
  const input: CreateVerifiedClaimInput = {
    claimId: claim.id,
    candidateId: claim.candidateId,
    type: claimKindToMidnightType(claim.kind),
    coarseValue: claim.coarseValue,
    preciseValue: claim.preciseValue,
    evidenceDocuments: evidenceWitnesses,
    confidence: claim.confidence,
    extractionSummary: claim.extractionNotes,
    salt,
  };
  return createVerifiedClaim(input);
}
