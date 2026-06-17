"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { fadeUp } from "@/lib/motion";
import type { StudentFeedback, ReadinessLabel } from "@/lib/feedback-data";

const HEADLINES: Record<ReadinessLabel, string> = {
  not_started:  "You haven't started yet.",
  early:        "You've made a start.",
  in_progress:  "You're on track.",
  almost_ready: "Almost there.",
  ready:        "You're ready.",
};

const SUBTEXTS: Record<ReadinessLabel, string> = {
  not_started:  "Complete your first steps to see your readiness score.",
  early:        "Keep going — the hardest part is building the habit.",
  in_progress:  "Your documents and steps are coming together.",
  almost_ready: "One more interview session and you're there.",
  ready:        "Walk into that consulate with confidence.",
};

const BADGE_COLORS: Record<ReadinessLabel, { fg: string; bg: string; border: string }> = {
  not_started:  { fg: "#EF4444", bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.30)" },
  early:        { fg: "#EF4444", bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.30)" },
  in_progress:  { fg: "#F59E0B", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.30)" },
  almost_ready: { fg: "#3B82F6", bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.30)" },
  ready:        { fg: "#22C55E", bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.30)" },
};

const LABEL_PRETTY: Record<ReadinessLabel, string> = {
  not_started:  "NOT STARTED",
  early:        "EARLY",
  in_progress:  "IN PROGRESS",
  almost_ready: "ALMOST READY",
  ready:        "READY",
};

export function ReadinessHeader({ data }: { data: StudentFeedback }) {
  const { snapshot } = data;
  const colors = BADGE_COLORS[snapshot.readiness_label];

  return (
    <motion.section
      variants={fadeUp}
      className="rounded-[16px] bg-[#1C1917] p-8 sm:p-12 flex flex-col md:flex-row items-center md:items-stretch gap-10"
    >
      {/* Left — copy */}
      <div className="md:flex-[3] w-full">
        <p
          className="font-mono font-semibold text-[10px] uppercase text-[var(--color-persimmon)]"
          style={{ letterSpacing: "0.4em" }}
        >
          Visa Readiness Report
        </p>
        <h1
          className="font-display text-white mt-3"
          style={{ fontSize: "clamp(34px,5vw,48px)", letterSpacing: "-0.02em", lineHeight: 1.05 }}
        >
          {HEADLINES[snapshot.readiness_label]}
        </h1>
        <p className="text-white/60 text-[15px] mt-3 max-w-[44ch] leading-relaxed">
          {SUBTEXTS[snapshot.readiness_label]}
        </p>
        <div className="flex flex-wrap gap-2 mt-8">
          <Pill>Steps: {snapshot.steps_completed}/{snapshot.steps_total}</Pill>
          <Pill>Documents: {snapshot.documents_passed}/{snapshot.documents_total} passed</Pill>
          <Pill>Interviews: {snapshot.interview_sessions_count} session{snapshot.interview_sessions_count === 1 ? "" : "s"}</Pill>
        </div>
      </div>

      {/* Right — gauge */}
      <div className="md:flex-[2] w-full flex flex-col items-center justify-center gap-4">
        <Gauge score={snapshot.overall_readiness_score} />
        <span
          className="font-sans uppercase text-[11px] font-medium px-3 py-1 rounded"
          style={{
            color: colors.fg,
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            letterSpacing: "0.2em",
          }}
        >
          {LABEL_PRETTY[snapshot.readiness_label]}
        </span>
      </div>
    </motion.section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-full px-4 py-2 text-[13px] text-white"
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      {children}
    </span>
  );
}

/** Circular SVG gauge — outer track + animated persimmon arc + count-up number. */
function Gauge({ score }: { score: number }) {
  const size = 160;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = Math.max(0, Math.min(100, score));

  // Count-up
  const [displayed, setDisplayed] = useState(0);
  const [drawTo, setDrawTo] = useState(0);
  useEffect(() => {
    const reduce = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setDisplayed(target); setDrawTo(target); return; }

    // Number count-up — 1000ms
    let raf = 0; const start = performance.now(); const dur = 1000;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Arc draw — 1200ms via CSS transition
    const t = window.setTimeout(() => setDrawTo(target), 30);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [target]);

  const dashOffset = circumference * (1 - drawTo / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-persimmon)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1200ms cubic-bezier(0.23,1,0.32,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display text-white"
          style={{ fontSize: 52, lineHeight: 1, letterSpacing: "-0.02em" }}
        >
          {displayed}
        </span>
        <span className="text-white/50 text-[11px] mt-1">/ 100</span>
      </div>
    </div>
  );
}
