import Link from "next/link";
import { Suspense } from "react";

import { VeilLedgerStrip } from "./components/VeilLedgerStrip";

function LedgerFallback() {
  return (
    <aside className="rounded-xl border border-dashed border-(--color-edge) bg-(--color-canvas-elevated) p-5 text-sm text-(--color-ink-muted)">
      Loading on-chain snapshot from the indexer…
    </aside>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-12 md:pt-16">
      <section className="max-w-3xl space-y-6 md:space-y-8">
        <p className="text-sm font-medium tracking-wide text-(--color-accent)">Midnight Network</p>
        <h1 className="text-4xl font-medium leading-tight tracking-tight text-balance md:text-5xl">
          Payroll people can verify without publishing what everyone earns
        </h1>
        <p className="text-lg leading-relaxed text-(--color-ink-muted) md:text-xl">
          Veil is a demo of confidential payroll: employers run batches, employees keep meaningful receipts, and auditors
          check proofs and aggregates instead of begging HR for another export.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            className="rounded-lg bg-(--color-accent) px-5 py-2.5 text-sm font-medium text-(--color-canvas) transition hover:bg-(--color-accent-hover)"
            href="https://github.com/kkrishguptaa/veil#quick-start"
            rel="noreferrer"
            target="_blank"
          >
            Run the local setup
          </a>
          <Link
            className="rounded-lg border border-(--color-edge) px-5 py-2.5 text-sm font-medium text-(--color-ink) transition hover:border-(--color-accent) hover:text-(--color-accent)"
            href="/employer"
          >
            View employer shell
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-12 md:grid-cols-2 md:items-start">
        <div className="space-y-4">
          <h2 className="text-2xl font-medium tracking-tight">The awkward middle</h2>
          <p className="leading-relaxed text-(--color-ink-muted)">
            SaaS payroll sees too much. A naive public chain sees too much in the other direction. Teams want proof
            without gossip. That is the space Veil sits in.
          </p>
        </div>
        <div className="space-y-4 rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6 md:p-8">
          <h2 className="text-2xl font-medium tracking-tight">Why Midnight shows up</h2>
          <p className="leading-relaxed text-(--color-ink-muted)">
            Midnight is built for programmable privacy: private state where the model allows, proofs when you need to
            move from &quot;trust me&quot; to &quot;verify this.&quot; Veil is a payroll-shaped story for that move.
          </p>
        </div>
      </section>

      <section className="mt-24 space-y-8">
        <h2 className="text-2xl font-medium tracking-tight">How the demo is meant to feel</h2>
        <ol className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Employer",
              body: "Create context, line up employees, run a batch, and walk away with a receipt you can file without exposing every line item in a shared channel.",
            },
            {
              step: "2",
              title: "Employee",
              body: "Open what you are allowed to see, check that verification lines up, and keep a receipt that does not depend on a portal password alone.",
            },
            {
              step: "3",
              title: "Auditor",
              body: "Work from aggregates and proofs on purpose. When something must stay hidden, the UI should say so plainly instead of looking like a broken report.",
            },
          ].map((item) => (
            <li key={item.step} className="flex flex-col gap-3">
              <span className="font-mono text-sm text-(--color-accent)">{item.step}</span>
              <h3 className="text-lg font-medium text-(--color-ink)">{item.title}</h3>
              <p className="text-sm leading-relaxed text-(--color-ink-muted)">{item.body}</p>
            </li>
          ))}
        </ol>
        <p className="max-w-2xl text-sm leading-relaxed text-(--color-ink-muted)">
          This repo ships a first Veil Compact slice (public counters and disclosed strings) with a Next.js read path
          against your local indexer. Private payroll balances and production tax logic are still out of scope. If the
          story and the ledger panel disagree, trust the panel and a green <code className="font-mono">npm run test:e2e</code>.
        </p>
        <div className="mt-8 max-w-3xl">
          <Suspense fallback={<LedgerFallback />}>
            <VeilLedgerStrip />
          </Suspense>
        </div>
      </section>

      <section className="mt-24 space-y-6" id="demo">
        <h2 className="text-2xl font-medium tracking-tight">Demo checklist</h2>
        <ul className="max-w-2xl list-inside list-disc space-y-2 text-(--color-ink-muted)">
          <li>Run `npm install` then `npm run setup` (Docker required).</li>
          <li>Confirm `npm run test:e2e` exits 0 against your deployed address.</li>
          <li>
            On `/employer`, run a placeholder employee registration and batch so public counters move, then compare the
            employee receipt hash on `/employee` with the same indexer snapshot.
          </li>
          <li>Walk employer → employee → audit shells in this site and match them to the narrative you plan to say out loud.</li>
          <li>
            Hit <code className="rounded bg-(--color-canvas-elevated) px-1 py-0.5 font-mono">GET /api/veil-ledger</code>{" "}
            or open employer or audit routes to see the same indexer snapshot the UI uses.
          </li>
          <li>When payroll circuits ship, add a step to run a batch and show selective disclosure end to end.</li>
        </ul>
      </section>

      <section className="mt-20 border-t border-(--color-edge) pt-12">
        <h2 className="text-xl font-medium tracking-tight">Where to go next</h2>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link className="text-(--color-accent) hover:text-(--color-accent-hover)" href="/employer">
            Employer dashboard shell
          </Link>
          <span className="text-(--color-edge)">·</span>
          <Link className="text-(--color-accent) hover:text-(--color-accent-hover)" href="/employee">
            Employee dashboard shell
          </Link>
          <span className="text-(--color-edge)">·</span>
          <Link className="text-(--color-accent) hover:text-(--color-accent-hover)" href="/audit">
            Audit dashboard shell
          </Link>
        </div>
      </section>
    </div>
  );
}
