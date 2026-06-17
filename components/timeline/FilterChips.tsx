"use client";

import type { FilterMode } from "@/components/timeline/types";

type Props = {
  value: FilterMode;
  onChange: (next: FilterMode) => void;
  showLocked: boolean;
};

const LABELS: Record<FilterMode, string> = {
  all: "All",
  incomplete: "Incomplete",
  completed: "Completed",
  locked: "Locked",
};

export function FilterChips({ value, onChange, showLocked }: Props) {
  const options: FilterMode[] = ["all", "incomplete", "completed"];
  if (showLocked) options.push("locked");

  return (
    <div role="radiogroup" aria-label="Filter steps" className="flex flex-wrap items-center gap-1.5">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={[
              "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-accent)]/10",
              active
                ? "bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)] border-[var(--color-accent)]/30"
                : "bg-[var(--color-paper-soft)] text-[var(--color-ink-soft)] border-[var(--color-border-soft)] hover:border-[var(--color-border)]",
            ].join(" ")}
          >
            {LABELS[opt]}
          </button>
        );
      })}
    </div>
  );
}
