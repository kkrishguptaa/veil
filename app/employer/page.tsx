import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { VeilLedgerStrip } from "../components/VeilLedgerStrip";

export const metadata: Metadata = {
  title: "Employer",
};

function LedgerFallback() {
  return (
    <aside className="rounded-xl border border-dashed border-(--color-edge) bg-(--color-canvas-elevated) p-5 text-sm text-(--color-ink-muted)">
      Loading on-chain snapshot from the indexer…
    </aside>
  );
}

export default function EmployerPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm text-(--color-ink-muted)">
          <Link href="/" className="text-(--color-accent) hover:text-(--color-accent-hover)">
            Overview
          </Link>
          <span className="text-(--color-edge)"> / </span>
          Employer
        </p>
        <h1 className="text-3xl font-medium tracking-tight">Employer workspace</h1>
        <p className="text-(--color-ink-muted)">
          Org context, employee rows, and batch runs still need wallet-backed transactions in the app. The panel below is
          a real indexer read of the public Veil ledger fields after you compile, deploy, and run Docker devnet locally.
        </p>
      </div>

      <div className="mt-10">
        <Suspense fallback={<LedgerFallback />}>
          <VeilLedgerStrip />
        </Suspense>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Next payroll</h2>
          <p className="mt-3 text-2xl font-medium text-(--color-ink)">May 31</p>
          <p className="mt-2 text-sm text-(--color-ink-muted)">Placeholder date for layout only.</p>
        </div>
        <div className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6 lg:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Employees on file</h2>
          <p className="mt-4 text-sm text-(--color-ink-muted)">
            HR-style rows are still off-chain in this milestone. The contract exposes a placeholder{" "}
            <span className="font-mono text-(--color-ink)">registerEmployeePlaceholder</span> circuit for when we wire
            submit from this UI.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          className="cursor-not-allowed rounded-lg bg-(--color-edge) px-4 py-2 text-sm font-medium text-(--color-ink-muted)"
          disabled
          title="Submitting transactions from the browser is not implemented yet."
        >
          Run payroll batch (needs in-app wallet submit)
        </button>
        <button
          type="button"
          className="cursor-not-allowed rounded-lg border border-(--color-edge) px-4 py-2 text-sm text-(--color-ink-muted)"
          disabled
          title="Proof history UI is not wired yet."
        >
          View proof history (not wired)
        </button>
      </div>
    </div>
  );
}
