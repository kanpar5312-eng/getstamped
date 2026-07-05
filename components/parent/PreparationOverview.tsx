/* ─────────────────────────────────────────────────────────────────────
   ParentPreparationOverview — server component.
   PARENT VIEW — public surface. Do NOT add fields without auditing.
   Specifically forbidden — never pull these from the DB into a parent
   surface:
     - answer_transcript / ai_feedback / red_flags_triggered
     - per-document issues / suggestions text
     - category sub-scores (study_plan_score, etc.)
   Allowed:
     - aggregate counts, traffic-light booleans, the overall score
     - the *separately generated* parent-friendly one-line summary
   ───────────────────────────────────────────────────────────────────── */

import { timeAgo } from "@/lib/relative-time";
import { getParentSummary, type ParentSummary, type TrafficLight, type ReadinessLabel } from "@/lib/feedback-data";
import { getGroq, GROQ_MODEL } from "@/lib/groq";

const LABEL_COLORS: Record<ReadinessLabel, string> = {
  not_started:  "#EF4444",
  early:        "#EF4444",
  in_progress:  "#F59E0B",
  almost_ready: "#3B82F6",
  ready:        "#22C55E",
};

const LIGHT_COLORS: Record<TrafficLight, string> = {
  green: "#22C55E",
  amber: "#F59E0B",
  red:   "#EF4444",
};

const LIGHT_LABELS: Record<TrafficLight, string> = {
  green: "Good",
  amber: "In progress",
  red:   "Needs work",
};

const FALLBACK_LINE = "Their preparation is on track — keep encouraging them and trust the workspace to surface anything that needs attention.";

/** Generate a single reassuring sentence for the parent. Falls back to a
 *  safe canned line on any failure. */
async function parentLine(summary: ParentSummary): Promise<string> {
  const groq = getGroq();
  if (!groq) return FALLBACK_LINE;
  const system = `Write one reassuring sentence for a parent about their child's visa preparation progress.
Data: readiness score ${summary.overall_readiness_score}/100, ${summary.steps_done} of ${summary.steps_total} steps done, ${summary.docs_done} of ${summary.docs_total} documents verified, ${summary.interview_sessions} interview sessions completed.
Tone: calm, factual, encouraging. Do not use the word 'unfortunately'. Maximum 30 words. Respond with the sentence only — no quotes, no preamble.`;
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.6,
      max_tokens: 80,
      messages: [{ role: "system", content: system }],
    });
    const raw = (completion.choices[0]?.message?.content ?? "").trim();
    // Strip any wrapping quotes, normalize whitespace
    const line = raw.replace(/^["'`]|["'`]$/g, "").replace(/\s+/g, " ").trim();
    if (!line || line.length < 8) return FALLBACK_LINE;
    if (line.toLowerCase().includes("unfortunately")) return FALLBACK_LINE;
    return line;
  } catch (e) {
    console.error("[parent-line] groq error:", e);
    return FALLBACK_LINE;
  }
}

export async function PreparationOverview({ studentUserId }: { studentUserId: string | null }) {
  if (!studentUserId) return null;
  const summary = await getParentSummary(studentUserId);
  if (!summary) return null;

  const line = await parentLine(summary);
  const scoreColor = LABEL_COLORS[summary.readiness_label];

  return (
    <section className="mt-6 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[20px] text-[var(--color-ink)] leading-none">
          Preparation Overview
        </h2>
        <span className="text-[11px] text-[var(--color-muted)] font-mono">
          Updated {timeAgo(new Date(summary.updated_at))}
        </span>
      </div>

      <div className="flex flex-col items-center mt-6">
        <span
          className="font-display"
          style={{ fontSize: 64, color: scoreColor, lineHeight: 1, letterSpacing: "-0.02em" }}
        >
          {summary.overall_readiness_score}
        </span>
        <span className="font-sans text-[13px] text-[var(--color-ink-soft)] mt-1">
          /100 readiness
        </span>
      </div>

      <div className="mt-8 flex items-center justify-center gap-8 sm:gap-12">
        <TrafficLightCell label="Steps"     light={summary.steps_light} />
        <TrafficLightCell label="Documents" light={summary.documents_light} />
        <TrafficLightCell label="Interview" light={summary.interview_light} />
      </div>

      <p
        className="font-display text-[17px] text-[var(--color-ink)] text-center mx-auto mt-6"
        style={{ lineHeight: 1.6, maxWidth: 400 }}
      >
        {line}
      </p>
    </section>
  );
}

function TrafficLightCell({ label, light }: { label: string; light: TrafficLight }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        aria-hidden
        className="inline-block w-3 h-3 rounded-full"
        style={{ background: LIGHT_COLORS[light] }}
      />
      <span className="font-sans text-[12px] text-[var(--color-ink)]">{label}</span>
      <span className="font-sans text-[10px] text-[var(--color-ink-soft)]" style={{ letterSpacing: "0.08em" }}>
        {LIGHT_LABELS[light].toUpperCase()}
      </span>
    </div>
  );
}
