import { describe, expect, it } from "vitest";
import { candidateVaults, disclosureGrants } from "../fixtures";
import { createLocalMidnightPrivacyBoundary, verifyDisclosureReceipt } from "../../privacy/midnight-private-verification";
import { sealRecruiterViewForSeed } from "../midnight-seed-materialize";

const fixtureBoundaryClock = () => "2026-05-16T09:20:00.000Z";

describe("product path Midnight boundary", () => {
  it("fixture tenure disclosure receipt matches boundary approveDisclosureGrant output", () => {
    const vault = candidateVaults.find((candidateVault) => candidateVault.candidateId === "candidate-7kq")!;
    const tenureClaim = vault.verifiedClaims.find((claim) => claim.id === "claim-7kq-tenure")!;
    const grant = disclosureGrants.find((candidateGrant) => candidateGrant.id === "grant-7kq-tenure-northstar")!;

    expect(grant.state).toBe("approved");
    expect(tenureClaim.midnightPrivateClaim).toBeDefined();
    expect(tenureClaim.midnightPublicClaim).toBeDefined();

    const view = sealRecruiterViewForSeed(vault);
    const boundary = createLocalMidnightPrivacyBoundary({ now: fixtureBoundaryClock });
    const grantRequest = boundary.requestDisclosureGrant({
      grantId: grant.id,
      recruiterId: grant.recruiterId,
      recruiterViewId: view.recruiterViewId!,
      claimId: grant.claimId,
      requestedFields: ["preciseValue"],
    });
    const receipt = boundary.approveDisclosureGrant({
      grantRequest,
      privateClaim: tenureClaim.midnightPrivateClaim!,
      publicClaim: tenureClaim.midnightPublicClaim!,
      candidateApprovedBy: "candidate-7kq",
    });

    expect(receipt.midnight.receiptCommitment).toBe(grant.midnightReceipt);
    expect(
      verifyDisclosureReceipt({
        receipt,
        privateClaim: tenureClaim.midnightPrivateClaim!,
        publicClaim: tenureClaim.midnightPublicClaim!,
      }),
    ).toBe(true);
  });

  it("sealed recruiter views expose commitments without private claim payloads", () => {
    const vault = candidateVaults[0];
    const sealed = sealRecruiterViewForSeed(vault);
    const json = JSON.stringify(sealed);

    expect(json).not.toContain(vault.legalName);
    expect(json).not.toContain("INR 46L exact cash");
    expect(sealed.midnightRecruiterViewCommitment).toMatch(/^[a-f0-9]{64}$/);
  });
});
