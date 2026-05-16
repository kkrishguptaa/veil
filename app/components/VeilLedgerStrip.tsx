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
        </p>
        {result.code === "no_deployment" ? (
          <p className="mt-3 text-xs">
            Local path: run <code className="rounded bg-(--color-canvas) px-1 py-0.5 font-mono">docker compose up -d --wait</code> then{" "}
            <code className="rounded bg-(--color-canvas) px-1 py-0.5 font-mono">npm run setup</code>. Optional: set{" "}
            <code className="rounded bg-(--color-canvas) px-1 py-0.5 font-mono">VEIL_CONTRACT_ADDRESS</code> to a hex address.
          </p>
        ) : null}
        {result.code === "indexer_unreachable" ? (
          <p className="mt-3 text-xs">
            Confirm the Midnight indexer in Docker is up on the port from your active network config, then retry. Quick
            check: <code className="rounded bg-(--color-canvas) px-1 py-0.5 font-mono">docker compose ps</code> and{" "}
            <code className="rounded bg-(--color-canvas) px-1 py-0.5 font-mono">npm run network</code>.
          </p>
        ) : null}
        {result.code === "not_indexed" ? (
          <p className="mt-3 text-xs">
            If you just deployed, wait a moment for the indexer to catch up. If it persists, redeploy with{" "}
            <code className="rounded bg-(--color-canvas) px-1 py-0.5 font-mono">npm run setup</code> and confirm{" "}
            <code className="rounded bg-(--color-canvas) px-1 py-0.5 font-mono">npm run test:e2e</code> passes.
          </p>
        ) : null}
      </aside>
    );
  }

  const { organization_id, employee_registry_version, batch_count, last_batch_hash, status_message } =
    result.ledger as Record<string, string | undefined>;

  return (
    <aside className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-5 text-sm" aria-live="polite">
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
