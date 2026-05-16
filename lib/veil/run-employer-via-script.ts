import { execFile } from "node:child_process";
import * as path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type EmployerScriptResult =
  | { ok: true; circuit: string; network: string; contractAddress: string; batchHash?: string; detail?: string }
  | { ok: false; error: string };

/**
 * Runs `scripts/employer-placeholder-submit.ts` in a separate Node process so the
 * Midnight SDK + LevelDB stack never loads inside the Next.js bundle.
 */
export async function runEmployerPlaceholderViaScript(
  subcommand: "register" | "batch",
  batchHash?: string,
): Promise<EmployerScriptResult> {
  const tsxCli = path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
  const script = path.join(process.cwd(), "scripts", "employer-placeholder-submit.ts");
  const argv = [tsxCli, script, subcommand];
  if (subcommand === "batch" && batchHash !== undefined && batchHash.length > 0) {
    argv.push(batchHash);
  }

  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, argv, {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: 50 * 1024 * 1024,
      timeout: 290_000,
    });
    const line = stdout.trim().split("\n").filter(Boolean).pop();
    if (!line) {
      return { ok: false, error: stderr.trim() || "Empty response from submit script." };
    }
    const parsed = JSON.parse(line) as EmployerScriptResult;
    return parsed;
  } catch (e: unknown) {
    const err = e as { stderr?: string; stdout?: string; message?: string };
    const tail = (err.stderr || err.stdout || err.message || String(e)).trim();
    return { ok: false, error: tail || "Employer submit script failed." };
  }
}
