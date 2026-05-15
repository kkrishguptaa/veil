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
      <div className="gradient-mesh" aria-hidden />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 py-5 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-4 rounded bg-white/82 px-5 py-4 text-[15px] text-[var(--ink)] shadow-sm ring-1 ring-[var(--hairline)] backdrop-blur">
          <Link href="/" className="display-type text-[26px]">
            Veil
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-[var(--ink-secondary)]">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 hover:bg-[var(--canvas-soft)]">
                {item.label}
              </Link>
            ))}
          </div>
          <Link
            href="/recruiter-search"
            className="rounded-full bg-[var(--primary)] px-4 py-2 text-white transition hover:bg-[var(--primary-press)]"
          >
            Run Demo
          </Link>
        </nav>
        {children}
      </div>
    </main>
  );
}
