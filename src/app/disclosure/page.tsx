import { AppShell } from "@/components/app-shell";
import { Card, Metric, Pill } from "@/components/cards";
import { candidateVaults, disclosureGrants } from "@/lib/fixtures";
import { getRecruiterVisibleClaim } from "@/lib/privacy";

const vault = candidateVaults[0];
const recruiterId = "recruiter-northstar";
const requestedGrant = disclosureGrants.find((grant) => grant.state === "requested");
const approvedGrant = disclosureGrants.find((grant) => grant.state === "approved");
const requestedClaim = vault.verifiedClaims.find((claim) => claim.id === requestedGrant?.claimId);
const approvedClaim = vault.verifiedClaims.find((claim) => claim.id === approvedGrant?.claimId);

export default function DisclosurePage() {
  const approvedVisibleClaim = approvedClaim
    ? getRecruiterVisibleClaim(approvedClaim, disclosureGrants, recruiterId)
    : null;

  return (
    <AppShell>
      <section className="pb-4 pt-12">
        <Pill strong>Disclosure Grant</Pill>
        <h1 className="display-type mt-5 max-w-4xl text-5xl">
          Upgrade precise claims without exposing raw evidence.
        </h1>
        <p className="mt-5 max-w-3xl text-lg font-light leading-7 text-[var(--ink-secondary)]">
          Recruiters can ask for a specific precise claim. Candidate approval reveals only that
          claim for that recruiter and produces a Midnight-backed receipt.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Grant scope" value="1 claim" />
        <Metric label="Recruiter scope" value="1 org" />
        <Metric label="Raw documents exposed" value="0" />
      </section>

      <section className="grid gap-5 py-8 lg:grid-cols-2">
        <Card className="card-shadow">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-light tracking-[-0.3px]">Pending Request</h2>
            <Pill>{requestedGrant?.state ?? "none"}</Pill>
          </div>
          {requestedGrant && requestedClaim ? (
            <div className="mt-5">
              <div className="text-sm text-[var(--ink-mute)]">{requestedGrant.recruiterName} requests</div>
              <div className="mt-2 text-3xl font-light tracking-[-0.5px]">{requestedClaim.label}</div>
              <div className="mt-4 rounded-lg bg-[var(--canvas-soft)] p-4">
                <div className="text-sm text-[var(--ink-mute)]">Current recruiter value</div>
                <div className="mt-2">{requestedClaim.coarseValue}</div>
              </div>
              <div className="mt-4 rounded-lg bg-[var(--brand-dark)] p-4 text-white">
                <div className="text-sm text-white/70">If approved</div>
                <div className="mt-2">Precise value sealed until candidate approval.</div>
                <div className="mt-3 text-sm text-white/70">
                  Pending recruiters see only the coarse claim. Raw document text stays sealed.
                </div>
              </div>
              <div className="tabular mt-4 text-xs text-[var(--ink-mute)]">{requestedGrant.midnightReceipt}</div>
            </div>
          ) : null}
        </Card>

        <Card tone="cream">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-light tracking-[-0.3px]">Approved Claim Upgrade</h2>
            <Pill strong>{approvedGrant?.state ?? "none"}</Pill>
          </div>
          {approvedGrant && approvedVisibleClaim ? (
            <div className="mt-5">
              <div className="text-sm text-[var(--ink-mute)]">Visible to {approvedGrant.recruiterName}</div>
              <div className="mt-2 text-3xl font-light tracking-[-0.5px]">{approvedVisibleClaim.value}</div>
              <div className="mt-4 grid gap-3">
                <div className="flex justify-between rounded-lg bg-white/75 p-3">
                  <span>Precision</span>
                  <span className="tabular">{approvedVisibleClaim.precision}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-white/75 p-3">
                  <span>Raw evidence visible</span>
                  <span className="tabular">{String(approvedVisibleClaim.rawEvidenceVisible)}</span>
                </div>
              </div>
              <div className="tabular mt-4 text-xs text-[var(--ink-mute)]">{approvedVisibleClaim.receipt}</div>
            </div>
          ) : null}
        </Card>
      </section>

      <Card tone="dark" className="mb-16">
        <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <Pill>Receipt Trail</Pill>
            <h2 className="display-type mt-4 text-4xl">Candidate-controlled privacy path</h2>
          </div>
          <div className="grid gap-3">
            {disclosureGrants.map((grant) => (
              <div key={grant.id} className="rounded-lg bg-white/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span>{grant.recruiterName}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs uppercase text-[var(--brand-dark)]">
                    {grant.state}
                  </span>
                </div>
                <div className="tabular mt-3 text-xs text-white/65">{grant.midnightReceipt}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
