import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { VeilLedgerStrip } from "../components/VeilLedgerStrip";

export const metadata: Metadata = {
  title: "Audit",
};

function LedgerFallback() {
  return (
    <aside className="rounded-xl border border-dashed border-(--color-edge) bg-(--color-canvas-elevated) p-5 text-sm text-(--color-ink-muted)">
      Loading on-chain snapshot from the indexer…
    </aside>
  );
}

export default function AuditPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm text-(--color-ink-muted)">
          <Link href="/" className="text-(--color-accent) hover:text-(--color-accent-hover)">
            Overview
          </Link>
          <span className="text-(--color-edge)"> / </span>
          Audit
        </p>
        <h1 className="text-3xl font-medium tracking-tight">Audit workspace</h1>
        <p className="text-(--color-ink-muted)">
          Auditors should see aggregates and proof status first. Individual salaries stay absent unless an employer
          explicitly discloses them for a bounded review.
        </p>
      </div>

      <div className="mt-10">
        <Suspense fallback={<LedgerFallback />}>
          <VeilLedgerStrip />
        </Suspense>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Batch proof</h2>
          <p className="mt-3 text-sm text-(--color-ink-muted)">
            The live <span className="font-mono text-(--color-ink)">last_batch_hash</span> placeholder from the contract
            appears in the indexer panel above when batches run. This card stays for narrative layout until real proof
            bundles ship.
          </p>
        </div>
        <div className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Disclosure window</h2>
          <p className="mt-3 text-sm text-(--color-ink-muted)">
            Grant UI and expiry copy will live here. For now this panel exists so the storyboard does not pretend
            auditors have silent root access.
          </p>
        </div>
      </div>
    </div>
  );
}
