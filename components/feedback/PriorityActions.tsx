"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { fadeUp, staggerContainer, inViewOnce } from "@/lib/motion";
import type { PriorityAction } from "@/app/api/feedback/priority-actions/route";

const EFFORT_COLORS: Record<PriorityAction["effort"], { fg: string; bg: string }> = {
  low:    { fg: "#22C55E", bg: "rgba(34,197,94,0.15)" },
  medium: { fg: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  high:   { fg: "#EF4444", bg: "rgba(239,68,68,0.15)" },
};

export function PriorityActions() {
  const [actions, setActions] = useState<PriorityAction[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/feedback/priority-actions")
      .then((r) => r.json())
      .then((data: { actions?: PriorityAction[] }) => {
        if (!cancelled && Array.isArray(data?.actions)) setActions(data.actions);
      })
      // Endpoint already returns FALLBACK on failure, so this only fires on
      // network down. Show skeletons forever rather than blank cards — the
      // user can refresh.
      .catch(() => { /* keep skeleton */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="mt-6 rounded-[12px] bg-white border border-[rgba(28,25,23,0.08)] p-8">
      <h2 className="font-display text-[24px] text-[var(--color-ink)]">
        Your Priority Actions
      </h2>
      <p className="font-sans text-[13px] text-[var(--color-ink-soft)] mt-1">
        Sorted by impact on your readiness score.
      </p>

      {actions == null ? (
        <>
          <p className="font-sans text-[13px] text-[var(--color-ink-soft)] italic mt-6">
            Analysing your preparation…
          </p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        </>
      ) : (
        <motion.div
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
        >
          {actions.map((a) => (
            <motion.article
              key={a.priority}
              variants={fadeUp}
              className="rounded-[12px] bg-[var(--color-paper)] border border-[rgba(28,25,23,0.08)] p-6"
            >
              <p
                className="font-display"
                style={{ fontSize: 32, color: "rgba(232,98,42,0.30)", lineHeight: 1 }}
              >
                {String(a.priority).padStart(2, "0")}
              </p>
              <h3 className="font-sans font-semibold text-[15px] text-[var(--color-ink)] mt-3">
                {a.title}
              </h3>
              <p className="font-sans text-[13px] text-[var(--color-ink-soft)] mt-2" style={{ lineHeight: 1.6 }}>
                {a.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className="font-sans text-[10px] uppercase px-2 py-1 rounded"
                  style={{
                    color: "var(--color-persimmon-deep)",
                    background: "rgba(232,98,42,0.10)",
                    letterSpacing: "0.12em",
                  }}
                >
                  {a.impact}
                </span>
                <span
                  className="font-sans text-[10px] uppercase px-2 py-1 rounded"
                  style={{ color: EFFORT_COLORS[a.effort].fg, background: EFFORT_COLORS[a.effort].bg, letterSpacing: "0.12em" }}
                >
                  {a.effort}
                </span>
                <span className="font-sans text-[11px] text-[var(--color-ink-soft)]">
                  ~{a.estimated_minutes} min
                </span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[12px] bg-[var(--color-paper)] border border-[rgba(28,25,23,0.08)] p-6 animate-pulse">
      <div className="h-7 w-8 rounded bg-[rgba(28,25,23,0.08)]" />
      <div className="h-4 w-3/4 rounded bg-[rgba(28,25,23,0.08)] mt-4" />
      <div className="h-3 w-full rounded bg-[rgba(28,25,23,0.06)] mt-3" />
      <div className="h-3 w-5/6 rounded bg-[rgba(28,25,23,0.06)] mt-1.5" />
      <div className="flex gap-2 mt-4">
        <div className="h-5 w-16 rounded bg-[rgba(28,25,23,0.08)]" />
        <div className="h-5 w-12 rounded bg-[rgba(28,25,23,0.08)]" />
      </div>
    </div>
  );
}
