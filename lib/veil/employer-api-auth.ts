import type { NetworkId } from "@/scripts/network";

/**
 * Dev bridge: when `VEIL_EMPLOYER_API_TOKEN` is set, require matching Bearer token.
 * When unset, only `undeployed` (local devnet) is allowed without a token so `npm run dev`
 * stays ergonomic; preview/preprod require an explicit token.
 */
export function employerTxAuthError(
  authHeader: string | null,
  network: NetworkId,
): { status: number; body: string } | null {
  const expected = process.env.VEIL_EMPLOYER_API_TOKEN?.trim();
  const bearer =
    authHeader?.startsWith("Bearer ") || authHeader?.startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null;

  if (expected) {
    if (!bearer || bearer !== expected) {
      return { status: 401, body: "Missing or invalid Authorization Bearer for employer transactions." };
    }
    return null;
  }

  if (network !== "undeployed") {
    return {
      status: 403,
      body:
        "Employer transactions from the app require VEIL_EMPLOYER_API_TOKEN when the active network is not local devnet. Set the env var and send Authorization: Bearer <token>. CLI scripts remain the fallback.",
    };
  }

  return null;
}
