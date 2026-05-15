import { randomUUID } from "node:crypto";
import type { ActorContext } from "./actors";
import { requireCandidateScope } from "./actors";
import type {
  AuditAction,
  AuditEvent,
  CandidateRecord,
  DisclosureGrant,
  EvidenceDocument,
  EvidenceDocumentKind,
  RecruiterView,
  VeilStoreState,
} from "./domain";
import { classifyEvidenceDocument, runAiIntelligencePipeline } from "./pipeline";
import { searchApprovedRecruiterViews } from "./matching";
import { buildAnonymousRecruiterView, getRecruiterVisibleClaim } from "./privacy";
import {
  assembleCandidateVault,
  assembleCandidateVaults,
  replaceRecruiterView,
  type VeilStore,
} from "./store";
import { createEvidenceDocument as createPrivateEvidenceCommitment } from "../privacy/midnight-private-verification";

export interface UploadEvidenceInput {
  actor: ActorContext;
  candidateId: string;
  legalName: string;
  anonymousHandle: string;
  title: string;
  kind: EvidenceDocumentKind;
  rawText: string;
  now?: () => string;
}

export async function uploadEvidenceAndExtractClaims(
  store: VeilStore,
  input: UploadEvidenceInput,
) {
  requireCandidateScope(input.actor, input.candidateId);
  const now = input.now?.() ?? new Date().toISOString();
  const rawText = requireText(input.rawText, "rawText");
  const title = requireText(input.title, "title");
  const legalName = requireText(input.legalName, "legalName");
  const anonymousHandle = requireText(input.anonymousHandle, "anonymousHandle");
  const documentId = `doc-${input.candidateId}-${shortId()}`;
  const classifiedKind = classifyEvidenceDocument({ kind: input.kind, rawText });
  const privateCommitment = createPrivateEvidenceCommitment({
    documentId,
    candidateId: input.candidateId,
    kind: classifiedKind,
    body: rawText,
    metadata: { title, uploadedAt: now },
  });
  const evidenceDocument: EvidenceDocument = {
    id: documentId,
    candidateId: input.candidateId,
    title,
    kind: classifiedKind,
    uploadedAt: now,
    rawText,
    privateSummary: summarizePrivateEvidence(rawText),
    midnightCommitment: `midnight:evidence:${privateCommitment.bodyHash.slice(0, 16)}`,
  };

  return store.update((state) => {
    const candidates = upsertCandidate(state.candidates, {
      candidateId: input.candidateId,
      legalName,
      anonymousHandle,
      approvedForDiscovery: false,
      createdAt: now,
    });
    const pipelineRun = runAiIntelligencePipeline(input.candidateId, [evidenceDocument]);
    const extractedClaims = pipelineRun.claims.map((claim) => ({
      ...claim,
      id: `claim-${documentId}-${claim.kind}`,
      evidenceIds: [documentId],
      provenance: claim.provenance.map((provenance) => ({
        ...provenance,
        evidenceId: documentId,
        documentKind: classifiedKind,
      })),
      midnightCommitment: `midnight:claim:${documentId}:${claim.kind}`,
    }));
    const existingClaims = state.verifiedClaims.filter(
      (claim) =>
        claim.candidateId !== input.candidateId ||
        !extractedClaims.some((newClaim) => newClaim.id === claim.id),
    );
    const auditEvents = [
      ...state.auditEvents,
      auditEvent(input.candidateId, input.actor.role, "evidence.uploaded", evidenceDocument.id, evidenceDocument.midnightCommitment, now),
      auditEvent(input.candidateId, "veil", "ai.extracted", input.candidateId, `midnight:extraction:${input.candidateId}:${shortId()}`, now),
      ...extractedClaims.map((claim) =>
        auditEvent(input.candidateId, "veil", "claim.created", claim.id, claim.midnightCommitment, now),
      ),
    ];

    return {
      ...state,
      candidates,
      evidenceDocuments: [
        ...state.evidenceDocuments.filter((document) => document.id !== evidenceDocument.id),
        evidenceDocument,
      ],
      verifiedClaims: [...existingClaims, ...extractedClaims],
      auditEvents,
    };
  });
}

