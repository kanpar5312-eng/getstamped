"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { fadeUp, staggerContainer, inViewOnce } from "@/lib/motion";
import type { StudentFeedback } from "@/lib/feedback-data";

export function ScoreCards({ data }: { data: StudentFeedback }) {
  const { snapshot, documents, sessions, nextStep, phaseName, phaseNumber } = data;

  // Best session for the interview card breakdown
  const best = sessions
    .filter((s) => s.overall_score != null)
    .sort((a, b) => (b.overall_score ?? 0) - (a.overall_score ?? 0))[0] ?? null;

  const stepsPct = snapshot.steps_total > 0
    ? (snapshot.steps_completed / snapshot.steps_total) * 100 : 0;

  const docsTotal = snapshot.documents_total;
  const docsPassed = snapshot.documents_passed;
  const docsFailed = documents.filter((d) => d.status === "failed").length;
  const docsReviewed = documents.filter((d) => d.status !== "not_reviewed").length;
  const docsPct = docsTotal > 0 ? (docsPassed / docsTotal) * 100 : 0;
  const docColor =
    docsReviewed === 0 ? "rgba(28,25,23,0.20)"
    : docsFailed > 0 ? "#EF4444"
    : "#22C55E";

  return (
    <motion.section
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={inViewOnce}
    >
      {/* Card 1 — Steps */}
      <motion.div variants={fadeUp} className="bg-[var(--color-cream-soft)] border border-[var(--color-border-soft)] rounded-[12px] p-7">
        <div className="flex items-center gap-2 mb-3">
          <ChecklistIcon />
          <span className="font-sans text-[12px] uppercase text-[var(--color-ink-soft)] tracking-wide">
            Playbook Progress
          </span>
        </div>
        <div className="font-display text-[28px] text-[var(--color-ink)] leading-tight">
          {snapshot.steps_completed} of {snapshot.steps_total} steps
        </div>
        <Bar pct={stepsPct} color="var(--color-persimmon)" />
        <div className="font-sans text-[12px] text-[var(--color-ink-soft)] mt-3">
          Phase {phaseNumber} of 5 — {phaseName}
        </div>
        {nextStep ? (
          <div className="mt-4 pl-3 border-l-2 border-[var(--color-persimmon)] font-sans text-[13px] text-[var(--color-ink)]">
            Next: {nextStep.title}
          </div>
        ) : null}
      </motion.div>

      {/* Card 2 — Documents */}
      <motion.div variants={fadeUp} className="bg-[var(--color-cream-soft)] border border-[var(--color-border-soft)] rounded-[12px] p-7">
        <div className="flex items-center gap-2 mb-3">
          <DocCheckIcon />
          <span className="font-sans text-[12px] uppercase text-[var(--color-ink-soft)] tracking-wide">
            Document Vault
          </span>
        </div>
        <div className="font-display text-[28px] text-[var(--color-ink)] leading-tight">
          {docsPassed} of {docsTotal} documents verified
        </div>
        <Bar pct={docsPct} color={docColor} />
        <ul className="mt-3 space-y-1.5">
          {documents.slice(0, 5).map((d) => (
            <li key={d.document_key} className="font-sans text-[12px] flex items-center gap-2">
              {d.status === "passed"      && <span style={{ color: "#22C55E" }}>✓</span>}
              {d.status === "failed"      && <span style={{ color: "#EF4444" }}>✗</span>}
              {d.status === "not_reviewed"&& <span className="text-[var(--color-muted)]">○</span>}
              <span
                style={{
                  color:
                    d.status === "passed"   ? "#22C55E"
                  : d.status === "failed"   ? "#EF4444"
                  : "var(--color-ink-soft)",
                }}
              >
                {d.display_name}
              </span>
            </li>
          ))}
          {documents.length > 5 ? (
            <li>
              <Link href="/dashboard/documents" className="font-sans text-[12px] text-[var(--color-persimmon)]">
                View all →
              </Link>
            </li>
          ) : null}
        </ul>
        {docsFailed > 0 ? (
          <div
            className="mt-4 rounded-[8px] p-3 font-sans text-[13px]"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.20)",
              color: "#EF4444",
            }}
          >
            ⚠ {docsFailed} document{docsFailed === 1 ? "" : "s"} need attention
          </div>
        ) : null}
      </motion.div>

      {/* Card 3 — Interview */}
      <motion.div variants={fadeUp} className="bg-[var(--color-cream-soft)] border border-[var(--color-border-soft)] rounded-[12px] p-7">
        <div className="flex items-center gap-2 mb-3">
          <MicIcon />
          <span className="font-sans text-[12px] uppercase text-[var(--color-ink-soft)] tracking-wide">
            Mock Interview
          </span>
        </div>
        {best ? (
          <>
            <div className="font-display text-[28px] text-[var(--color-ink)] leading-tight">
              {best.overall_score ?? 0} / 100
            </div>
            <div className="font-sans text-[12px] text-[var(--color-ink-soft)]">
              {snapshot.interview_sessions_count} session{snapshot.interview_sessions_count === 1 ? "" : "s"} completed · best
            </div>
            <div className="mt-4 space-y-2">
              <ScoreRow label="Study Plan"            score={best.study_plan_score} />
              <ScoreRow label="Financial Credibility" score={best.financial_credibility_score} />
              <ScoreRow label="Ties to Home"          score={best.ties_to_home_score} />
              <ScoreRow label="Confidence"            score={best.confidence_score} />
            </div>
            {best.ai_verdict ? <VerdictBadge verdict={best.ai_verdict} /> : null}
          </>
        ) : (
          <>
            <div className="font-display text-[20px] text-[var(--color-ink-soft)]">No sessions yet</div>
            <Link
              href="/dashboard/mock-interview"
              className="inline-block mt-4 font-sans text-[13px] text-[var(--color-persimmon)]"
            >
              Start your first mock interview →
            </Link>
          </>
        )}
      </motion.div>
    </motion.section>
  );
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-[var(--color-border-soft)] overflow-hidden mt-3">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
        style={{ height: "100%", background: color }}
      />
    </div>
  );
}

