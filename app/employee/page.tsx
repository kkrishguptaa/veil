import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Employee",
};

export default function EmployeePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm text-(--color-ink-muted)">
          <Link href="/" className="text-(--color-accent) hover:text-(--color-accent-hover)">
            Overview
          </Link>
          <span className="text-(--color-edge)"> / </span>
          Employee
        </p>
        <h1 className="text-3xl font-medium tracking-tight">Employee payslip view</h1>
        <p className="text-(--color-ink-muted)">
          You should see verification state next to anything sensitive. This shell keeps the layout honest while wallet
          auth and decryption catch up.
        </p>
      </div>

      <div className="mt-12 max-w-xl rounded-xl border border-(--color-edge) bg-(--color-canvas-elevated) p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-(--color-ink-muted)">Latest period</h2>
            <p className="mt-2 text-lg font-medium text-(--color-ink)">No payslip loaded</p>
          </div>
          <span className="rounded-full border border-(--color-edge) px-3 py-1 text-xs text-(--color-ink-muted)">
            Verification: n/a
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-(--color-ink-muted)">
          When data exists, this card holds amount, pay date, and a compact receipt anchor. If decryption is not ready,
          the copy should say that plainly.
        </p>
      </div>
    </div>
  );
}
