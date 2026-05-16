import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { VeilLedgerStrip } from "../components/VeilLedgerStrip";
import { EmployeeReceiptPanel } from "./EmployeeReceiptPanel";

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
        <h1 className="text-3xl font-medium tracking-tight">Employee view</h1>
        <p className="text-(--color-ink-muted)">
          Compare what Veil exposes on the Midnight indexer today with what still lives on the roadmap (private payslip
          decryption). If the two ever disagree, trust the indexer panel and a green <code className="font-mono">npm run test:e2e</code>.
        </p>
      </div>

      <div className="mt-10 max-w-6xl">
        <Suspense fallback={<LedgerFallback />}>
          <VeilLedgerStrip />
        </Suspense>
      </div>

      <EmployeeReceiptPanel />
    </div>
  );
}
