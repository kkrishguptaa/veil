import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { VeilLedgerStrip } from "../components/VeilLedgerStrip";
import { EmployerSubmitPanel } from "./EmployerSubmitPanel";

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
          Run Veil placeholder payroll circuits from this page using the devnet wallet on the machine where Next.js runs.
          The ledger panel below stays the honest readout of public fields; nothing here claims private salaries are
          already on-chain.
        </p>
      </div>

      <div className="mt-10">
        <Suspense fallback={<LedgerFallback />}>
          <VeilLedgerStrip />
        </Suspense>
      </div>

      <div className="mt-10">
        <EmployerSubmitPanel />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Next payroll</h2>
          <p className="mt-3 text-2xl font-medium text-(--color-ink)">Calendar TBD</p>
          <p className="mt-2 text-sm text-(--color-ink-muted)">Scheduling UI is not in this slice — counters above are the live signal.</p>
        </div>
        <div className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6 lg:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Employees on file</h2>
          <p className="mt-4 text-sm text-(--color-ink-muted)">
            HR-style rows stay off-chain in this milestone. Each{" "}
            <span className="font-mono text-(--color-ink)">registerEmployeePlaceholder</span> call only bumps the public{" "}
            <span className="font-mono text-(--color-ink)">employee_registry_version</span> counter so the story stays
            aligned with the Compact contract.
          </p>
        </div>
      </div>

      <p className="mt-10 text-sm text-(--color-ink-muted)">
        CLI scripts remain the fallback for CI and headless hosts — see <code className="font-mono">README.md</code> for
        the full toolchain path.
      </p>
    </div>
  );
}
