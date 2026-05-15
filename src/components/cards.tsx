import type { ReactNode } from "react";

export function Card({
  children,
  tone = "light",
  className = "",
}: {
  children: ReactNode;
  tone?: "light" | "dark" | "cream";
  className?: string;
}) {
  const tones = {
    light: "border-[var(--hairline)] bg-white text-[var(--ink)]",
    dark: "border-transparent bg-[var(--brand-dark)] text-white",
    cream: "border-transparent bg-[var(--canvas-cream)] text-[var(--ink)]",
  };

  return (
    <section className={`rounded-xl border p-6 ${tones[tone]} ${className}`}>
      {children}
    </section>
  );
}

export function Pill({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1px] ${
        strong ? "bg-[var(--primary)] text-white" : "bg-[#b9b9f9] text-[var(--primary-deep)]"
      }`}
    >
      {children}
    </span>
  );
}

export function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-white p-4">
      <div className="text-[13px] text-[var(--ink-mute)]">{label}</div>
      <div className="tabular mt-2 text-2xl font-light tracking-[-0.4px]">{value}</div>
    </div>
  );
}
