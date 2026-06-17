import type { ReactNode } from "react";

type Props = {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: "forest" | "accent";
};

/**
 * Stat tile per spec — eyebrow label + big display number in forest + hint.
 */
export function StatTile({ label, value, hint, accent = "forest" }: Props) {
  const color =
    accent === "forest"
      ? "text-[var(--color-ink)]"
      : "text-[var(--color-accent-deep)]";

  return (
    <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-4 sm:p-5">
      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)] font-medium">
        {label}
      </div>
      <div
        className={`mt-2 font-display text-2xl sm:text-3xl tracking-tight tabular-nums leading-none ${color}`}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] text-[var(--color-muted)]">{hint}</div>
      )}
    </div>
  );
}
