"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

type Flash = { kind: "idle" | "loading" | "success" | "error"; message: string };

function authHeaders(token: string): HeadersInit {
  const t = token.trim();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function EmployerSubmitPanel() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState<Flash>({ kind: "idle", message: "" });
  const [batchLabel, setBatchLabel] = useState("");
  const [apiTokenField, setApiTokenField] = useState("");

  useEffect(() => {
    setApiTokenField(window.localStorage.getItem("veilEmployerApiToken") ?? "");
  }, []);

  const register = useCallback(() => {
    setFlash({ kind: "loading", message: "Submitting placeholder employee-registry bump…" });
    startTransition(async () => {
      try {
        const res = await fetch("/api/veil/employer/register-employee", {
          method: "POST",
          headers: { ...authHeaders(apiTokenField) },
        });
        const data = (await res.json()) as { ok?: boolean; error?: string; detail?: string };
        if (!res.ok || !data.ok) {
          setFlash({
            kind: "error",
            message: data.error || `Request failed (${res.status}).`,
          });
          return;
        }
        setFlash({
          kind: "success",
          message: data.detail || "Transaction finalized. Refresh the ledger panel to see the new counter.",
        });
        router.refresh();
      } catch {
        setFlash({ kind: "error", message: "Network error while talking to this app. Is `npm run dev` running?" });
      }
    });
  }, [router, apiTokenField]);

  const runBatch = useCallback(() => {
    setFlash({ kind: "loading", message: "Submitting placeholder payroll batch anchor…" });
    startTransition(async () => {
      try {
        const trimmed = batchLabel.trim();
        const res = await fetch("/api/veil/employer/run-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders(apiTokenField) },
          body: JSON.stringify(trimmed ? { batchHash: trimmed } : {}),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string; detail?: string; batchHash?: string };
        if (!res.ok || !data.ok) {
          setFlash({
            kind: "error",
            message: data.error || `Request failed (${res.status}).`,
          });
          return;
        }
        setFlash({
          kind: "success",
          message: data.detail || "Batch placeholder submitted. Public counters and anchor hash update only.",
        });
        router.refresh();
      } catch {
        setFlash({ kind: "error", message: "Network error while talking to this app. Is `npm run dev` running?" });
      }
    });
  }, [router, batchLabel, apiTokenField]);

  return (
    <div className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6">
      <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Placeholder on-chain actions</h2>
      <p className="mt-3 text-sm leading-relaxed text-(--color-ink-muted)">
        These buttons call the Veil Compact placeholder circuits from this machine using the same devnet wallet as{" "}
        <code className="font-mono text-xs text-(--color-ink)">npm run deploy</code>. They only move{" "}
        <span className="font-mono text-(--color-ink)">employee_registry_version</span>,{" "}
        <span className="font-mono text-(--color-ink)">batch_count</span>, and{" "}
        <span className="font-mono text-(--color-ink)">last_batch_hash</span> — not private salary payloads (those still
        need audited circuits).
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={register}
          className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-canvas) transition enabled:hover:bg-(--color-accent-hover) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Working…" : "Register employee (placeholder)"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={runBatch}
          className="rounded-lg border border-(--color-edge) px-4 py-2 text-sm font-medium text-(--color-ink) transition enabled:hover:border-(--color-accent) enabled:hover:text-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Working…" : "Run payroll batch (placeholder)"}
        </button>
      </div>

      <div className="mt-6 space-y-2">
        <label htmlFor="batch-anchor" className="text-xs uppercase tracking-wide text-(--color-ink-muted)">
          Optional batch anchor string
        </label>
        <input
          id="batch-anchor"
          value={batchLabel}
          onChange={(e) => setBatchLabel(e.target.value)}
          placeholder="e.g. april-cycle-demo"
          className="w-full max-w-md rounded-lg border border-(--color-edge) bg-(--color-canvas) px-3 py-2 font-mono text-sm text-(--color-ink) outline-none ring-(--color-accent) focus:ring-2"
          maxLength={512}
        />
        <p className="text-xs text-(--color-ink-muted)">
          Leave blank to let Veil generate a time-stamped demo anchor. This string is disclosed on-chain as{" "}
          <span className="font-mono text-(--color-ink)">last_batch_hash</span> metadata only.
        </p>
      </div>

      <details className="mt-6 rounded-lg border border-dashed border-(--color-edge) bg-(--color-canvas) p-4 text-xs text-(--color-ink-muted)">
        <summary className="cursor-pointer font-medium text-(--color-ink)">Preview / preprod token (optional)</summary>
        <p className="mt-2 leading-relaxed">
          Local devnet (<span className="font-mono">undeployed</span>) does not need a token. For public testnets, set{" "}
          <code className="font-mono">VEIL_EMPLOYER_API_TOKEN</code> on the server and paste the same value here; it is
          saved in this browser as <span className="font-mono">veilEmployerApiToken</span> for Bearer auth.
        </p>
        <label htmlFor="employer-token" className="mt-3 block text-(--color-ink-muted)">
          Token (stored locally)
        </label>
        <input
          id="employer-token"
          type="password"
          autoComplete="off"
          value={apiTokenField}
          onChange={(e) => setApiTokenField(e.target.value)}
          onBlur={() => {
            const v = apiTokenField.trim();
            if (v) window.localStorage.setItem("veilEmployerApiToken", v);
            else window.localStorage.removeItem("veilEmployerApiToken");
          }}
          className="mt-1 w-full max-w-md rounded-lg border border-(--color-edge) bg-(--color-canvas-elevated) px-3 py-2 font-mono text-sm text-(--color-ink) outline-none ring-(--color-accent) focus:ring-2"
          placeholder="Bearer token matching VEIL_EMPLOYER_API_TOKEN"
        />
        <button
          type="button"
          className="mt-2 text-(--color-accent) hover:text-(--color-accent-hover)"
          onClick={() => {
            window.localStorage.removeItem("veilEmployerApiToken");
            setApiTokenField("");
            setFlash({ kind: "success", message: "Cleared saved employer API token from this browser." });
          }}
        >
          Clear saved token
        </button>
      </details>

      {flash.kind !== "idle" ? (
        <p
          className={`mt-5 text-sm leading-relaxed ${
            flash.kind === "error"
              ? "text-(--color-danger)"
              : flash.kind === "success"
                ? "text-(--color-success)"
                : "text-(--color-ink-muted)"
          }`}
          role="status"
          aria-live="polite"
        >
          {flash.message}
        </p>
      ) : null}
    </div>
  );
}