export async function approveAnonymousRecruiterView(store: VeilStore, input: {
  actor: ActorContext;
  candidateId: string;
  now?: () => string;
}) {
  requireCandidateScope(input.actor, input.candidateId);
  const now = input.now?.() ?? new Date().toISOString();

  return store.update((state) => {
    const candidate = requireCandidate(state, input.candidateId);
    const updatedCandidate = {
      ...candidate,
      approvedForDiscovery: true,
    };
    const nextState = {
      ...state,
      candidates: state.candidates.map((candidateRecord) =>
        candidateRecord.candidateId === input.candidateId ? updatedCandidate : candidateRecord,
      ),
    };
    const view = buildAnonymousRecruiterView(assembleCandidateVault(updatedCandidate, nextState));

    return {
      ...replaceRecruiterView(nextState, view),
      auditEvents: [
        ...state.auditEvents,
        auditEvent(input.candidateId, "candidate", "recruiter-view.approved", input.candidateId, view.visibleReceipts[0] ?? `midnight:view:${input.candidateId}`, now),
      ],
    };
  });
}

export async function searchRecruiterViews(store: VeilStore, query: string) {
  const state = await store.read();
  return searchApprovedRecruiterViews(state.recruiterViews, query);
}

export async function recordRecruiterSearch(store: VeilStore, input: {
  actor: ActorContext;
  query: string;
  now?: () => string;
}) {
  if (input.actor.role !== "recruiter") {
    throw new Error("recruiter actor required");
  }

  const query = requireText(input.query, "query");
  const now = input.now?.() ?? new Date().toISOString();
  let results: Awaited<ReturnType<typeof searchRecruiterViews>> = [];

  await store.update((state) => {
    results = searchApprovedRecruiterViews(state.recruiterViews, query);

    return {
      ...state,
      auditEvents: [
        ...state.auditEvents,
        ...results.map((result) =>
          auditEvent(
            result.view.candidateId,
            "recruiter",
            "recruiter-search.visible",
            input.actor.id,
            `midnight:search-visible:${result.view.candidateId}:${input.actor.id}:${shortId()}`,
            now,
          ),
        ),
      ],
    };
  });

  return results;
}

export async function requestPreciseClaimGrant(store: VeilStore, input: {
  actor: ActorContext;
  candidateId: string;
  recruiterViewCandidateId: string;
  claimId: string;
  reason?: string;
  now?: () => string;
}) {
  if (input.actor.role !== "recruiter") {
    throw new Error("recruiter actor required");
  }

  const now = input.now?.() ?? new Date().toISOString();
  return store.update((state) => {
    const claim = state.verifiedClaims.find((candidateClaim) => candidateClaim.id === input.claimId);
    const view = state.recruiterViews.find(
      (candidateView) => candidateView.candidateId === input.recruiterViewCandidateId,
    );

    if (!claim || claim.candidateId !== input.candidateId || !view?.approvedForDiscovery) {
      throw new Error("claim is not requestable from approved recruiter view");
    }
    if (claim.privacyLevel !== "precise") {
      throw new Error("only precise claims require disclosure grants");
    }

    const existing = state.disclosureGrants.find(
      (grant) =>
        grant.claimId === input.claimId &&
        grant.recruiterId === input.actor.id &&
        grant.state === "requested",
    );
    if (existing) {
      return state;
    }

    const grant: DisclosureGrant = {
      id: `grant-${input.claimId}-${input.actor.id}-${shortId()}`,
      candidateId: input.candidateId,
      recruiterId: input.actor.id,
      recruiterName: input.actor.label,
      claimId: input.claimId,
      state: "requested",
      requestedAt: now,
      midnightReceipt: `midnight:grant-request:${input.claimId}:${input.actor.id}:${shortId()}`,
    };

    return {
      ...state,
      disclosureGrants: [...state.disclosureGrants, grant],
      auditEvents: [
        ...state.auditEvents,
        auditEvent(input.candidateId, "recruiter", "disclosure.requested", input.claimId, grant.midnightReceipt, now),
      ],
    };
  });
}

