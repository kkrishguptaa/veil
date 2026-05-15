import { AppShell } from "@/components/app-shell";
import { Card, Metric, Pill } from "@/components/cards";
import { requestDisclosureGrantAction, runRecruiterSearchAction } from "@/app/actions";
import { recruiterActors } from "@/lib/actors";
import { searchRecruiterViews } from "@/lib/product-service";
import { getLocalVeilStore } from "@/lib/store";

const defaultQuery = "Find backend engineers with startup experience and compensation under INR 50L";

export const dynamic = "force-dynamic";

export default async function RecruiterSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; recruiterId?: string }>;
}) {
  const params = await searchParams;
  const query = params.query ?? defaultQuery;
  const activeRecruiterId = params.recruiterId ?? "recruiter-northstar";
  const store = getLocalVeilStore();
  const [state, results] = await Promise.all([store.read(), searchRecruiterViews(store, query)]);

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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <form className="grid flex-1 gap-3" action={runRecruiterSearchAction}>
            <label className="text-sm text-[var(--ink-mute)]" htmlFor="query">
              Natural-language query
            </label>
            <input
              id="query"
              name="query"
              defaultValue={query}
              className="min-h-11 rounded-md border border-[var(--hairline-input)] px-3 py-2 text-xl font-light tracking-[-0.2px]"
            />
            <label className="grid gap-2 text-sm">
              Local recruiter actor
              <select
                name="actorId"
                defaultValue={activeRecruiterId}
                className="min-h-10 rounded-md border border-[var(--hairline-input)] bg-white px-3 py-2"
              >
                {recruiterActors.map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="mt-2 w-fit rounded-full bg-[var(--primary)] px-5 py-3 text-white transition hover:bg-[var(--primary-press)]">
              Search approved views
            </button>
          </form>
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
                <div className="mt-4 rounded-lg border border-[var(--hairline)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-[var(--ink-mute)]">Precise claim upgrades</div>
                      <div className="mt-1 text-sm">
                        Request a claim-only Disclosure Grant. Raw evidence remains sealed.
                      </div>
                    </div>
                    <Pill>Recruiter actor</Pill>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {state.verifiedClaims
                      .filter(
                        (claim) =>
                          claim.candidateId === result.view.candidateId &&
                          claim.privacyLevel === "precise",
                      )
                      .map((claim) => (
                        <form
                          key={claim.id}
                          action={requestDisclosureGrantAction}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[var(--canvas-soft)] p-3"
                        >
                          <input type="hidden" name="candidateId" value={result.view.candidateId} />
                          <input type="hidden" name="claimId" value={claim.id} />
                          <input type="hidden" name="reason" value={`Need more certainty for ${claim.label}`} />
                          <div>
                            <div className="text-sm">{claim.label}</div>
                            <div className="text-xs text-[var(--ink-mute)]">
                              Current value: {claim.coarseValue}
                            </div>
                          </div>
                          <select
                            name="actorId"
                            defaultValue={activeRecruiterId}
                            className="min-h-9 rounded-md border border-[var(--hairline-input)] bg-white px-3 py-2 text-sm"
                          >
                            {recruiterActors.map((actor) => (
                              <option key={actor.id} value={actor.id}>
                                {actor.label}
                              </option>
                            ))}
                          </select>
                          <button className="rounded-full border border-[var(--primary)] bg-white px-4 py-2 text-sm text-[var(--primary)] transition hover:bg-[var(--canvas-soft)]">
                            Request precise claim
                          </button>
                        </form>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