function ScoreRow({ label, score }: { label: string; score: number | null }) {
  const v = score ?? 0;
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-sans text-[11px] text-[var(--color-ink-soft)]">{label}</span>
        <span className="font-sans text-[11px] text-[var(--color-ink)]">{v}</span>
      </div>
      <div className="h-1 rounded-full bg-[var(--color-border-soft)] overflow-hidden mt-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
          style={{ height: "100%", background: "var(--color-persimmon)" }}
        />
      </div>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: "ready" | "almost_ready" | "needs_work" }) {
  const config = {
    ready:        { fg: "#22C55E", bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.30)" },
    almost_ready: { fg: "#3B82F6", bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.30)" },
    needs_work:   { fg: "#F59E0B", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.30)" },
  }[verdict];
  const pretty = verdict === "ready" ? "READY"
               : verdict === "almost_ready" ? "ALMOST READY" : "NEEDS WORK";
  return (
    <span
      className="inline-block mt-4 font-sans text-[11px] uppercase font-medium px-3 py-1 rounded"
      style={{ color: config.fg, background: config.bg, border: `1px solid ${config.border}`, letterSpacing: "0.2em" }}
    >
      {pretty}
    </span>
  );
}

function ChecklistIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="10" height="10" rx="1.5" />
      <path d="M5 7l1.5 1.5L9 6" />
    </svg>
  );
}
function DocCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 1.5h6L11 4v8.5H3z" />
      <path d="M5 8l1.5 1.5L9 7" />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="1.5" width="4" height="7" rx="2" />
      <path d="M3 7.5a4 4 0 0 0 8 0M7 11.5v1.5" />
    </svg>
  );
}
