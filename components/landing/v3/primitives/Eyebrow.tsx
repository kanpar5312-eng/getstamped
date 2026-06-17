import type { ReactNode } from "react";

export function Eyebrow({
  children,
  tone = "persimmon",
  className = "",
}: {
  children: ReactNode;
  tone?: "persimmon" | "tint";
  className?: string;
}) {
  const color =
    tone === "tint" ? "text-[var(--color-persimmon-tint)]" : "text-[var(--color-persimmon)]";
  return (
    <p
      className={`font-mono text-[11px] font-semibold uppercase tracking-[0.18em] ${color} ${className}`}
      style={{ fontFamily: "var(--font-mono-stack)" }}
    >
      {children}
    </p>
  );
}
