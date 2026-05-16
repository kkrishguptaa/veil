import type { VeilLedgerResult } from "@/lib/veil/get-veil-public-ledger";

export function recoveryStepsForLedgerCode(
  code: Extract<VeilLedgerResult, { ok: false }>["code"],
): string[] {
  switch (code) {
    case "no_deployment":
      return [
        "Start Docker services: `docker compose up -d --wait`.",
        "Run `npm run setup` so the deploy step writes the contract address into `.midnight-state.json`.",
        "For CI or a custom address, set `VEIL_CONTRACT_ADDRESS` to the deployed contract hex.",
      ];
    case "indexer_unreachable":
      return [
        "Confirm the Midnight indexer is reachable: `docker compose ps` and check container health.",
        "Run `npm run network` and verify indexer HTTP or WebSocket URLs match your compose file.",
        "If devnet was stopped, start it again before expecting live ledger reads.",
      ];
    case "not_indexed":
      return [
        "Wait a few seconds after deploy, then refresh so the indexer can catch the contract.",
        "If the address changed, run `npm run setup` again and confirm `.midnight-state.json` matches.",
        "Run `npm run test:e2e` to verify deploy, indexer, and read-back on this machine.",
      ];
    default:
      return [];
  }
}

/** Heuristic recovery lines for employer placeholder script failures (human-readable stderr). */
export function recoveryStepsForEmployerTxError(message: string): string[] {
  const m = message.toLowerCase();
  const steps: string[] = [];
  if (m.includes("no contract address") || m.includes("contract address on file")) {
    steps.push("Run `npm run setup`, or set `VEIL_CONTRACT_ADDRESS` to your deployed hex address.");
  }
  if (m.includes("proof server") || m.includes("proving")) {
    steps.push("Start local services with `docker compose up -d` (or set `MIDNIGHT_PROOF_SERVER_URL`).");
  }
  if (m.includes("compiled contract missing") || m.includes("npm run compile")) {
    steps.push("Run `npm run compile` so `contracts/managed/veil/` exists.");
  }
  if (m.includes("econnrefused") || m.includes("fetch failed") || m.includes("indexer")) {
    steps.push("Confirm Docker devnet is up: `docker compose ps`, then `npm run network` for URL sanity.");
  }
  if (m.includes("dust") || m.includes("insufficient funds")) {
    steps.push("Local wallet may need a moment to fund dust; wait and retry, or restart devnet per README.");
  }
  if (steps.length === 0) {
    steps.push("See README quick start: install, Docker, `npm run setup`, then retry this action.");
  }
  return steps;
}

/** Recovery lines for employer API Bearer / network guard failures. */
export function employerAuthRecoverySteps(status: number): string[] {
  if (status === 401) {
    return [
      "Set VEIL_EMPLOYER_API_TOKEN on the Next.js server to a secret value.",
      "Paste the same value in the employer page token field so requests send Authorization: Bearer <token>.",
    ];
  }
  return [
    "Non-local networks require VEIL_EMPLOYER_API_TOKEN for in-app employer transactions.",
    "Use local devnet (network `undeployed`) without a token, or use CLI scripts from README as a fallback.",
  ];
}
