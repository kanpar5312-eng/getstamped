"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { SessionAnswer, SessionSummary } from "@/lib/feedback-data";

const VERDICT_PRETTY = {
  ready: "READY",
  almost_ready: "ALMOST READY",
  needs_work: "NEEDS WORK",
} as const;

const VERDICT_COLORS = {
  ready:        { fg: "#22C55E", bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.30)" },
  almost_ready: { fg: "#3B82F6", bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.30)" },
  needs_work:   { fg: "#F59E0B", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.30)" },
} as const;

function scoreTone(score: number | null): string {
  if (score == null) return "var(--color-muted)";
  if (score < 60) return "#EF4444";
  if (score < 80) return "#F59E0B";
  return "#22C55E";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return iso; }
}

export function InterviewHistory({ sessions }: { sessions: SessionSummary[] }) {
  if (sessions.length === 0) {
    return (
      <div
        className="rounded-[12px] p-12 text-center"
        style={{ background: "white", border: "1px dashed rgba(28,25,23,0.15)" }}
      >
        <h3 className="font-display text-[20px] text-[var(--color-ink-soft)]">No interviews yet</h3>
        <p
          className="font-sans text-[14px] text-[var(--color-ink-soft)] mt-3 mx-auto leading-relaxed"
          style={{ maxWidth: "320px" }}
        >
          Practice makes the difference between freezing and flowing. Start your first session.
        </p>
        <a
          href="/dashboard/mock-interview"
          className="inline-block mt-6 rounded-lg bg-[var(--color-persimmon)] hover:bg-[var(--color-persimmon-deep)] text-white px-4 py-2 text-[13px] font-medium transition-colors"
        >
          Start session →
        </a>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {sessions.map((s, i) => (
        <SessionRow key={s.id} session={s} index={sessions.length - i} />
      ))}
    </ul>
  );
}

function SessionRow({ session, index }: { session: SessionSummary; index: number }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<SessionAnswer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const score = session.overall_score ?? 0;
  const tone = scoreTone(score);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && answers == null) {
      setLoading(true);
      try {
        const r = await fetch(`/api/feedback/session/${session.id}`);
        if (r.ok) {
          const data = await r.json() as { answers?: SessionAnswer[] };
          setAnswers(data.answers ?? []);
        } else {
          setAnswers([]);
        }
      } catch {
        setAnswers([]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <li className="rounded-[12px] bg-white border border-[rgba(28,25,23,0.08)] overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="w-full grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 text-left"
      >
        <span className="font-sans text-[13px] text-[var(--color-ink-soft)]">
          {formatDate(session.created_at)}
        </span>
        <span
          className="font-sans text-[13px] font-medium px-3 py-1 rounded-full"
          style={{ color: tone, background: `${tone}15`, border: `1px solid ${tone}33` }}
        >
          Session #{index} — {score}/100
        </span>
        <span className="inline-flex items-center gap-2">
          {session.ai_verdict ? (
            <span
              className="font-sans text-[10px] uppercase font-medium px-2 py-1 rounded"
              style={{
                color: VERDICT_COLORS[session.ai_verdict].fg,
                background: VERDICT_COLORS[session.ai_verdict].bg,
                border: `1px solid ${VERDICT_COLORS[session.ai_verdict].border}`,
                letterSpacing: "0.15em",
              }}
            >
              {VERDICT_PRETTY[session.ai_verdict]}
            </span>
          ) : null}
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            style={{
              color: "var(--color-ink-soft)",
              transform: open ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 240ms cubic-bezier(0.23,1,0.32,1)",
            }}
            aria-hidden
          >
            <path d="M3 5.5L7 9.5L11 5.5" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.36, ease: [0.23, 1, 0.32, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-6 pb-6 pt-1" style={{ background: "rgba(28,25,23,0.03)" }}>
              {session.ai_summary ? (
                <p
                  className="font-display text-[16px] text-[var(--color-ink)] py-6 px-2"
                  style={{ lineHeight: 1.7, maxWidth: "680px" }}
                >
                  {session.ai_summary}
                </p>
              ) : null}

              <div className="grid sm:grid-cols-2 gap-3">
                <SubScore label="Study Plan"            score={session.study_plan_score} />
                <SubScore label="Financial Credibility" score={session.financial_credibility_score} />
                <SubScore label="Ties to Home"          score={session.ties_to_home_score} />
                <SubScore label="Confidence"            score={session.confidence_score} />
              </div>

              <div className="mt-6">
                <p
                  className="font-sans uppercase text-[12px] text-[var(--color-ink-soft)] font-medium"
                  style={{ letterSpacing: "0.3em" }}
                >
                  Question by Question
                </p>
                <div className="mt-3 space-y-3">
                  {loading ? (
                    <p className="font-sans text-[13px] text-[var(--color-ink-soft)] italic">
                      Loading answers…
                    </p>
                  ) : answers && answers.length === 0 ? (
                    <p className="font-sans text-[13px] text-[var(--color-ink-soft)] italic">
                      No per-answer details recorded for this session.
                    </p>
                  ) : (
                    (answers ?? []).map((a) => <AnswerCard key={a.id} a={a} />)
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function SubScore({ label, score }: { label: string; score: number | null }) {
  const v = score ?? 0;
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-sans text-[11px] text-[var(--color-ink-soft)]">{label}</span>
        <span className="font-sans text-[11px] text-[var(--color-ink)]">{v}</span>
      </div>
      <div className="h-1 rounded-full bg-[rgba(28,25,23,0.08)] overflow-hidden mt-1">
        <div style={{ width: `${v}%`, height: "100%", background: "var(--color-persimmon)" }} />
      </div>
    </div>
  );
}

function AnswerCard({ a }: { a: SessionAnswer }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const tone = scoreTone(a.score);
  return (
    <div className="rounded-[8px] bg-white border border-[rgba(28,25,23,0.08)] p-5">
      <div className="flex items-center justify-between">
        {a.category ? (
          <span
            className="font-sans text-[10px] uppercase px-2 py-1 rounded text-[var(--color-persimmon-deep)]"
            style={{ background: "var(--color-persimmon-tint)", letterSpacing: "0.12em" }}
          >
            {a.category.replace(/_/g, " ")}
          </span>
        ) : <span />}
        <span className="font-sans text-[12px]" style={{ color: tone }}>
          {a.score ?? 0}/100
        </span>
      </div>
      <p className="font-sans text-[14px] text-[var(--color-ink)] font-medium mt-2">
        {a.question_text}
      </p>
      {a.answer_transcript ? (
        <>
          <button
            type="button"
            onClick={() => setShowAnswer((v) => !v)}
            className="mt-3 font-sans text-[12px] text-[var(--color-persimmon)]"
          >
            {showAnswer ? "Hide my answer ↑" : "Show my answer ↓"}
          </button>
          {showAnswer ? (
            <div
              className="mt-2 rounded-[6px] p-3 font-sans italic text-[13px]"
              style={{
                background: "rgba(28,25,23,0.03)",
                color: "rgba(28,25,23,0.7)",
                lineHeight: 1.6,
                maxHeight: 120,
                overflowY: "auto",
              }}
            >
              {a.answer_transcript}
            </div>
          ) : null}
        </>
      ) : null}
      {a.ai_feedback ? (
        <p className="font-sans text-[13px] text-[var(--color-ink)] mt-3" style={{ lineHeight: 1.6 }}>
          {a.ai_feedback}
        </p>
      ) : null}
      {a.red_flags_triggered.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {a.red_flags_triggered.map((f, i) => (
            <li key={i} className="font-sans text-[12px]" style={{ color: "#EF4444" }}>
              ⚑ {f}
            </li>
          ))}
        </ul>
      ) : null}
      {a.strong_signals.length > 0 ? (
        <ul className="mt-1 space-y-1">
          {a.strong_signals.map((s, i) => (
            <li key={i} className="font-sans text-[12px]" style={{ color: "#22C55E" }}>
              ✦ {s}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
