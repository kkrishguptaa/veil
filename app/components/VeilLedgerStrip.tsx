import { getVeilPublicLedger } from "@/lib/veil/get-veil-public-ledger";

function shortAddr(hex: string): string {
  if (hex.length <= 14) return hex;
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`;
}

export async function VeilLedgerStrip() {
  const result = await getVeilPublicLedger();

  if (!result.ok) {
    return (
      <aside
        className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-5 text-sm leading-relaxed text-(--color-ink-muted)"
        aria-live="polite"
      >
        <p className="font-medium text-(--color-ink)">On-chain read</p>
        <p className="mt-2">{result.message}</p>
        <p className="mt-2 text-xs">
          Network: <span className="font-mono text-(--color-ink)">{result.network}</span>
          {result.contractAddress ? (
            <>
              {" "}
              · Contract: <span className="font-mono text-(--color-ink)">{shortAddr(result.contractAddress)}</span>
            </>
          ) : null}
          {" "}
          · Code: <span className="font-mono text-(--color-ink)">{result.code}</span>
        </p>
        {result.recoverySteps.length > 0 ? (
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-(--color-ink-muted)">
            {result.recoverySteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : null}
      </aside>
    );
  }

  const { organization_id, employee_registry_version, batch_count, last_batch_hash, status_message } =
    result.ledger as Record<string, string | undefined>;

  return (
    <aside
      className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-5 text-sm"
      aria-live="polite"
      suppressHydrationWarning
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium text-(--color-ink)">Live Veil ledger (indexer)</p>
        <p className="text-xs text-(--color-ink-muted)">
          <span className="font-mono">{result.network}</span> ·{" "}
          <span className="font-mono" title={result.contractAddress}>
            {shortAddr(result.contractAddress)}
          </span>
        </p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-(--color-ink-muted)">
        Values below are public ledger fields from the demo Compact slice. Private payout state is still not modeled here.
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-(--color-ink-muted)">Organization id (disclosed)</dt>
          <dd className="mt-1 font-mono text-(--color-ink)">{organization_id || "(empty until bootstrap)"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-(--color-ink-muted)">Employee registry version</dt>
          <dd className="mt-1 font-mono text-(--color-ink)">{employee_registry_version ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-(--color-ink-muted)">Batch count</dt>
          <dd className="mt-1 font-mono text-(--color-ink)">{batch_count ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-(--color-ink-muted)">Last batch hash (placeholder)</dt>
          <dd className="mt-1 break-all font-mono text-xs text-(--color-ink)">{last_batch_hash || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-wide text-(--color-ink-muted)">Status message</dt>
          <dd className="mt-1 text-(--color-ink)">{status_message || "—"}</dd>
        </div>
      </dl>
    </aside>
  );
}
