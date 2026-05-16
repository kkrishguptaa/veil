import { NextResponse } from "next/server";

import { employerTxAuthError } from "@/lib/veil/employer-api-auth";
import { runEmployerPlaceholderViaScript } from "@/lib/veil/run-employer-via-script";
import { employerAuthRecoverySteps, recoveryStepsForEmployerTxError } from "@/lib/veil/veil-ledger-recovery";
import { resolveNetwork } from "@/scripts/network";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  const { network } = resolveNetwork({ argv: ["node", "veil-web"], cwd: process.cwd() });
  const authErr = employerTxAuthError(req.headers.get("authorization"), network);
  if (authErr) {
    return NextResponse.json(
      {
        ok: false,
        network,
        code: authErr.status === 401 ? "employer_auth" : "employer_forbidden",
        error: authErr.body,
        recoverySteps: employerAuthRecoverySteps(authErr.status),
      },
      { status: authErr.status },
    );
  }

  const result = await runEmployerPlaceholderViaScript("register");
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        network,
        code: "employer_script_failed",
        error: result.error,
        recoverySteps: recoveryStepsForEmployerTxError(result.error),
      },
      { status: 502 },
    );
  }
  return NextResponse.json(result);
}
