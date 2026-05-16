"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/employer", label: "Employer" },
  { href: "/employee", label: "Employee" },
  { href: "/audit", label: "Audit" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-(--color-edge) bg-(--color-canvas)">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="text-lg font-medium tracking-tight text-(--color-ink)">
          Veil
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-(--color-ink-muted)" aria-label="Primary">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition hover:text-(--color-ink) ${active ? "font-medium text-(--color-ink)" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            className="transition hover:text-(--color-ink)"
            href="https://midnight.network"
            rel="noreferrer"
            target="_blank"
          >
            Midnight
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-(--color-edge) bg-(--color-canvas-elevated) px-5 py-10 text-sm text-(--color-ink-muted)">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md space-y-2">
          <p className="font-medium text-(--color-ink)">Local devnet only by default</p>
          <p>
            The bundled setup uses a well-known genesis seed for throwaway value. Read the README before you
            point this repo at a network that handles real funds.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:text-right">
          <Link href="/#demo" className="text-(--color-accent) hover:text-(--color-accent-hover)">
            Demo checklist
          </Link>
          <a
            className="text-(--color-accent) hover:text-(--color-accent-hover)"
            href="https://github.com/kkrishguptaa/veil"
            rel="noreferrer"
            target="_blank"
          >
            Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
