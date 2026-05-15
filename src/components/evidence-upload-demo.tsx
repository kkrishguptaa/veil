"use client";

import { FormEvent, useMemo, useState } from "react";
import type { CandidateVault, EvidenceDocumentKind } from "@/lib/domain";
import { buildDemoVaultFromSubmittedEvidence } from "@/lib/demo-upload";
import { Card, Pill } from "./cards";

const sampleEvidence =
  "Offer letter for Staff backend platform role at Series B startup. TypeScript privacy systems, INR 48L cash, led 7 engineers across 4 years tenure.";

const evidenceKinds: EvidenceDocumentKind[] = [
  "other",
  "resume",
  "offer-letter",
  "pay-statement",
  "performance-review",
  "education-record",
  "linkedin-export",
];

export function EvidenceUploadDemo() {
  const [title, setTitle] = useState("Pasted offer packet");
  const [kind, setKind] = useState<EvidenceDocumentKind>("other");
  const [rawText, setRawText] = useState(sampleEvidence);
  const [submitted, setSubmitted] = useState({
    title: "Pasted offer packet",
    kind: "other" as EvidenceDocumentKind,
    rawText: sampleEvidence,
  });

  const demoVault = useMemo<CandidateVault>(
    () => buildDemoVaultFromSubmittedEvidence(submitted),
    [submitted],
  );

  function submitEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted({ title, kind, rawText });
  }

  return (
    <Card tone="cream" className="card-shadow">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={submitEvidence}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-light tracking-[-0.3px]">Demo Evidence Upload</h2>
            <Pill>Runs AI pipeline</Pill>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-secondary)]">
            Paste candidate-side evidence, submit, and watch Veil create sealed metadata plus
            document-backed claims from that text. Recruiters never see this raw input.
          </p>
          <label className="mt-5 block text-sm font-medium" htmlFor="demo-evidence-title">
            Evidence title
          </label>
          <input
            id="demo-evidence-title"
            className="mt-2 w-full rounded-lg border border-[var(--hairline)] bg-white px-3 py-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <label className="mt-4 block text-sm font-medium" htmlFor="demo-evidence-kind">
            Evidence kind
          </label>
          <select
            id="demo-evidence-kind"
            className="mt-2 w-full rounded-lg border border-[var(--hairline)] bg-white px-3 py-2"
            value={kind}
            onChange={(event) => setKind(event.target.value as EvidenceDocumentKind)}
          >
            {evidenceKinds.map((evidenceKind) => (
              <option key={evidenceKind} value={evidenceKind}>
                {evidenceKind}
              </option>
            ))}
          </select>
          <label className="mt-4 block text-sm font-medium" htmlFor="demo-evidence-text">
            Private evidence text
          </label>
          <textarea
            id="demo-evidence-text"
            className="mt-2 min-h-36 w-full rounded-lg border border-[var(--hairline)] bg-white px-3 py-2"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
          />
          <button
            type="submit"
            className="mt-4 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-medium text-white"
          >
            Extract Verified Claims
          </button>
        </form>

        <div>
          <div className="rounded-lg bg-white/75 p-4">
            <div className="text-sm text-[var(--ink-mute)]">Vault metadata from submitted evidence</div>
            <div className="mt-2 font-medium">{demoVault.evidenceDocuments[0].title}</div>
            <div className="mt-2 text-sm text-[var(--ink-secondary)]">
              {demoVault.evidenceDocuments[0].privateSummary}
            </div>
            <div className="tabular mt-3 text-xs text-[var(--ink-mute)]">
              {demoVault.evidenceDocuments[0].midnightCommitment}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {demoVault.verifiedClaims.map((claim) => (
              <div key={claim.id} className="rounded-lg bg-white/75 p-4">
                <div className="text-[13px] text-[var(--ink-mute)]">{claim.label}</div>
                <div className="mt-2 text-sm">{claim.coarseValue}</div>
                <div className="tabular mt-3 text-xs text-[var(--ink-mute)]">
                  confidence {Math.round(claim.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-[var(--brand-dark)] p-4 text-white">
            <div className="text-sm text-white/70">AI summary</div>
            <p className="mt-2 text-sm leading-6">{demoVault.aiSummary}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
