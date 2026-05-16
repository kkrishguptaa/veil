import { NextResponse } from "next/server";

import { employerTxAuthError } from "@/lib/veil/employer-api-auth";
import { runEmployerPlaceholderViaScript } from "@/lib/veil/run-employer-via-script";
import { resolveNetwork } from "@/scripts/network";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_HASH_LEN = 512;

export async function POST(req: Request) {
  const { network } = resolveNetwork({ argv: ["node", "veil-web"], cwd: process.cwd() });
  const authErr = employerTxAuthError(req.headers.get("authorization"), network);
  if (authErr) {
    return NextResponse.json({ ok: false, error: authErr.body }, { status: authErr.status });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const raw =
    typeof body === "object" && body !== null && "batchHash" in body
      ? String((body as { batchHash?: unknown }).batchHash ?? "").trim()
      : "";
  const batchHash =
    raw.length > 0
      ? raw.slice(0, MAX_HASH_LEN)
      : `veil-placeholder-batch-${new Date().toISOString()}`;

  const result = await runEmployerPlaceholderViaScript("batch", batchHash);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }
  return NextResponse.json(result);
}
