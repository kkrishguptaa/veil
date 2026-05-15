import { describe, expect, it } from "vitest";
import { auditEvents, candidateVaults, disclosureGrants } from "../fixtures";
import {
  buildAnonymousRecruiterView,
  decideDisclosureGrant,
  getCandidateAuditEvents,
  getRecruiterVisibleClaim,
  recruiterEvidenceBoundary,
  requestDisclosureGrant,
} from "../privacy";

describe("privacy boundary", () => {
  const vault = candidateVaults[0];

  it("builds anonymous recruiter views from coarse claims only", () => {
    const view = buildAnonymousRecruiterView(vault);

    expect(view.anonymousHandle).toBe("Anonymous Candidate 7KQ");
    expect(view.coarseClaims.every((claim) => claim.privacyLevel === "coarse")).toBe(true);
    expect(view.gatedClaimKinds).toContain("leadership-scope");
    expect(JSON.stringify(view)).not.toContain(vault.legalName);
  });

  it("never exposes raw evidence through recruiter-facing document boundary", () => {
    const boundary = recruiterEvidenceBoundary(vault);

    expect(boundary.every((document) => document.rawTextVisible === false)).toBe(true);
    expect(JSON.stringify(boundary)).not.toContain("INR 46L exact cash");
  });

  it("scopes precise claim upgrades to approved recruiter grants", () => {
    const tenureClaim = vault.verifiedClaims.find((claim) => claim.id === "claim-7kq-tenure");
    expect(tenureClaim).toBeDefined();

    const visibleToNorthstar = getRecruiterVisibleClaim(tenureClaim!, disclosureGrants, "recruiter-northstar");
    const visibleToOther = getRecruiterVisibleClaim(tenureClaim!, disclosureGrants, "recruiter-other");

    expect(visibleToNorthstar.precision).toBe("precise");
    expect(visibleToOther.precision).toBe("coarse");
    expect(visibleToNorthstar.rawEvidenceVisible).toBe(false);
  });

  it("records request and decision state transitions", () => {
    const requested = requestDisclosureGrant([], {
      candidateId: "candidate-7kq",
      recruiterId: "recruiter-test",
      recruiterName: "Test Recruiter",
      claimId: "claim-7kq-performance",
    });
    const decided = decideDisclosureGrant(requested, requested[0].id, "denied");

    expect(requested[0].state).toBe("requested");
    expect(decided[0].state).toBe("denied");
    expect(decided[0].midnightReceipt).toContain("midnight:grant-denied");
    expect(decided[0].recruiterId).toBe("recruiter-test");
  });

  it("shows candidate audit events for privacy-sensitive actions", () => {
    const events = getCandidateAuditEvents(auditEvents, "candidate-7kq");
    const actions = events.map((event) => event.action);

    expect(actions).toContain("evidence.uploaded");
    expect(actions).toContain("recruiter-view.approved");
    expect(actions).toContain("disclosure.requested");
    expect(actions).toContain("disclosure.approved");
    expect(actions).toContain("disclosure.denied");
  });
});
