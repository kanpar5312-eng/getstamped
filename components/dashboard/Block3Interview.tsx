"use client";

import { useState } from "react";
import type { DashboardData } from "@/lib/dashboard-state";
import { InterviewDetailsModal } from "@/components/dashboard/InterviewDetailsModal";

type Props = {
  data: DashboardData;
};

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function Block3Interview({ data }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const { state, profile, daysToInterview, isInterviewImminent } = data;

  if (state === "A") return null;

  const imminentRing = isInterviewImminent
    ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/20"
    : "border-[var(--color-border-soft)]";

  // Variant B — Not booked
  if (!profile.interviewDate || !profile.consulateLocation) {
    return (
      <>
        <section data-stagger="" style={{ "--stagger-index": 3 } as React.CSSProperties} className={`rounded-2xl border bg-[var(--surface)] p-6 sm:p-7 ${imminentRing}`}>
          <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
            Your interview
          </p>
          <h2 className="mt-3 font-display text-2xl tracking-tight text-[var(--color-ink)] leading-snug">
            Not yet scheduled
          </h2>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Book your interview after completing Phase 3, around step 26.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-accent)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-accent-deep)] hover:bg-[var(--color-accent-tint)] transition-colors"
            >
              Add interview date
            </button>
          </div>
        </section>

        <InterviewDetailsModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  // Variant A — Booked
  const eyebrow = isInterviewImminent
    ? `INTERVIEW IN ${daysToInterview} DAYS`
    : "YOUR INTERVIEW";

  return (
    <>
      <section className={`mt-8 rounded-2xl border bg-[var(--color-paper-soft)] p-6 sm:p-7 ${imminentRing}`}>
        <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
          {eyebrow}
        </p>

        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
          <div className="font-display text-2xl sm:text-3xl tracking-tight text-[var(--color-ink)] leading-tight">
            {formatDate(profile.interviewDate)}
          </div>
          {daysToInterview !== null && (
            <span
              className={
                isInterviewImminent
                  ? "font-display text-4xl tracking-tight text-[var(--color-ink)] tabular-nums leading-none"
                  : "inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-tint)] border border-[var(--color-accent)]/30 px-2.5 py-1 text-xs font-medium text-[var(--color-accent-deep)] tabular-nums"
              }
            >
              {daysToInterview} days away
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          {profile.consulateLocation} ·{" "}
          {profile.interviewTimeOfDay ?? "morning"} appointment
        </p>

        <div className="mt-5 border-t border-[var(--color-border-soft)]" />

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-ink-soft)]">
          <span>
            <span className="text-[var(--color-ink)] mr-1">✓</span>
            Mock interviews: {profile.mockInterviewsCompleted}/3 complete
          </span>
          <span>
            <span className="text-[var(--color-ink)] mr-1">✓</span>
            Documents: {profile.documentsOrganizedPct}% organized
          </span>
          <span>
            {profile.documentsOrganizedPct >= 80 &&
            profile.mockInterviewsCompleted >= 2 ? (
              <>
                <span className="text-[var(--color-ink)] mr-1">✓</span>
                On track
              </>
            ) : (
              <>
                <span className="text-[var(--color-accent-deep)] mr-1">⚠</span>
                Add 1 more mock interview before {formatDate(profile.interviewDate)}
              </>
            )}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-accent)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-accent-deep)] hover:bg-[var(--color-accent-tint)] transition-colors"
          >
            Open prep checklist
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-sm text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] px-2 py-2 transition-colors"
          >
            Edit interview details
          </button>
        </div>
      </section>

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
