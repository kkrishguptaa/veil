import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { VeilLedgerStrip } from "../components/VeilLedgerStrip";

export const metadata: Metadata = {
  title: "Employee",
};

function LedgerFallback() {
  return (
    <aside className="rounded-xl border border-dashed border-(--color-edge) bg-(--color-canvas-elevated) p-5 text-sm text-(--color-ink-muted)">
      Loading on-chain snapshot from the indexer…
    </aside>
  );
}

export default function EmployeePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm text-(--color-ink-muted)">
          <Link href="/" className="text-(--color-accent) hover:text-(--color-accent-hover)">
            Overview
          </Link>
          <span className="text-(--color-edge)"> / </span>
          Employee
        </p>
        <h1 className="text-3xl font-medium tracking-tight">Employee payslip view</h1>
        <p className="text-(--color-ink-muted)">
          Payslip decryption and per-employee proofs are not in this build. The shared ledger read below is the same
          public slice an employee could trust for batch counters and status text once their wallet flow exists.
        </p>
      </div>

      <div className="mt-10 max-w-3xl">
        <Suspense fallback={<LedgerFallback />}>
          <VeilLedgerStrip />
        </Suspense>
      </div>

      <div className="mt-12 max-w-xl rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Latest period</h2>
            <p className="mt-2 text-lg font-medium text-(--color-ink)">No payslip loaded</p>
          </div>
          <span className="rounded-full border border-(--color-edge) px-3 py-1 text-xs text-(--color-ink-muted)">
            Verification: stub
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-(--color-ink-muted)">
          Amounts and dates stay out of this demo until we ship encrypted detail. For now, treat the indexer panel above
          as the honest signal for public batch metadata only.
        </p>
      </div>
    </div>
  );
}
