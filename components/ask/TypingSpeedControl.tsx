"use client";

/* ════════════════════════════════════════════════════════════════════════════
   TypingSpeedControl — small pill trigger that opens a Claude-style popover
   listing the five typing-speed presets for Vera. The active option is
   marked with a persimmon dot, others are muted. Click outside or press
   Escape to close.

   Selection persists to localStorage so it survives navigation/reload.
   `cpsFor(level)` is exported so the parent wires it into <TypedText cps={…}>.
   ═════════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";

export const SPEED_LEVELS = ["slow", "normal", "fast", "faster", "instant"] as const;
export type SpeedLevel = (typeof SPEED_LEVELS)[number];

const LABELS: Record<SpeedLevel, string> = {
  slow: "Slow",
  normal: "Normal",
  fast: "Fast",
  faster: "Faster",
  instant: "Instant",
};

const HINTS: Record<SpeedLevel, string> = {
  slow: "Easy to read along",
  normal: "Steady cadence",
  fast: "Default — quick but readable",
  faster: "Skim the answer",
  instant: "No animation",
};

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

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3 transition-transform"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function TypingSpeedControl({
  level,
  onChange,
}: {
  level: SpeedLevel;
  onChange: (l: SpeedLevel) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* Close on outside-click / Escape */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[11px] text-[var(--color-ink-soft)] hover:border-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
      >
        <span className="text-[var(--color-persimmon)]"><BoltIcon /></span>
        <span>
          Speed{" "}
          <span className="font-medium text-[var(--color-ink)]">{LABELS[level]}</span>
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Vera typing speed"
          /* Anchor to the trigger's RIGHT edge so the popover grows leftward —
             otherwise the 220px panel overflows the viewport on mobile,
             since the speed button sits in the right side of the toolbar. */
          className="absolute bottom-full right-0 z-30 mb-2 w-[220px] max-w-[calc(100vw-32px)] rounded-xl border border-[var(--color-border)] bg-[var(--color-paper-soft)] shadow-[0_8px_28px_-12px_rgba(15,20,25,0.18)] p-1.5 animate-bubble-in-left"
        >
          <div className="px-2.5 pt-1.5 pb-1 text-[9px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
            Vera typing speed
          </div>
          {SPEED_LEVELS.map((l) => {
            const active = l === level;
            return (
              <button
                key={l}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(l);
                  setOpen(false);
                }}
                className={[
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors",
                  active
                    ? "bg-[var(--color-persimmon-tint)]/60"
                    : "hover:bg-[var(--color-paper-deep)]/60",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <div className={`text-[12.5px] ${active ? "font-semibold text-[var(--color-ink)]" : "text-[var(--color-ink)]"}`}>
                    {LABELS[l]}
                  </div>
                  <div className="text-[10px] text-[var(--color-ink-soft)]/80 truncate">
                    {HINTS[l]}
                  </div>
                </div>
                <span
                  aria-hidden
                  className={[
                    "block h-2 w-2 flex-shrink-0 rounded-full transition-all",
                    active
                      ? "bg-[var(--color-persimmon)] shadow-[0_0_0_3px_var(--color-persimmon-tint)]"
                      : "bg-[var(--color-border)]",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
