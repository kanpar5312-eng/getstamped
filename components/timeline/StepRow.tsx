"use client";

import Link from "next/link";
import type { StepView } from "@/lib/timeline-data";
import { timeAgo } from "@/lib/relative-time";

type Props = {
  view: StepView;
  onLockedClick: (stepNumber: number) => void;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12l5 5 9-11" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function StatusBlock({ view }: { view: StepView }) {
  const n = String(view.step.number).padStart(2, "0");
  switch (view.status) {
    case "complete":
      return (
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-forest)] text-[var(--color-cream-soft)]"
        >
          <CheckIcon />
        </span>
      );
    case "in_progress":
      return (
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent-tint)] border border-[var(--color-accent)]/30 text-[var(--color-accent-deep)] font-mono text-xs font-medium"
        >
          {n}
        </span>
      );
    case "available":
      return (
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] font-mono text-xs font-medium"
        >
          {n}
        </span>
      );
    case "locked":
      return (
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-cream-deep)]/50 text-[var(--color-muted)]"
        >
          <LockIcon />
        </span>
      );
  }
}

function statusText(view: StepView): string {
  switch (view.status) {
    case "complete":
      return view.activityAt
        ? `Completed ${timeAgo(view.activityAt)}`
        : "Completed";
    case "in_progress":
      return view.activityAt
        ? `Started ${timeAgo(view.activityAt)}`
        : "Started";
    case "available":
      return "Not started";
    case "locked":
      return "Unlock to view";
  }
}

function ariaLabel(view: StepView): string {
  const base = `Step ${view.step.number}: ${view.step.title}`;
  switch (view.status) {
    case "complete":
      return `${base}. Completed.`;
    case "in_progress":
      return `${base}. In progress.`;
    case "available":
      return `${base}. Not started.`;
    case "locked":
      return `${base}. Locked. Upgrade to unlock.`;
  }
}

export function StepRow({ view, onLockedClick }: Props) {
  const titleClass =
    "text-sm sm:text-base font-medium leading-snug " +
    (view.status === "locked"
      ? "text-[var(--color-muted)]"
      : "text-[var(--color-ink)]");

  const meta = (
    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[var(--color-muted)]">
      <span className="inline-flex items-center gap-1">
        <ClockIcon /> {view.step.estimatedMinutes} min
      </span>
      <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-[var(--color-border)]" />
      {view.step.documentsNeeded > 0 && (
        <>
          <span className="inline-flex items-center gap-1">
            <DocIcon /> {view.step.documentsNeeded} document
            {view.step.documentsNeeded === 1 ? "" : "s"}
          </span>
          <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-[var(--color-border)]" />
        </>
      )}
      <span>{statusText(view)}</span>
    </div>
  );

  const inner = (
    <>
      <StatusBlock view={view} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className={titleClass}>{view.step.title}</span>
          {view.hasCriticalTip && view.status !== "locked" && (
            <span className="inline-flex items-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent-deep)] px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-medium">
              TIP
            </span>
          )}
        </div>
        {meta}
      </div>
      <span className="flex-shrink-0 inline-flex items-center">
        {view.status === "complete" && (
          <span className="text-[11px] font-medium text-[var(--color-forest)] group-hover:text-[var(--color-forest-deep)] transition-colors">
            Review →
          </span>
        )}
        {view.status === "in_progress" && (
          <span className="text-[var(--color-muted)] group-hover:text-[var(--color-accent-deep)] transition-colors">
            <ChevronRight />
          </span>
        )}
        {view.status === "available" && (
          <span className="text-[var(--color-muted)] group-hover:text-[var(--color-accent-deep)] transition-colors">
            <ChevronRight />
          </span>
        )}
        {view.status === "locked" && (
          <span className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium bg-[var(--color-forest)] text-[var(--color-cream-soft)] group-hover:bg-[var(--color-forest-deep)] transition-colors">
            Unlock
          </span>
        )}
      </span>
    </>
  );

  const wrapperClass =
    "group w-full text-left flex items-center gap-4 px-4 sm:px-5 py-4 " +
    "hover:bg-[var(--color-cream-deep)]/40 transition-colors " +
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-accent)]/10";

  if (view.status === "locked") {
    return (
      <button
        type="button"
        onClick={() => onLockedClick(view.step.number)}
        aria-label={ariaLabel(view)}
        className={wrapperClass}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={`/dashboard/timeline/${view.step.number}`}
      aria-label={ariaLabel(view)}
      className={wrapperClass}
    >
      {inner}
    </Link>
  );
}
