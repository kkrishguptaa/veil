import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { VeilLedgerStrip } from "../components/VeilLedgerStrip";
import { AuditDisclosureExport } from "./AuditDisclosureExport";

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
        <h1 className="text-3xl font-medium tracking-tight">Auditor workspace</h1>
        <p className="text-(--color-ink-muted)">
          Selective disclosure means some rows stay hidden on purpose. This page states what you can rely on today
          (public ledger fields via the indexer) and what still requires employer-authorized proofs in a future Veil
          slice.
        </p>
      </div>

      <div className="mt-10">
        <Suspense fallback={<LedgerFallback />}>
          <VeilLedgerStrip />
        </Suspense>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Trust boundaries</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-(--color-ink-muted)">
            <li>
              <span className="font-medium text-(--color-ink)">Indexer:</span> you are reading Midnight indexer output
              the operator configured for this demo — not a self-signed PDF from HR.
            </li>
            <li>
              <span className="font-medium text-(--color-ink)">Proof server:</span> placeholder circuits still hit a
              real proof server for transactions; treat it as lab infrastructure, not a compliance box check.
            </li>
            <li>
              <span className="font-medium text-(--color-ink)">Employer grants:</span> row-level salary disclosure will
              need explicit grants and audited circuits — absent fields are intentional selective disclosure, not a
              missing-data bug.
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Withheld by design</h2>
          <p className="mt-4 text-sm leading-relaxed text-(--color-ink-muted)">
            Individual employee salary lines, bank settlement, and production tax engines stay out of this repository
            on purpose. When a field is missing here, assume it is private until a proof-backed export says otherwise.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-(--color-ink-muted)">
            Future <span className="font-mono text-(--color-ink)">discloseAuditData</span>-style circuits belong in the
            Compact slice; the exports below only wrap today&apos;s public anchors so demos stay honest.
          </p>
        </div>
      </div>

      <AuditDisclosureExport />
    </div>
  );
}
