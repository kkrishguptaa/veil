import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Employer",
};

export default function EmployerPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm text-(--color-ink-muted)">
          <Link href="/" className="text-(--color-accent) hover:text-(--color-accent-hover)">
            Overview
          </Link>
          <span className="text-(--color-edge)"> / </span>
          Employer
        </p>
        <h1 className="text-3xl font-medium tracking-tight">Employer workspace</h1>
        <p className="text-(--color-ink-muted)">
          This route is a shell for the hackathon story: org context, employee rows, batch run, proof history. Wire it
          to real state once the payroll contract slice lands.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Next payroll</h2>
          <p className="mt-3 text-2xl font-medium text-(--color-ink)">May 31</p>
          <p className="mt-2 text-sm text-(--color-ink-muted)">Placeholder date for layout only.</p>
        </div>
        <div className="rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6 lg:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Employees on file</h2>
          <p className="mt-4 text-sm text-(--color-ink-muted)">
            No rows yet. When the slice ships, this becomes the live list sourced from your chosen storage and contract
            reads.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-canvas) opacity-80"
          disabled
        >
          Run payroll batch (soon)
        </button>
        <button
          type="button"
          className="rounded-lg border border-(--color-edge) px-4 py-2 text-sm text-(--color-ink-muted)"
          disabled
        >
          View proof history (soon)
        </button>
      </div>
    </div>
  );
}
