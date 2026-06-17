"use client";

import { useState } from "react";
import Link from "next/link";
import type { DashboardData } from "@/lib/dashboard-state";
import { WhyThisMattersPanel } from "@/components/dashboard/WhyThisMattersPanel";

type Props = {
  data: DashboardData;
};

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function Dot() {
  return <span aria-hidden className="h-1 w-1 rounded-full bg-[var(--color-border)]" />;
}

export function Block2NextStep({ data }: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const { state, nextStep, currentPhase, stepsComplete, isStuck, paywallReached } = data;

  // State A: onboarding card with profile progress bar at top edge
  if (state === "A") {
    return (
      <section
        data-stagger=""
        style={{ "--stagger-index": 2 } as React.CSSProperties}
        className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8"
      >
        <div
          className="absolute left-0 right-0 top-0 h-1 bg-[var(--surface-sunken)]"
          aria-hidden
        >
          <div
            className="progress-ember h-full"
            style={{ width: "0%" }}
          />
        </div>
        <p data-eyebrow="">Start here · Profile 0%</p>
        <h2 className="mt-4 font-display text-[28px] sm:text-[32px] tracking-tight text-[var(--ink)] leading-snug">
          Complete your profile
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--ink-soft)]">
          Tell us your intake date and university. We&rsquo;ll generate your
          personalized 47-step timeline in seconds.
        </p>
        <div className="mt-7">
          <Link
            href="/dashboard/onboarding"
            className="btn-ember inline-flex items-center gap-2 rounded-lg px-5 py-[10px] text-[13px] font-medium transition-colors"
          >
            Set up your timeline →
          </Link>
        </div>
      </section>
    );
  }

  // State E: no next step (visa stamped) — page will have redirected, but safeguard
  if (!nextStep || !currentPhase) return null;

  // Rotate the displayed tip between "why it matters" and the common-mistake titles
  // so the next-step card doesn't get stale across sessions.
  const tipPool = [nextStep.whyItMatters, ...nextStep.commonMistakes.map((m) => m.title)];
  const tipText = tipPool[stepsComplete % tipPool.length] ?? tipPool[0];
  const eyebrow =
    state === "D"
      ? "RECOMMENDED FOCUS"
      : `NEXT STEP · STEP ${String(nextStep.number).padStart(2, "0")}`;

  return (
    <>
      <section
        data-stagger=""
        style={{ "--stagger-index": 2 } as React.CSSProperties}
        className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7"
      >
        {isStuck && (
          <p className="text-xs italic text-[var(--color-accent-deep)] mb-3">
            It&rsquo;s been {data.daysSinceActivity} days since your last step.
            Need help getting unstuck?
          </p>
        )}

        <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-2xl sm:text-3xl tracking-tight text-[var(--color-ink)] leading-snug">
          {nextStep.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-soft)]">
          {nextStep.shortDescription}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon />
            Estimated time: {nextStep.estimatedMinutes} minutes
          </span>
          <Dot />
          <span className="inline-flex items-center gap-1.5">
            <DocIcon />
            {nextStep.documentsNeeded} documents needed
          </span>
          <Dot />
          <span>Phase {currentPhase} of 5</span>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {paywallReached ? (
            <Link
              href="/dashboard?upgrade=1"
              className="btn-ember inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
            >
              Unlock Phase 2 →
            </Link>
          ) : (
            <Link
              href={`/dashboard/timeline?step=${nextStep.number}`}
              className="btn-ember inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
            >
              Start this step →
            </Link>
          )}

          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors"
          >
            Why this matters
          </button>

          {isStuck && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors"
            >
              Ask for help
            </button>
          )}
        </div>

        <div className="mt-7 border-t border-[var(--color-border-soft)]" />

        <div className="mt-5 flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)]">
            <InfoIcon />
          </span>
          {paywallReached ? (
            <p className="text-xs leading-relaxed text-[var(--color-ink-soft)]">
              You&rsquo;re past the easy part. From here, every step matters.
              Upgrade to continue.
            </p>
          ) : (
            <p className="text-xs leading-relaxed text-[var(--color-ink-soft)]">
              {tipText}
            </p>
          )}
        </div>
      </section>

      <WhyThisMattersPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        step={nextStep}
      />
    </>
  );
}
