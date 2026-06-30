"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ════════════════════════════════════════════════════════════════════════
   FeedbackScreen — post-interview assessment.
   Mobile-first, brand-faithful (Ink/Persimmon/Paper, Instrument Serif +
   Inter). The underlying data model (Scores / TurnSummary) is unchanged
   — this is presentation only. Animations fire on mount; no scroll
   triggers because this is a results page, not a landing page.
   ════════════════════════════════════════════════════════════════════════ */

export type TurnSummary = {
  question: string;
  answer: string;
  timestampSec: number;
  note: string;
  isWeakest?: boolean;
  /** True when no usable transcript was captured (mic blocked / silent). */
  noAudio?: boolean;
  /** Per-turn score, 0–100. Falls back to derived if unset. */
  score?: number;
  /** Optional category label rendered as a badge on the card. */
  category?: string;
  /** AI-generated, per-answer "what was wrong" — replaces the
   *  keyword-routed `note` whenever the LLM responded. */
  fix?: string;
  /** AI-generated stronger answer the student should rehearse. Rendered
   *  as a dedicated "What you could have said" block below the note. */
  better?: string;
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
  summary?: string;
  blurredPaywall?: boolean;
  onRetryWeak: () => void;
};

// Brand
const INK = "#1C1917";
const PERSIMMON = "#E8622A";
const PAPER = "#FAF8F4";

// Score-color ramps
function scoreColor(n: number): string {
  if (n <= 40) return "#EF4444";
  if (n <= 65) return "#F59E0B";
  if (n <= 85) return "#3B82F6";
  return "#22C55E";
}

function verdictFor(score: number): string {
  if (score <= 40) return "An officer would likely push back.";
  if (score <= 65) return "You're partway there.";
  if (score <= 85) return "A solid session. Keep going.";
  return "You're ready for the real thing.";
}

