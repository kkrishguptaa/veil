import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/candidate-vault", label: "Candidate Vault" },
  { href: "/recruiter-search", label: "Recruiter Search" },
  { href: "/disclosure", label: "Disclosure" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <a
        href="#page-content"
        className="absolute left-4 top-0 z-50 -translate-y-14 rounded-full bg-[var(--primary)] px-4 py-2 text-sm text-white shadow-md transition-transform focus:translate-y-4 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--brand-dark)]"
      >
        Skip to content
      </a>
      <div className="gradient-mesh" aria-hidden />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 py-5 sm:px-8 lg:px-10">
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center justify-between gap-4 rounded bg-white/82 px-5 py-4 text-[15px] text-[var(--ink)] shadow-sm ring-1 ring-[var(--hairline)] backdrop-blur"
        >
          <Link
            href="/"
            aria-label="Veil home"
            className="display-type text-[26px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            Veil
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-[var(--ink-secondary)]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 hover:bg-[var(--canvas-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link
            href="/recruiter-search"
            className="rounded-full bg-[var(--primary)] px-4 py-2 text-white transition hover:bg-[var(--primary-press)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Open recruiter search
          </Link>
        </nav>
        <div id="page-content">{children}</div>
      </div>
    </main>
  );
}
