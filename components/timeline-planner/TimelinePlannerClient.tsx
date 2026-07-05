"use client";

import { useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PlanBasisBadge } from "@/components/timeline-planner/PlanBasisBadge";
import { TodayCard } from "@/components/timeline-planner/TodayCard";
import { FullTimelineView } from "@/components/timeline-planner/FullTimelineView";
import { InterviewDetailsModal } from "@/components/dashboard/InterviewDetailsModal";
import type { PlannerView } from "@/lib/timeline-planner";

type ProfileSlice = {
  interviewDate: Date | null;
  consulateLocation: string | null;
  interviewTimeOfDay: "morning" | "afternoon" | null;
};

type Props = {
  view: PlannerView;
  profile: ProfileSlice;
  today: Date;
};

function formatTargetDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export function TimelinePlannerClient({ view, profile, today }: Props) {
  const [tab, setTab] = useState<"today" | "full">("today");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
        <Link href="/dashboard" className="hover:text-[var(--color-ink)] transition-colors">
          Dashboard
        </Link>
        <span aria-hidden>›</span>
        <span className="text-[var(--color-ink-soft)]">Timeline Planner</span>
      </nav>

      <header className="mt-6">
        <Eyebrow>Timeline Planner</Eyebrow>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] leading-tight">
          Your day-by-day plan
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--color-ink-soft)]">
          This takes your remaining Playbook steps and spreads them across the
          days you have left, so you always know exactly what to do next —
          instead of looking at all 47 steps at once.
        </p>

        {/* Target date — the anchor everything below is scheduled against */}
        <div className="mt-5 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-paper-deep)] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <PlanBasisBadge basis={view.basis} />
            <span className="text-sm text-[var(--color-ink)] font-medium">
              {formatTargetDate(view.targetDate)}
            </span>
            <span className="text-sm text-[var(--color-muted)] tabular-nums">
              {view.daysRemaining === 0 ? "Today" : `${view.daysRemaining} days away`}
            </span>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="ml-auto text-sm font-medium text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors"
            >
              {profile.interviewDate ? "Edit interview date" : "Add interview date"}
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--color-ink-soft)] leading-relaxed">
            {view.basis === "real"
              ? "This is the interview date you added — every step below is scheduled to be done before it."
              : "You haven't booked an interview yet, so this date is a rough estimate based on your pace so far. It updates automatically, and gets replaced the moment you add a real date above."}
          </p>
        </div>

        {view.isBehindSchedule && (
          <div className="mt-4 rounded-xl border border-[#FCA5A5] bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
            {view.basis === "real"
              ? "Your interview date has passed and steps are still open — the plan below has been rebuilt around what's left."
              : "There isn't enough time left for an even pace right now — focus on the priority items below first."}
          </div>
        )}

        <div className="mt-6 inline-flex rounded-full border border-[var(--color-border-soft)] bg-[var(--color-paper-deep)] p-1">
          <button
            type="button"
            onClick={() => setTab("today")}
            className={[
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === "today"
                ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]",
            ].join(" ")}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setTab("full")}
            className={[
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === "full"
                ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]",
            ].join(" ")}
          >
            Full timeline
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          {tab === "today"
            ? "A short list of what's due right now."
            : "Every remaining step, day by day."}
        </p>
      </header>

      <div className="mt-6">
        {tab === "today" ? (
          <TodayCard view={view} today={today} />
        ) : (
          <FullTimelineView view={view} today={today} />
        )}
      </div>

      <InterviewDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialDate={profile.interviewDate}
        initialLocation={profile.consulateLocation}
        initialTimeOfDay={profile.interviewTimeOfDay}
      />
    </>
  );
}
