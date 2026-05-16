/**
 * CLI entry used by the Next.js API bridge (`lib/veil/run-employer-via-script.ts`).
 * Prints one JSON line to stdout for the parent process to parse.
 */
import { runEmployerPlaceholderTx } from "../lib/veil/employer-placeholder-tx";

async function main() {
  const sub = process.argv[2];
  if (sub === "register") {
    const r = await runEmployerPlaceholderTx({ kind: "registerEmployeePlaceholder" });
    console.log(
      JSON.stringify(
        r.ok
          ? {
              ok: true,
              circuit: r.circuit,
              network: r.network,
              contractAddress: r.contractAddress,
              detail:
                "Submitted a placeholder employee-registry update. Only the public counter changed; individual salaries are not written on-chain in this demo slice.",
            }
          : { ok: false, error: r.message },
      ),
    );
    if (!r.ok) process.exit(1);
    return;
  }

  if (sub === "batch") {
    const batchHash =
      process.argv[3]?.trim() || `veil-placeholder-batch-${new Date().toISOString()}`;
    const r = await runEmployerPlaceholderTx({ kind: "runBatchPlaceholder", batchHash });
    console.log(
      JSON.stringify(
        r.ok
          ? {
              ok: true,
              circuit: r.circuit,
              network: r.network,
              contractAddress: r.contractAddress,
              batchHash,
              detail:
                "Submitted a placeholder payroll batch anchor. This updates public batch counters and a demo hash string only — it does not publish private pay amounts.",
            }
          : { ok: false, error: r.message },
      ),
    );
    if (!r.ok) process.exit(1);
    return;
  }

  console.error("Usage: employer-placeholder-submit.ts <register|batch> [batchHash]");
  process.exit(2);
}

main().catch((err) => {
  console.log(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }));
  process.exit(1);
});