export async function decidePreciseClaimGrant(store: VeilStore, input: {
  actor: ActorContext;
  grantId: string;
  decision: "approved" | "denied";
  now?: () => string;
}) {
  const now = input.now?.() ?? new Date().toISOString();

  return store.update((state) => {
    const grant = state.disclosureGrants.find((candidateGrant) => candidateGrant.id === input.grantId);
    if (!grant) {
      throw new Error("grant not found");
    }
    requireCandidateScope(input.actor, grant.candidateId);

    const receipt = `midnight:grant-${input.decision}:${grant.claimId}:${grant.recruiterId}:${shortId()}`;
    const disclosureGrants = state.disclosureGrants.map((candidateGrant) =>
      candidateGrant.id === grant.id
        ? {
            ...candidateGrant,
            state: input.decision,
            decidedAt: now,
            midnightReceipt: receipt,
          }
        : candidateGrant,
    );
    const events: AuditEvent[] = [
      auditEvent(grant.candidateId, "candidate", input.decision === "approved" ? "disclosure.approved" : "disclosure.denied", grant.claimId, receipt, now),
    ];

    if (input.decision === "approved") {
      events.push(
        auditEvent(grant.candidateId, "veil", "claim.upgraded", grant.claimId, receipt, now),
      );
    }

    return {
      ...state,
      disclosureGrants,
      auditEvents: [...state.auditEvents, ...events],
    };
  });
}

export async function getCandidateWorkspace(store: VeilStore, candidateId: string) {
  const state = await store.read();
  const candidate = requireCandidate(state, candidateId);
  const vault = assembleCandidateVault(candidate, state);
  const recruiterView = state.recruiterViews.find((view) => view.candidateId === candidateId);
  const grants = state.disclosureGrants.filter((grant) => grant.candidateId === candidateId);
  const auditEvents = state.auditEvents.filter((event) => event.candidateId === candidateId);

  return {
    vault,
    recruiterView,
    grants,
    auditEvents,
  };
}

export async function getProductSnapshot(store: VeilStore) {
  const state = await store.read();

  return {
    state,
    vaults: assembleCandidateVaults(state),
  };
}

export function getRecruiterAllowedClaim(state: VeilStoreState, claimId: string, recruiterId: string) {
  const claim = state.verifiedClaims.find((candidateClaim) => candidateClaim.id === claimId);
  if (!claim) return null;

  return getRecruiterVisibleClaim(claim, state.disclosureGrants, recruiterId);
}

function upsertCandidate(candidates: CandidateRecord[], candidate: CandidateRecord) {
  const existing = candidates.find((candidateRecord) => candidateRecord.candidateId === candidate.candidateId);
  if (!existing) {
    return [...candidates, candidate];
  }

  return candidates.map((candidateRecord) =>
    candidateRecord.candidateId === candidate.candidateId
      ? {
          ...candidateRecord,
          legalName: candidate.legalName,
          anonymousHandle: candidate.anonymousHandle,
        }
      : candidateRecord,
  );
}

function requireCandidate(state: VeilStoreState, candidateId: string) {
  const candidate = state.candidates.find((candidateRecord) => candidateRecord.candidateId === candidateId);
  if (!candidate) {
    throw new Error(`candidate not found: ${candidateId}`);
  }

  return candidate;
}

function auditEvent(
  candidateId: string,
  actor: AuditEvent["actor"],
  action: AuditAction,
  targetId: string,
  receipt: string,
  timestamp: string,
): AuditEvent {
  return {
    id: `audit-${action}-${shortId()}`,
    candidateId,
    actor,
    action,
    targetId,
    timestamp,
    receipt,
  };
}

function summarizePrivateEvidence(rawText: string) {
  const length = rawText.length;
  const hints = [
    rawText.toLowerCase().includes("inr") ? "compensation evidence" : null,
    rawText.toLowerCase().includes("startup") ? "company-stage evidence" : null,
    rawText.toLowerCase().includes("performance") ? "performance evidence" : null,
  ].filter(Boolean);

  return `Private body stored in Trusted Extraction Boundary (${length} chars${hints.length > 0 ? `, ${hints.join(", ")}` : ""}).`;
}

function requireText(value: string, label: string) {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${label} is required`);
  }

  return trimmed;
}

function shortId() {
  return randomUUID().slice(0, 8);
}
