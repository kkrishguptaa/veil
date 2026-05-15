import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { validateLocalActor } from "../actors";
import {
  approveAnonymousRecruiterView,
  decidePreciseClaimGrant,
  recordRecruiterSearch,
  requestPreciseClaimGrant,
  searchRecruiterViews,
  uploadEvidenceAndExtractClaims,
} from "../product-service";
import { createEmptyStoreState, createJsonFileVeilStore } from "../store";

const now = () => "2026-05-16T12:00:00.000Z";
const privateEvidence =
  "Priya Raman legal profile. Backend platform Staff Engineer at Northstar Robotics. Series B startup. TypeScript distributed privacy systems. Exact cash INR 46L. Led 11 engineers. Master degree. Exceeded expectations performance band.";

describe("productized Veil flow", () => {
  let tempDir: string | null = null;

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = null;
    }
  });

  it("persists upload, extraction, recruiter view, matching, grants, receipts, and audit", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "veil-product-flow-"));
    const store = createJsonFileVeilStore({
      filePath: join(tempDir, "store.json"),
      seed: createEmptyStoreState,
    });
    const candidate = validateLocalActor({
      actorId: "candidate-7kq",
      expectedRole: "candidate",
    });
    const recruiter = validateLocalActor({
      actorId: "recruiter-northstar",
      expectedRole: "recruiter",
    });

    await uploadEvidenceAndExtractClaims(store, {
      actor: candidate,
      candidateId: "candidate-7kq",
      legalName: "Priya Raman",
      anonymousHandle: "Anonymous Candidate 7KQ",
      title: "Private career evidence bundle",
      kind: "other",
      rawText: privateEvidence,
      now,
    });
    await approveAnonymousRecruiterView(store, {
      actor: candidate,
      candidateId: "candidate-7kq",
      now,
    });

    const results = await searchRecruiterViews(
      store,
      "Find backend engineers with startup experience and compensation under ₹50L",
    );
    await recordRecruiterSearch(store, {
      actor: recruiter,
      query: "Find backend engineers with startup experience and compensation under ₹50L",
      now,
    });
    expect(results).toHaveLength(1);
    expect(results[0].view.anonymousHandle).toBe("Anonymous Candidate 7KQ");
    expect(JSON.stringify(results)).not.toContain(privateEvidence);
    expect(JSON.stringify(results)).not.toContain("Priya Raman");
    expect(JSON.stringify(results)).not.toContain("Northstar Robotics");

    const stateAfterSearch = await store.read();
    const preciseClaim = stateAfterSearch.verifiedClaims.find(
      (claim) => claim.candidateId === "candidate-7kq" && claim.privacyLevel === "precise",
    );
    expect(preciseClaim).toBeDefined();

    await requestPreciseClaimGrant(store, {
      actor: recruiter,
      candidateId: "candidate-7kq",
      recruiterViewCandidateId: "candidate-7kq",
      claimId: preciseClaim!.id,
      reason: "Confirm scope before outreach.",
      now,
    });
    const requested = (await store.read()).disclosureGrants.find(
      (grant) => grant.claimId === preciseClaim!.id,
    );
    expect(requested?.state).toBe("requested");

    await decidePreciseClaimGrant(store, {
      actor: candidate,
      grantId: requested!.id,
      decision: "approved",
      now,
    });

    const finalState = await store.read();
    const approved = finalState.disclosureGrants.find((grant) => grant.id === requested!.id);
    const actions = finalState.auditEvents.map((event) => event.action);

    expect(approved?.state).toBe("approved");
    expect(approved?.midnightReceipt).toContain("midnight:grant-approved");
    expect(JSON.stringify({ approved, auditEvents: finalState.auditEvents })).not.toContain(privateEvidence);
    expect(actions).toEqual(
      expect.arrayContaining([
        "evidence.uploaded",
        "ai.extracted",
        "claim.created",
        "recruiter-view.approved",
        "recruiter-search.visible",
        "disclosure.requested",
        "disclosure.approved",
        "claim.upgraded",
      ]),
    );
  });

  it("keeps denial scoped and non-disclosing", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "veil-product-denial-"));
    const store = createJsonFileVeilStore({
      filePath: join(tempDir, "store.json"),
      seed: createEmptyStoreState,
    });
    const candidate = validateLocalActor({
      actorId: "candidate-7kq",
      expectedRole: "candidate",
    });
    const recruiter = validateLocalActor({
      actorId: "recruiter-northstar",
      expectedRole: "recruiter",
    });

    await uploadEvidenceAndExtractClaims(store, {
      actor: candidate,
      candidateId: "candidate-7kq",
      legalName: "Priya Raman",
      anonymousHandle: "Anonymous Candidate 7KQ",
      title: "Private evidence",
      kind: "other",
      rawText: privateEvidence,
      now,
    });
    await approveAnonymousRecruiterView(store, {
      actor: candidate,
      candidateId: "candidate-7kq",
      now,
    });

    const preciseClaim = (await store.read()).verifiedClaims.find(
      (claim) => claim.privacyLevel === "precise",
    );
    await requestPreciseClaimGrant(store, {
      actor: recruiter,
      candidateId: "candidate-7kq",
      recruiterViewCandidateId: "candidate-7kq",
      claimId: preciseClaim!.id,
      now,
    });
    const requested = (await store.read()).disclosureGrants[0];
    await decidePreciseClaimGrant(store, {
      actor: candidate,
      grantId: requested.id,
      decision: "denied",
      now,
    });

    const finalState = await store.read();
    expect(finalState.disclosureGrants[0].state).toBe("denied");
    expect(JSON.stringify(finalState.disclosureGrants)).not.toContain(privateEvidence);
  });
});
