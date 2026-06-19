"use client";

/* ════════════════════════════════════════════════════════════════════════════
   TypingSpeedControl — Claude-Code-style "Effort" picker for Vera's
   character-per-second animation. Five stops from Slow → Instant, with the
   active label inlined in the header (Speed **Fast**) and a row of dots
   below bookended by "Slower" / "Instant".

   The current value is persisted to localStorage so the user's preference
   survives page reload. The hook also exports `cpsFor(level)` so the
   parent can wire it straight into <TypedText cps={…}>.
   ═════════════════════════════════════════════════════════════════════════ */

import { useEffect, useState } from "react";

export const SPEED_LEVELS = ["slow", "normal", "fast", "faster", "instant"] as const;
export type SpeedLevel = (typeof SPEED_LEVELS)[number];

const LABELS: Record<SpeedLevel, string> = {
  slow: "Slow",
  normal: "Normal",
  fast: "Fast",
  faster: "Faster",
  instant: "Instant",
};

/* Characters per second per level. "instant" uses an absurdly high cps so
   TypedText completes inside a single frame — no extra branch needed. */
const CPS: Record<SpeedLevel, number> = {
  slow: 35,
  normal: 70,
  fast: 120,
  faster: 200,
  instant: 100000,
};

export const cpsFor = (l: SpeedLevel) => CPS[l];

const STORAGE_KEY = "gs_vera_speed";
const DEFAULT: SpeedLevel = "fast";

export function useTypingSpeed(): [SpeedLevel, (l: SpeedLevel) => void] {
  const [level, setLevel] = useState<SpeedLevel>(DEFAULT);

  // Read once on mount. SSR returns DEFAULT; client hydrates after.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && (SPEED_LEVELS as readonly string[]).includes(raw)) {
        setLevel(raw as SpeedLevel);
      }
    } catch {
      /* localStorage blocked — fall back to default */
    }
  }, []);

  const update = (l: SpeedLevel) => {
    setLevel(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  return [level, update];
}

export function TypingSpeedControl({
  level,
  onChange,
}: {
  level: SpeedLevel;
  onChange: (l: SpeedLevel) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] px-3 py-2">
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-[var(--color-ink-soft)]">
          Speed <span className="font-medium text-[var(--color-ink)]">{LABELS[level]}</span>
        </div>
        <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-muted)]">
          Vera
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] text-[var(--color-muted)]">Slower</span>
        <div
          role="radiogroup"
          aria-label="Typing speed"
          className="relative flex flex-1 items-center justify-between"
        >
          {/* Hairline rail behind the dots */}
          <span
            aria-hidden
            className="absolute left-1.5 right-1.5 top-1/2 h-px -translate-y-1/2 bg-[var(--color-border)]"
          />
          {SPEED_LEVELS.map((l) => {
            const active = l === level;
            return (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={LABELS[l]}
                title={LABELS[l]}
                onClick={() => onChange(l)}
                className="relative z-10 inline-flex h-4 w-4 items-center justify-center"
              >
                <span
                  className={[
                    "block rounded-full transition-all",
                    active
                      ? "h-3 w-3 bg-[var(--color-persimmon)] shadow-[0_0_0_2px_var(--color-paper-soft)]"
                      : "h-1.5 w-1.5 bg-[var(--color-border)] hover:bg-[var(--color-ink-soft)]",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>
        <span className="text-[10px] text-[var(--color-muted)]">Instant</span>
      </div>
    </div>
  );
}
