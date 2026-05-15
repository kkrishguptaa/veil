import { AppShell } from "@/components/app-shell";
import { Card, Metric, Pill } from "@/components/cards";
import { auditEvents, candidateVaults } from "@/lib/fixtures";
import { buildAnonymousRecruiterView, getCandidateAuditEvents, recruiterEvidenceBoundary } from "@/lib/privacy";

const vault = candidateVaults[0];
const recruiterView = buildAnonymousRecruiterView(vault);
const boundary = recruiterEvidenceBoundary(vault);
const events = getCandidateAuditEvents(auditEvents, vault.candidateId);

export default function CandidateVaultPage() {
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
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Documents sealed" value={vault.evidenceDocuments.length} />
        <Metric label="Coarse claims visible" value={recruiterView.coarseClaims.length} />
        <Metric label="Precise claims gated" value={recruiterView.gatedClaimKinds.length} />
        <Metric label="Recruiter raw access" value="false" />
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
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light tracking-[-0.3px]">Approved Anonymous Recruiter View</h2>
            <Pill strong>Discovery on</Pill>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {recruiterView.coarseClaims.map((claim) => (
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
            <div className="mt-2 text-sm">{recruiterView.gatedClaimKinds.join(", ")}</div>
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
            {events.map((event) => (
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
