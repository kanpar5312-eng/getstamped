"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { markStep } from "@/app/actions/step-progress";
import type { PlannedItem } from "@/lib/timeline-planner";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function formatDue(dueDate: Date, today: Date): string {
  const diff = Math.round(
    (startOfDay(dueDate).getTime() - startOfDay(today).getTime()) / MS_PER_DAY,
  );
  if (diff < 0) return diff === -1 ? "Overdue by 1 day" : `Overdue by ${-diff} days`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff <= 6) return `In ${diff} days`;
  return dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type Props = {
  item: PlannedItem;
  today: Date;
  /** Compact mode drops the description line, used on the Today card. */
  compact?: boolean;
};

export function PlannerItemRow({ item, today, compact = false }: Props) {
  const { step, dueDate, isOverdue, isUrgent, isPriority, isPostInterview, isLocked } = item;
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();
  const [paywallHit, setPaywallHit] = useState(false);

  const markDone = () => {
    if (isLocked || done) return;
    // Optimistic — flip the UI instantly instead of waiting on the round
    // trip (network + revalidatePath) before the checkbox even fills in.
    // Reverted below only if the server actually rejects it.
    setDone(true);
    setFailed(false);
    startTransition(async () => {
      const res = await markStep(step.number, "complete");
      if (!res.ok) {
        setDone(false);
        if (res.paywall) setPaywallHit(true);
        else setFailed(true);
      }
    });
  };

  return (
    <li
      className={[
        "flex items-start gap-3 rounded-xl border p-4",
        "transition-[background-color,border-color,opacity] duration-300 ease-out",
        done
          ? "border-[var(--color-border-soft)] bg-[var(--color-paper-deep)] opacity-60"
          : isUrgent && !isLocked
            ? "border-[var(--color-accent)]/40 bg-[var(--color-accent-tint)]/40"
            : "border-[var(--color-border)] bg-[var(--color-paper)]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={markDone}
        disabled={isLocked || done}
        aria-label={done ? "Complete" : `Mark step ${step.number} complete`}
        className={[
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-white",
          "transition-[background-color,border-color,transform] duration-150 ease-out",
          done ? "border-[var(--color-accent)] bg-[var(--color-accent)] scale-110" : "scale-100",
          isLocked
            ? "border-[var(--color-border)] cursor-not-allowed"
            : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:scale-105",
        ].join(" ")}
      >
        {done && (
          <svg
            viewBox="0 0 12 12"
            className="h-2.5 w-2.5 animate-[check-pop_220ms_ease-out]"
            fill="none"
          >
            <path
              d="M2.5 6.2 L5 8.6 L9.5 3.6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[11px] font-mono text-[var(--color-muted)]">
            Step {step.number}
          </span>
          {isPriority && !isLocked && !done && (
            <span className="rounded-full bg-[var(--color-accent-tint)] px-1.5 py-[1px] text-[10px] font-medium uppercase tracking-[0.04em] text-[var(--color-accent-deep)]">
              Do first
            </span>
          )}
          {isUrgent && !isLocked && !done && (
            <span className="rounded-full bg-[#FEE2E2] px-1.5 py-[1px] text-[10px] font-semibold uppercase tracking-[0.04em] text-[#B91C1C]">
              Urgent
            </span>
          )}
          {isPostInterview && !done && (
            <span className="rounded-full border border-[var(--color-border)] px-1.5 py-[1px] text-[10px] text-[var(--color-muted)]">
              After interview
            </span>
          )}
        </div>

        {isLocked ? (
          <Link
            href="/dashboard/upgrade"
            className="mt-1 block text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-accent-deep)] transition-colors"
          >
            {step.title} — upgrade to unlock →
          </Link>
        ) : (
          <Link
            href={`/dashboard/timeline/${step.number}`}
            className={[
              "mt-1 block text-sm font-medium transition-colors hover:text-[var(--color-accent-deep)]",
              done ? "text-[var(--color-ink-soft)] line-through" : "text-[var(--color-ink)]",
            ].join(" ")}
          >
            {step.title}
          </Link>
        )}

        {!compact && !isLocked && !done && (
          <p className="mt-1 text-xs text-[var(--color-ink-soft)] leading-relaxed">
            {step.shortDescription}
          </p>
        )}

        {paywallHit && (
          <p className="mt-1.5 text-xs text-[var(--color-accent-deep)]">
            This step is locked.{" "}
            <Link href="/dashboard/upgrade" className="underline underline-offset-2">
              Upgrade to unlock every phase
            </Link>
            .
          </p>
        )}
        {failed && (
          <p className="mt-1.5 text-xs text-[#B91C1C]">
            Couldn&rsquo;t save that — check your connection and try again.
          </p>
        )}
      </div>

      <span
        className={[
          "shrink-0 whitespace-nowrap text-xs font-medium tabular-nums",
          isOverdue && !done ? "text-[#B91C1C]" : "text-[var(--color-muted)]",
        ].join(" ")}
      >
        {done ? "Done" : formatDue(dueDate, today)}
      </span>
    </li>
  );
}
