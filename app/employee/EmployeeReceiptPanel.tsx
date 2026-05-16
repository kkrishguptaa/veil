"use client";

import { useCallback, useEffect, useState } from "react";

import {
  buildVeilPublicReceiptPayload,
  serializeVeilPublicReceipt,
  sha256HexUtf8,
  type VeilLedgerApiError,
  type VeilLedgerApiOk,
} from "@/lib/veil/veil-public-receipt";

type LedgerGet = VeilLedgerApiOk | VeilLedgerApiError;

function parseCount(v: unknown): bigint {
  if (typeof v === "bigint") return v;
  if (typeof v === "number" && Number.isFinite(v)) return BigInt(Math.trunc(v));
  if (typeof v === "string" && v.trim() !== "") {
    try {
      return BigInt(v.trim());
    } catch {
      return 0n;
    }
  }
  return 0n;
}

export function EmployeeReceiptPanel() {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [lastHash, setLastHash] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<VeilLedgerApiOk | null>(null);
  const [snapErr, setSnapErr] = useState<string | null>(null);
  const [snapRecovery, setSnapRecovery] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/veil-ledger");
        const data = (await res.json()) as LedgerGet;
        if (cancelled) return;
        if (!data.ok) {
          setSnapshot(null);
          setSnapErr(data.message || "Indexer read failed.");
          setSnapRecovery(data.recoverySteps?.length ? data.recoverySteps : null);
          return;
        }
        setSnapErr(null);
        setSnapRecovery(null);
        setSnapshot(data);
      } catch {
        if (!cancelled) {
          setSnapshot(null);
          setSnapErr("Could not reach `/api/veil-ledger`.");
          setSnapRecovery(["Confirm `npm run dev` is running for this site.", "If the dev server is up, check the Network tab for a 500 from `/api/veil-ledger` and read the JSON error body."]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const batchCount = snapshot ? parseCount(snapshot.ledger.batch_count) : null;
  const anchored = batchCount !== null && batchCount > 0n;

  const buildReceipt = useCallback(async () => {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/veil-ledger");
      const data = (await res.json()) as LedgerGet;
      if (!data.ok) {
        const extra =
          data.recoverySteps?.length && data.recoverySteps.length > 0
            ? ` ${data.recoverySteps[0]}`
            : "";
        setNote((data.message || "Indexer read failed.") + extra);
        setLastHash(null);
        return;
      }
      const payload = buildVeilPublicReceiptPayload(data);
      const body = serializeVeilPublicReceipt(payload);
      const hash = await sha256HexUtf8(body);
      setLastHash(hash);
      setNote(
        "Receipt covers public anchors only (batch counters and disclosed strings). Private payslip decryption is still on the roadmap for Veil.",
      );
    } catch {
      setNote("Could not reach this app’s indexer API. Confirm `npm run dev` is running.");
      setLastHash(null);
    } finally {
      setBusy(false);
    }
  }, []);

  const copyOrDownload = useCallback(async () => {
    const res = await fetch("/api/veil-ledger");
    const data = (await res.json()) as LedgerGet;
    if (!data.ok) return;
    const payload = buildVeilPublicReceiptPayload(data);
    const body = serializeVeilPublicReceipt(payload);
    const hash = await sha256HexUtf8(body);
    const fileBody = `${body}receipt_sha256: ${hash}\n`;
    try {
      await navigator.clipboard.writeText(fileBody);
      setNote("Copied receipt text (including hash line) to your clipboard.");
    } catch {
      const blob = new Blob([fileBody], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `veil-public-receipt-${hash.slice(0, 8)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setNote("Downloaded receipt file (clipboard was unavailable).");
    }
  }, []);

  return (
    <div className="mt-12 space-y-8">
      <div className="max-w-2xl rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Indexer verification</h2>
            <p className="mt-2 text-lg font-medium text-(--color-ink)">Public anchors from Veil</p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              snapErr
                ? "border-(--color-edge) text-(--color-danger)"
                : anchored
                  ? "border-(--color-success) text-(--color-success)"
                  : "border-(--color-edge) text-(--color-ink-muted)"
            }`}
          >
            {snapErr ? "Indexer: needs setup" : anchored ? "Batch anchor: present" : "Batch anchor: not yet recorded"}
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-(--color-ink-muted)">
          {snapErr
            ? snapErr
            : snapshot
              ? `Network ${snapshot.network} · batch_count ${String(snapshot.ledger.batch_count ?? "—")} · status_message ${String(snapshot.ledger.status_message || "—")}`
              : "Loading indexer snapshot…"}
        </p>
        {snapErr && snapRecovery?.length ? (
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-(--color-ink-muted)">
            {snapRecovery.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        ) : null}
      </div>

      <div className="max-w-2xl space-y-6 rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6">
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Public receipt (demo)</h2>
        <p className="mt-3 text-sm leading-relaxed text-(--color-ink-muted)">
          Today you can verify what the Veil contract already discloses on the Midnight indexer: organization label,
          registry version, payroll batch count, last batch anchor string, and status text. A future payslip view will
          add encrypted detail you can open locally — that path is not wired here yet.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={buildReceipt}
          className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-canvas) transition enabled:hover:bg-(--color-accent-hover) disabled:opacity-60"
        >
          {busy ? "Reading indexer…" : "Build receipt hash"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void copyOrDownload()}
          className="rounded-lg border border-(--color-edge) px-4 py-2 text-sm font-medium text-(--color-ink) transition enabled:hover:border-(--color-accent) enabled:hover:text-(--color-accent) disabled:opacity-60"
        >
          Copy or download receipt
        </button>
      </div>
      {lastHash ? (
        <div className="rounded-lg border border-(--color-edge) bg-(--color-canvas) p-4 font-mono text-xs text-(--color-ink)">
          <p className="text-(--color-ink-muted)">SHA-256 of canonical receipt body</p>
          <p className="mt-2 break-all">{lastHash}</p>
        </div>
      ) : null}
      {note ? (
        <p className="text-sm leading-relaxed text-(--color-ink-muted)" role="status">
          {note}
        </p>
      ) : null}
      </div>
    </div>
  );
}
