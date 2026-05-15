import { approveRecruiterViewAction, uploadEvidenceAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Card, Metric, Pill } from "@/components/cards";
import { candidateActors, futureAuthIntegration } from "@/lib/actors";
import { getCandidateWorkspace } from "@/lib/product-service";
import { recruiterEvidenceBoundary } from "@/lib/privacy";
import { getLocalVeilStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CandidateVaultPage({
  searchParams,
}: {
  searchParams: Promise<{ candidateId?: string }>;
}) {
  const params = await searchParams;
  const candidateId = params.candidateId ?? "candidate-7kq";
  const { vault, recruiterView, auditEvents } = await getCandidateWorkspace(
    getLocalVeilStore(),
    candidateId,
  );
  const boundary = recruiterEvidenceBoundary(vault);
  const candidateActor = candidateActors.find((actor) => actor.candidateId === candidateId);

  return (
    <AppShell>
      <section className="pb-4 pt-12">
        <Pill strong>Candidate Vault</Pill>
        <h1 className="display-type mt-5 max-w-4xl text-5xl">
          Review private evidence before recruiter discovery.
        </h1>
        <p className="mt-5 max-w-3xl text-lg font-light leading-7 text-[var(--ink-secondary)]">
          {vault.legalName} can see raw document metadata and approve coarse claims for
          {` ${vault.anonymousHandle}`}. Recruiters see only the anonymous view below.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-mute)]">
          Auth mode: explicit local actor selector. {futureAuthIntegration}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Documents sealed" value={vault.evidenceDocuments.length} />
        <Metric label="Coarse claims visible" value={recruiterView?.coarseClaims.length ?? 0} />
        <Metric label="Precise claims gated" value={recruiterView?.gatedClaimKinds.length ?? 0} />
        <Metric label="Recruiter raw access" value="false" />
      </section>

      <section className="grid gap-5 pt-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="card-shadow">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-light tracking-[-0.3px]">Upload Evidence Document</h2>
            <Pill>Server action</Pill>
          </div>
          <form action={uploadEvidenceAction} className="mt-5 grid gap-4">
            <input type="hidden" name="candidateId" value={vault.candidateId} />
            <input type="hidden" name="legalName" value={vault.legalName} />
            <input type="hidden" name="anonymousHandle" value={vault.anonymousHandle} />
            <label className="grid gap-2 text-sm">
              Local candidate actor
              <select
                name="actorId"
                defaultValue={candidateActor?.id}
                className="min-h-10 rounded-md border border-[var(--hairline-input)] bg-white px-3 py-2"
              >
                {candidateActors.map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Document title
              <input
                name="title"
                required
                placeholder="Offer letter, pay statement, performance review"
                className="min-h-10 rounded-md border border-[var(--hairline-input)] px-3 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Evidence type
              <select
                name="kind"
                defaultValue="other"
                className="min-h-10 rounded-md border border-[var(--hairline-input)] bg-white px-3 py-2"
              >
                <option value="resume">Resume</option>
                <option value="offer-letter">Offer letter</option>
                <option value="pay-statement">Pay statement</option>
                <option value="performance-review">Performance review</option>
                <option value="education-record">Education record</option>
                <option value="linkedin-export">LinkedIn export</option>
                <option value="certificate">Certificate</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Private evidence text
              <textarea
                name="rawText"
                required
                rows={6}
                placeholder="Paste private source text. Recruiter routes will not receive this body."
                className="rounded-md border border-[var(--hairline-input)] px-3 py-2"
              />
            </label>
            <button className="w-fit rounded-full bg-[var(--primary)] px-5 py-3 text-white transition hover:bg-[var(--primary-press)]">
              Store, extract, audit
            </button>
          </form>
        </Card>

        <Card tone="cream">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-light tracking-[-0.3px]">Candidate Review</h2>
            <Pill strong>{vault.approvedForDiscovery ? "Discovery on" : "Needs approval"}</Pill>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-secondary)]">
            Coarse claims enter the Anonymous Recruiter View. Precise values stay gated for
            Disclosure Grants.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {vault.verifiedClaims.map((claim) => (
              <div key={claim.id} className="rounded-lg bg-white/75 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[13px] text-[var(--ink-mute)]">{claim.label}</div>
                    <div className="mt-2 text-sm">{claim.coarseValue}</div>
                  </div>
                  <Pill>{claim.privacyLevel}</Pill>
                </div>
                <div className="tabular mt-3 text-xs text-[var(--ink-mute)]">
                  {Math.round(claim.confidence * 100)}% confidence
                </div>
              </div>
            ))}
          </div>
          <form action={approveRecruiterViewAction} className="mt-5">
            <input type="hidden" name="candidateId" value={vault.candidateId} />
            <input type="hidden" name="actorId" value={candidateActor?.id ?? ""} />
            <button className="rounded-full bg-[var(--primary)] px-5 py-3 text-white transition hover:bg-[var(--primary-press)]">
              Approve Anonymous Recruiter View
            </button>
          </form>
        </Card>
      </section>

      <section className="grid gap-5 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="card-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light tracking-[-0.3px]">Evidence Documents</h2>
            <Pill>Trusted Extraction Boundary</Pill>
          </div>
          <div className="mt-5 grid gap-3">
            {vault.evidenceDocuments.map((document) => (
              <div key={document.id} className="rounded-lg border border-[var(--hairline)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{document.title}</div>
                    <div className="mt-1 text-sm text-[var(--ink-mute)]">{document.privateSummary}</div>
                  </div>
                  <Pill>{document.kind}</Pill>
                </div>
                <div className="tabular mt-3 text-xs text-[var(--ink-mute)]">{document.midnightCommitment}</div>
                <details className="mt-3 text-xs text-[var(--ink-mute)]">
                  <summary className="cursor-pointer text-[var(--primary)]">Candidate-only raw body</summary>
                  <p className="mt-2 rounded-md bg-[var(--canvas-soft)] p-3">{document.rawText}</p>
                </details>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light tracking-[-0.3px]">Approved Anonymous Recruiter View</h2>
            <Pill strong>{recruiterView ? "Discovery on" : "Discovery off"}</Pill>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(recruiterView?.coarseClaims ?? []).map((claim) => (
              <div key={claim.id} className="rounded-lg bg-[var(--canvas-soft)] p-4">
                <div className="text-[13px] text-[var(--ink-mute)]">{claim.label}</div>
                <div className="mt-2 text-[15px]">{claim.coarseValue}</div>
                <div className="tabular mt-3 text-xs text-[var(--ink-mute)]">
                  confidence {Math.round(claim.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-[var(--brand-dark)] p-4 text-white">
            <div className="text-sm text-white/70">Gated precise claims</div>
            <div className="mt-2 text-sm">{recruiterView?.gatedClaimKinds.join(", ") || "Approve view to publish coarse claims."}</div>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 pb-16 lg:grid-cols-2">
        <Card tone="cream">
          <h2 className="text-2xl font-light tracking-[-0.3px]">Recruiter Boundary Check</h2>
          <div className="mt-4 grid gap-3">
            {boundary.map((document) => (
              <div key={document.id} className="flex items-center justify-between gap-4 rounded-lg bg-white/70 p-3">
                <span>{document.title}</span>
                <span className="tabular text-sm text-[var(--ink-mute)]">raw visible: {String(document.rawTextVisible)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-light tracking-[-0.3px]">Privacy Audit</h2>
          <div className="mt-4 grid gap-3">
            {auditEvents.map((event) => (
              <div key={event.id} className="rounded-lg border border-[var(--hairline)] p-3">
                <div className="flex items-center justify-between gap-4">
                  <span>{event.action}</span>
                  <span className="tabular text-xs text-[var(--ink-mute)]">{event.actor}</span>
                </div>
                <div className="tabular mt-2 text-xs text-[var(--ink-mute)]">{event.receipt}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