function fmtDuration(totalSec: number): string {
  if (!isFinite(totalSec) || totalSec <= 0) return "—";
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

// Animated number tween. Cheap, no easing library.
function useCountUp(target: number, durationMs = 1000): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target <= 0) { setValue(0); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

const CATEGORY_LABELS: Record<keyof Omit<Scores, "overall">, string> = {
  clarity: "Study Plan Clarity",
  financial: "Financial Credibility",
  consistency: "Ties to Home",
  confidence: "Confidence",
};
const CATEGORY_ORDER: (keyof Omit<Scores, "overall">)[] = [
  "clarity", "financial", "consistency", "confidence",
];

export function FeedbackScreen({
  verdict,
  scores,
  turns,
  durationSec,
  summary,
  blurredPaywall = false,
  onRetryWeak,
}: Props) {
  const noAudioCount = turns.filter((t) => t.noAudio).length;
  const allNoAudio = turns.length > 0 && noAudioCount === turns.length;
  const mostlyNoAudio = turns.length > 0 && noAudioCount / turns.length > 0.5;

  // Honor the dynamic spec verdict over whatever the caller passed.
  const headline = verdictFor(scores.overall) || verdict;

  const strongCount = turns.filter(
    (t) => !t.noAudio && (t.score ?? 0) >= 75,
  ).length;
  const weakCount = turns.filter(
    (t) => t.noAudio || (t.score ?? 100) < 50,
  ).length;

  const counted = useCountUp(scores.overall, 1000);

  return (
    <div className="w-full">
      {/* ───── SECTION 1 — VERDICT HEADER ───── */}
      <section style={{ background: INK, color: PAPER, padding: "48px 24px 40px" }}>
        <div className="mx-auto max-w-[860px]">
          <p
            style={{
              fontFamily: "var(--font-sans-stack)",
              fontSize: 10,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: PERSIMMON,
              fontWeight: 600,
              margin: 0,
            }}
          >
            Session complete
          </p>

          <h1
            className="gs-feedback-headline"
            style={{
              fontFamily: "var(--font-display-stack)",
              fontWeight: 400,
              fontSize: "clamp(28px, 7vw, 36px)",
              lineHeight: 1.1,
              color: PAPER,
              marginTop: 14,
              maxWidth: "20ch",
            }}
          >
            {headline}
          </h1>

          {/* Score */}
          <div style={{ marginTop: 24, display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontFamily: "var(--font-display-stack)",
                fontSize: "clamp(64px, 18vw, 80px)",
                fontWeight: 400,
                lineHeight: 1,
                color: scoreColor(scores.overall),
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {counted}
            </span>
            <span
              style={{
                fontFamily: "var(--font-display-stack)",
                fontSize: 32,
                lineHeight: 1,
                color: "rgba(250,248,244,0.3)",
              }}
            >
              /100
            </span>
          </div>

          <p
            style={{
              fontFamily: "var(--font-sans-stack)",
              fontSize: 13,
              color: "rgba(250,248,244,0.4)",
              marginTop: 12,
            }}
          >
            {turns.length} question{turns.length === 1 ? "" : "s"} · {fmtDuration(durationSec)}
          </p>

          {/* Category bars */}
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 22 }}>
            {CATEGORY_ORDER.map((k, i) => (
              <CategoryBar
                key={k}
                label={CATEGORY_LABELS[k]}
                value={scores[k]}
                delay={i * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Honesty disclaimer — visible immediately after the verdict so
          users see it without scrolling further into the breakdown. */}
      <section
        style={{
          background: PAPER,
          padding: "16px 24px",
          borderBottom: "1px solid rgba(28,25,23,0.08)",
        }}
      >
        <p
          className="mx-auto"
          style={{
            maxWidth: 860,
            fontFamily: "var(--font-sans-stack)",
            fontSize: 12,
            lineHeight: 1.55,
            color: "var(--color-ink-soft, rgba(28,25,23,0.6))",
            margin: 0,
          }}
        >
          This is an automated practice tool to help you prepare. It does
          not guarantee interview outcomes or reflect actual consular
          officer judgment.
        </p>
      </section>

      {/* ───── SECTION 2 — AI SUMMARY ───── */}
      <section style={{ background: PAPER, padding: "32px 24px" }}>
        <div className="mx-auto max-w-[860px]">
          {mostlyNoAudio ? (
            <>
              <p
                style={{
                  fontFamily: "var(--font-sans-stack)",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--color-ink-soft)",
                  margin: 0,
                }}
              >
                No audio was captured for most answers. This is usually a microphone
                permissions issue on mobile. Allow microphone access and try again —
                your score will reflect your actual answers.
              </p>
              <Link
                href="/support#mic"
                style={{
                  fontFamily: "var(--font-sans-stack)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: PERSIMMON,
                  textDecoration: "none",
                  marginTop: 10,
                  display: "inline-block",
                }}
              >
                How to fix this →
              </Link>
            </>
          ) : (
            <p
              style={{
                fontFamily: "var(--font-display-stack)",
                fontSize: 18,
                lineHeight: 1.7,
                color: INK,
                margin: 0,
              }}
            >
              {summary || defaultSummary(scores.overall, weakCount, strongCount)}
            </p>
          )}
        </div>
      </section>

      {/* ───── SECTION 3 — QUESTION BREAKDOWN ───── */}
      <section style={{ background: PAPER, padding: "0 24px 32px" }}>
        <div className="mx-auto max-w-[860px]">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <p
              style={{
                fontFamily: "var(--font-sans-stack)",
                fontSize: 11,
                color: "var(--color-ink-soft)",
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                fontWeight: 600,
                margin: 0,
              }}
            >
              Question by question
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans-stack)",
                fontSize: 11,
                color: "var(--color-ink-soft)",
                margin: 0,
              }}
            >
              {strongCount} strong · {weakCount} weak
            </p>
          </div>

          {/* Banner shown ONCE when >50% answers have no audio. */}
          {mostlyNoAudio && !allNoAudio && (
            <div
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                fontFamily: "var(--font-sans-stack)",
                fontSize: 13,
                color: "#B91C1C",
              }}
            >
              Most of your answers came through silent — check your microphone permissions
              and try again. The score below reflects what we actually heard.
            </div>
          )}

          {turns.map((t, i) => (
            <QuestionCard key={i} turn={t} index={i} />
          ))}
        </div>
      </section>

      {/* ───── SECTION 4 — WHAT TO DO NEXT ───── */}
      <section
        style={{
          background: "#FFFFFF",
          borderTop: "1px solid rgba(28,25,23,0.08)",
          padding: "32px 24px",
        }}
      >
        <div className="mx-auto max-w-[860px]">
          <h2
            style={{
              fontFamily: "var(--font-display-stack)",
              fontSize: 22,
              fontWeight: 400,
              color: INK,
              margin: 0,
            }}
          >
            Before your next session
          </h2>

          <div style={{ marginTop: 24 }}>
            {allNoAudio ? (
              <p
                style={{
                  fontFamily: "var(--font-sans-stack)",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: INK,
                  margin: 0,
                }}
              >
                Fix your microphone first. Everything else can wait. On iPhone: Settings →
                Safari → Microphone → Allow.
              </p>
            ) : (
              nextSteps(turns).map((step, i) => (
                <NextStep key={i} index={i + 1} title={step.title} detail={step.detail} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ───── SECTION 5 — CTA ROW ───── */}
      <section style={{ background: PAPER, padding: "32px 24px 48px" }}>
        <div className="mx-auto max-w-[860px] flex flex-col gap-3">
          {blurredPaywall ? (
            <Link
              href="/dashboard/upgrade"
              style={{
                background: PERSIMMON,
                color: PAPER,
                fontFamily: "var(--font-sans-stack)",
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 8,
                height: 52,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              Unlock full breakdown — $19 →
            </Link>
          ) : (
            <button
              type="button"
              onClick={onRetryWeak}
              style={{
                background: PERSIMMON,
                color: PAPER,
                fontFamily: "var(--font-sans-stack)",
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                borderRadius: 8,
                height: 52,
                cursor: "pointer",
              }}
            >
              {allNoAudio ? "Try again with microphone →" : "Retry weak questions →"}
            </button>
          )}
          <Link
            href="/dashboard"
            style={{
              border: "1px solid rgba(28,25,23,0.2)",
              background: "transparent",
              color: INK,
              fontFamily: "var(--font-sans-stack)",
              fontSize: 14,
              borderRadius: 8,
              height: 52,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            Back to dashboard
          </Link>
        </div>
      </section>

      <style>{`
        .gs-feedback-headline { animation: gs-fade-up 500ms cubic-bezier(.22,1,.36,1) both; }
        @keyframes gs-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gs-bar-fill {
          from { width: 0%; }
        }
        @keyframes gs-card-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─── sub-components ─── */

function CategoryBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-sans-stack)",
            fontSize: 11,
            color: "rgba(250,248,244,0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans-stack)",
            fontSize: 11,
            color: "rgba(250,248,244,0.6)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </span>
      </div>
      <div style={{ height: 3, width: "100%", background: "rgba(250,248,244,0.1)", borderRadius: 2, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: PERSIMMON,
            borderRadius: 2,
            animation: `gs-bar-fill 800ms cubic-bezier(.22,1,.36,1) ${delay}ms both`,
          }}
        />
      </div>
    </div>
  );
}

function QuestionCard({ turn, index }: { turn: TurnSummary; index: number }) {
  const score = turn.score ?? (turn.noAudio ? 0 : 75);
  const borderColor =
    turn.noAudio || score < 50 ? "#EF4444"
    : score < 75 ? "#F59E0B"
    : "#22C55E";

  return (
    <article
      style={{
        background: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        borderLeft: `3px solid ${borderColor}`,
        animation: `gs-card-in 360ms cubic-bezier(.22,1,.36,1) ${300 + index * 80}ms both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: "var(--font-sans-stack)",
            fontSize: 10,
            color: "var(--color-ink-soft)",
            background: "rgba(28,25,23,0.06)",
            padding: "3px 8px",
            borderRadius: 4,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          Q{String(index + 1).padStart(2, "0")}
        </span>

        {turn.isWeakest && (
          <span
            style={{
              fontFamily: "var(--font-sans-stack)",
              fontSize: 9,
              fontWeight: 700,
              color: PAPER,
              background: PERSIMMON,
              padding: "3px 8px",
              borderRadius: 4,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Weakest moment
          </span>
        )}

        {turn.category && (
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-sans-stack)",
              fontSize: 9,
              color: PERSIMMON,
              background: "rgba(232,98,42,0.15)",
              padding: "3px 8px",
              borderRadius: 4,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {turn.category}
          </span>
        )}
      </div>

      <p
        style={{
          fontFamily: "var(--font-display-stack)",
          fontSize: 16,
          lineHeight: 1.4,
          color: INK,
          marginTop: 10,
          marginBottom: 0,
        }}
      >
        {turn.question}
      </p>

      {turn.noAudio ? (
        <div
          style={{
            marginTop: 10,
            background: "rgba(239,68,68,0.04)",
            border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: 6,
            padding: 12,
            fontFamily: "var(--font-sans-stack)",
            fontSize: 12,
            color: "#EF4444",
          }}
        >
          ⚠ No audio captured
        </div>
      ) : turn.answer ? (
        <div
          style={{
            marginTop: 10,
            background: "rgba(28,25,23,0.03)",
            borderRadius: 6,
            padding: 12,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans-stack)",
              fontSize: 9,
              color: "var(--color-ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              margin: 0,
            }}
          >
            Your answer
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans-stack)",
              fontSize: 13,
              fontStyle: "italic",
              lineHeight: 1.5,
              color: "rgba(28,25,23,0.7)",
              margin: "4px 0 0 0",
            }}
          >
            {turn.answer}
          </p>
        </div>
      ) : null}

      {(turn.fix || turn.note) && !turn.noAudio && (
        <div style={{ marginTop: 12 }}>
          <p
            style={{
              fontFamily: "var(--font-sans-stack)",
              fontSize: 9,
              color: "var(--color-ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              margin: 0,
            }}
          >
            Officer note
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans-stack)",
              fontSize: 13,
              lineHeight: 1.5,
              color: INK,
              margin: "4px 0 0 0",
            }}
          >
            {turn.fix || turn.note}
          </p>
        </div>
      )}

      {turn.better && !turn.noAudio && (
        <div
          style={{
            marginTop: 12,
            background: "rgba(232,98,42,0.06)",
            border: "1px solid rgba(232,98,42,0.18)",
            borderRadius: 8,
            padding: "12px 14px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans-stack)",
              fontSize: 9,
              color: PERSIMMON,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              margin: 0,
              fontWeight: 600,
            }}
          >
            What you could have said
          </p>
          <p
            style={{
              fontFamily: "var(--font-display-stack)",
              fontStyle: "italic",
              fontSize: 14,
              lineHeight: 1.55,
              color: INK,
              margin: "6px 0 0 0",
            }}
          >
            &ldquo;{turn.better}&rdquo;
          </p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        {turn.noAudio ? (
          <span
            style={{
              fontFamily: "var(--font-sans-stack)",
              fontSize: 11,
              color: "#EF4444",
              background: "rgba(239,68,68,0.1)",
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            No answer
          </span>
        ) : (
          <span
            style={{
              fontFamily: "var(--font-sans-stack)",
              fontSize: 12,
              fontWeight: 600,
              color: scoreColor(score),
              background: `${scoreColor(score)}15`,
              padding: "4px 10px",
              borderRadius: 999,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {score}/100
          </span>
        )}
      </div>
    </article>
  );
}

function NextStep({ index, title, detail }: { index: number; title: string; detail: string }) {
  return (
    <div style={{ display: "flex", gap: 16, borderBottom: "1px solid rgba(28,25,23,0.06)", paddingBottom: 20, marginBottom: 20 }}>
      <span
        aria-hidden
        style={{
          fontFamily: "var(--font-display-stack)",
          fontSize: 28,
          color: "rgba(232,98,42,0.25)",
          lineHeight: 1,
          flexShrink: 0,
          width: 32,
        }}
      >
        {index}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "var(--font-sans-stack)",
            fontSize: 14,
            fontWeight: 600,
            color: INK,
            margin: 0,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: "var(--font-sans-stack)",
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--color-ink-soft)",
            marginTop: 4,
            marginBottom: 0,
          }}
        >
          {detail}
        </p>
      </div>
    </div>
  );
}

/* ─── helpers ─── */

function defaultSummary(score: number, weak: number, strong: number): string {
  if (score >= 86) {
    return `Confident, specific, and consistent. ${strong} of your answers would land cleanly with an officer. Keep the pace; you're rehearsing for poise, not for new content.`;
  }
  if (score >= 66) {
    return `The shape of a good interview is here. ${strong} answers landed cleanly. Tighten the ${weak} weak ones — specifics over generalities, names over categories.`;
  }
  if (score >= 41) {
    return `The basics are forming but the answers lean general. Officers read general as unprepared. Name the program, the sponsor, the city. Specifics build credibility faster than confidence does.`;
  }
  return `Most of your answers wouldn't pass an officer's "specifics" bar yet. That's normal at this stage — pick the two weakest topics, rehearse one specific sentence for each, and run another session.`;
}

function nextSteps(turns: TurnSummary[]): { title: string; detail: string }[] {
  const weakOnes = turns.filter((t) => !t.noAudio && (t.score ?? 100) < 60).slice(0, 3);

  if (weakOnes.length === 0) {
    return [
      {
        title: "Run a session at the tougher difficulty",
        detail: "You handled this set cleanly — push yourself with a Skeptical officer and longer questions.",
      },
      {
        title: "Pick one answer to memorize",
        detail: "Officers read a memorized opener as confident, not robotic. Choose the question you stumbled on least and lock it in.",
      },
      {
        title: "Practice the closing exchange",
        detail: "How you end matters. Walk in tomorrow with a clean, one-sentence summary of your plan after graduation.",
      },
    ];
  }
  return weakOnes.map((t) => ({
    title: shortLabelFor(t.question),
    detail: t.note || "Rewrite your answer to include one specific name, number, or date.",
  }));
}

function shortLabelFor(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes("fund")) return "Sharpen your funding answer";
  if (lower.includes("major") || lower.includes("program")) return "Tighten your program rationale";
  if (lower.includes("home") || lower.includes("ties")) return "Strengthen your ties-to-home story";
  if (lower.includes("after graduation") || lower.includes("post")) return "Clarify your post-graduation plan";
  if (lower.includes("backup") || lower.includes("denied")) return "Prepare your denial-contingency answer";
  return "Rework this weak answer";
}
