import { AppShell } from "@/components/app-shell";
import { Card, Metric, Pill } from "@/components/cards";
import { candidateVaults } from "@/lib/fixtures";
import { searchRecruiterViews } from "@/lib/matching";

const query = "Find backend engineers with startup experience and compensation under INR 50L";
const results = searchRecruiterViews(candidateVaults, query);

export default function RecruiterSearchPage() {
  return (
    <AppShell>
      <section className="pb-4 pt-12">
        <Pill strong>Recruiter Matching</Pill>
        <h1 className="display-type mt-5 max-w-4xl text-5xl">
          Search approved anonymous views, not private dossiers.
        </h1>
        <p className="mt-5 max-w-3xl text-lg font-light leading-7 text-[var(--ink-secondary)]">
          Core demo query ranks candidate-approved views using coarse Verified Claims. Exact
          employers, exact pay, identity, and raw evidence remain hidden.
        </p>
      </section>

      <Card className="card-shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-[var(--ink-mute)]">Natural-language query</div>
            <h2 className="mt-2 text-2xl font-light tracking-[-0.3px]">{query}</h2>
          </div>
          <Pill>{results.length} matches</Pill>
        </div>
      </Card>

      <section className="grid gap-4 py-6 md:grid-cols-3">
        <Metric label="Named profiles shown" value="0" />
        <Metric label="Exact salaries shown" value="0" />
        <Metric label="Raw documents shown" value="0" />
      </section>

      <section className="grid gap-5 pb-16">
        {results.map((result, index) => (
          <Card key={result.view.candidateId}>
            <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <Pill>Rank {index + 1}</Pill>
                <h2 className="display-type mt-4 text-4xl">{result.view.anonymousHandle}</h2>
                <p className="mt-4 text-[15px] leading-6 text-[var(--ink-secondary)]">
                  {result.view.aiSummary}
                </p>
                <div className="tabular mt-6 text-5xl font-light tracking-[-1px]">
                  {result.matchScore}
                  <span className="ml-2 text-base text-[var(--ink-mute)]">match score</span>
                </div>
              </div>
              <div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.view.coarseClaims.map((claim) => (
                    <div key={claim.id} className="rounded-lg bg-[var(--canvas-soft)] p-4">
                      <div className="text-[13px] text-[var(--ink-mute)]">{claim.label}</div>
                      <div className="mt-2 text-sm">{claim.coarseValue}</div>
                      <div className="tabular mt-3 text-xs text-[var(--ink-mute)]">
                        {claim.midnightCommitment}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-[var(--hairline)] p-4">
                  <div className="text-sm text-[var(--ink-mute)]">Match explanation</div>
                  <ul className="mt-3 grid list-none gap-2 pl-0 text-sm">
                    {result.explanation.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
