import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Metric, Pill } from "@/components/cards";
import { searchRecruiterViews } from "@/lib/product-service";
import { getLocalVeilStore } from "@/lib/store";

const coreQuery = "Find backend engineers with startup experience and compensation under INR 50L";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = getLocalVeilStore();
  const [snapshot, results] = await Promise.all([
    store.read(),
    searchRecruiterViews(store, coreQuery),
  ]);

  return (
    <AppShell>
      <section className="grid items-end gap-10 pb-10 pt-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Pill strong>Midnight-backed Private Verification</Pill>
          <h1 className="display-type mt-6 max-w-4xl text-5xl sm:text-6xl">
            AI candidate intelligence without raw document exposure.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light leading-7 text-[var(--ink-secondary)]">
            Veil lets candidates upload private evidence, convert it into document-backed
            Verified Claims, approve an Anonymous Recruiter View, and grant precise claim
            upgrades without exposing raw evidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/candidate-vault" className="rounded-full bg-[var(--primary)] px-5 py-3 text-white">
              Open Candidate Vault
            </Link>
            <Link href="/recruiter-search" className="rounded-full border border-[var(--primary)] bg-white px-5 py-3 text-[var(--primary)]">
              Search approved views
            </Link>
          </div>
        </div>
        <Card className="card-shadow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] text-[var(--ink-mute)]">Core recruiter query</p>
              <h2 className="mt-2 text-2xl font-light tracking-[-0.3px]">{coreQuery}</h2>
            </div>
            <Pill>{results.length} visible</Pill>
          </div>
          <div className="mt-6 grid gap-3">
            {results.map((result) => (
              <div key={result.view.candidateId} className="rounded-lg bg-[var(--canvas-soft)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{result.view.anonymousHandle}</div>
                    <div className="mt-1 text-sm text-[var(--ink-mute)]">{result.explanation.slice(0, 2).join(" / ")}</div>
                  </div>
                  <div className="tabular text-2xl font-light">{result.matchScore}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Evidence docs" value={snapshot.evidenceDocuments.length} />
        <Metric label="Verified claims" value={snapshot.verifiedClaims.length} />
        <Metric label="Audit receipts" value={snapshot.auditEvents.length} />
        <Metric label="Raw docs to recruiters" value="0" />
      </section>

      <section className="grid gap-4 pb-16 pt-8 md:grid-cols-3">
        <Card tone="cream">
          <Pill>Candidate</Pill>
          <h2 className="display-type mt-4 text-3xl">Vault first</h2>
          <p className="mt-3 text-[15px] leading-6 text-[var(--ink-secondary)]">
            Flexible Evidence Documents stay in the Trusted Extraction Boundary. Recruiters get
            claim commitments, not files.
          </p>
        </Card>
        <Card>
          <Pill>Recruiter</Pill>
          <h2 className="display-type mt-4 text-3xl">Anonymous search</h2>
          <p className="mt-3 text-[15px] leading-6 text-[var(--ink-secondary)]">
            Matching ranks approved Anonymous Recruiter Views using coarse claims, confidence,
            and claim-backed explanations.
          </p>
        </Card>
        <Card tone="dark">
          <Pill>Disclosure</Pill>
          <h2 className="display-type mt-4 text-3xl">Claim-only grants</h2>
          <p className="mt-3 text-[15px] leading-6 text-white/75">
            Candidate approval upgrades exact claims for one recruiter. Raw evidence remains sealed.
          </p>
        </Card>
      </section>
    </AppShell>
  );
}
