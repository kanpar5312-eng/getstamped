"use client";

import Link from "next/link";
import { CountUp } from "@/components/dashboard/CountUp";

export type TurnSummary = {
  question: string;
  answer: string;
  timestampSec: number;
  note: string;
  isWeakest?: boolean;
};

export type Scores = {
  overall: number;
  clarity: number;
  confidence: number;
  consistency: number;
  financial: number;
};

type Props = {
  verdict: string;
  scores: Scores;
  turns: TurnSummary[];
  durationSec: number;
  blurredPaywall?: boolean;
  onRetryWeak: () => void;
};

const CARDS: { key: keyof Omit<Scores, "overall">; label: string; note: string }[] = [
  { key: "clarity",     label: "Clarity",         note: "Sentences land in one breath. No backtracking." },
  { key: "confidence",  label: "Confidence",      note: "Steady tone; minimal filler words." },
  { key: "consistency", label: "Consistency",     note: "Story matches across questions." },
  { key: "financial",   label: "Financial story", note: "Sponsor named; numbers match documents." },
];

export function FeedbackScreen({
  verdict,
  scores,
  turns,
  durationSec,
  blurredPaywall = false,
  onRetryWeak,
}: Props) {
  const mins = Math.round(durationSec / 60);
  return (
    <div className="mx-auto w-full max-w-[860px] py-10">
      {/* Verdict + headline score */}
      <header className="text-center">
        <p data-eyebrow="">Feedback</p>
        <h1 className="mt-5 font-display text-[28px] sm:text-[34px] tracking-tight text-[var(--ink)] leading-[1.15] max-w-[680px] mx-auto">
          {verdict}
        </h1>
        <div className="mt-6 flex items-baseline justify-center gap-1">
          <span className="font-display tracking-tight text-[var(--ink)] tabular-nums leading-none text-[88px] sm:text-[120px]">
            <CountUp value={scores.overall} duration={900} />
          </span>
          <span className="font-display text-[var(--stone)] text-[28px] sm:text-[36px] leading-none">
            /100
          </span>
        </div>
        <p className="mt-3 text-[13px] text-[var(--stone)]">
          {turns.length} questions · {mins} min
        </p>
      </header>

      {/* Score grid */}
      <section className="relative mt-10">
        <div
          className={[
            "grid grid-cols-1 sm:grid-cols-2 gap-4 transition-[filter] duration-300",
            blurredPaywall ? "blur-md select-none pointer-events-none" : "",
          ].join(" ")}
        >
          {CARDS.map((c) => {
            const value = scores[c.key];
            return (
              <article
                key={c.key}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p data-eyebrow="">{c.label}</p>
                  <span className="font-display text-[28px] tabular-nums text-[var(--ink)] leading-none">
                    <CountUp value={value} duration={900} />
                    <span className="text-[var(--stone)] text-[14px]">/100</span>
                  </span>
                </div>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-sunken)]">
                  <div
                    className="progress-ember h-full rounded-full"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <p className="mt-3 text-[13px] text-[var(--ink-soft)] leading-relaxed">
                  {c.note}
                </p>
              </article>
            );
          })}
        </div>
        {blurredPaywall && (
          <PaywallOverlay />
        )}
      </section>

      {/* Key moments */}
      <section className="mt-12">
        <p data-eyebrow="">Key moments</p>
        <ol className="mt-4 space-y-3">
          {turns.map((t, i) => (
            <li
              key={i}
              className={[
                "rounded-xl border bg-[var(--surface)] p-4 sm:p-5",
                t.isWeakest
                  ? "border-[var(--ember)]"
                  : "border-[var(--line)]",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[var(--stone)] tabular-nums">
                  {formatTs(t.timestampSec)}
                </span>
                {t.isWeakest && (
                  <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[var(--ember-hover)] bg-[var(--ember-soft)] px-2 py-[2px] rounded-[4px]">
                    Weakest moment
                  </span>
                )}
              </div>
              <p className="mt-2 font-display text-[16px] text-[var(--ink)] leading-snug">
                {t.question}
              </p>
              <p className="mt-2 text-[13px] text-[var(--ink-soft)] italic leading-relaxed">
                &ldquo;{t.answer}&rdquo;
              </p>
              <p className="mt-3 text-[13px] text-[var(--ink)] leading-relaxed">
                <span className="font-semibold">Officer note:</span> {t.note}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTAs */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetryWeak}
          className="btn-ember inline-flex items-center gap-2 rounded-lg px-5 py-[10px] text-[13px] font-semibold"
        >
          Retry weak questions →
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-5 py-[10px] text-[13px] font-medium text-[var(--ink)] hover:border-[var(--line-hover)] transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

function PaywallOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center shadow-[0_30px_80px_-30px_rgba(28,27,26,0.25)]">
        <p data-eyebrow="">Free tier limit</p>
        <h2 className="mt-3 font-display text-[22px] tracking-tight text-[var(--ink)] leading-snug">
          Unlock your full breakdown
        </h2>
        <p className="mt-2 text-[13px] text-[var(--ink-soft)] leading-relaxed">
          See every score, every officer note, and unlimited retries.
        </p>
        <Link
          href="/dashboard/upgrade"
          className="btn-ember mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-[10px] text-[13px] font-semibold"
        >
          Upgrade for $19 →
        </Link>
      </div>
    </div>
  );
}

function formatTs(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
