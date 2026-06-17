"use client";

/**
 * FeedbackClient — the /dashboard/feedback page.
 *
 * Sections:
 *   A. Readiness header (ink card + gauge)
 *   B. Three breakdown cards (steps / docs / interview)
 *   C. Interview history accordion
 *   D. AI Priority Actions
 *   E. Failed-documents detail (only when relevant)
 *
 * F-1 preservation: data comes from /lib/feedback-data which never modifies
 * legacy tables. The page is a pure read.
 */

import Link from "next/link";
import { motion } from "motion/react";
import { fadeUp, staggerContainer, inViewOnce } from "@/lib/motion";
import type { StudentFeedback } from "@/lib/feedback-data";
import { ReadinessHeader } from "./ReadinessHeader";
import { ScoreCards } from "./ScoreCards";
import { InterviewHistory } from "./InterviewHistory";
import { PriorityActions } from "./PriorityActions";
import { DocumentIssues } from "./DocumentIssues";

export function FeedbackClient({ data }: { data: StudentFeedback }) {
  const failed = data.docReviews.filter((d) => !d.passed);
  return (
    <motion.div
      className="mx-auto max-w-[1100px] px-5 sm:px-6 lg:px-0 py-12 lg:py-16"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <ReadinessHeader data={data} />
      <ScoreCards data={data} />

      <motion.section
        className="mt-8"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={inViewOnce}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[24px] text-[var(--color-ink)]">
            Interview Sessions
          </h2>
          <Link
            href="/dashboard/mock-interview"
            className="rounded-lg border border-[var(--color-persimmon)] text-[var(--color-persimmon)] hover:bg-[var(--color-persimmon)] hover:text-white transition-colors px-4 py-2 text-[13px] font-medium"
          >
            Start new session →
          </Link>
        </div>
        <InterviewHistory sessions={data.sessions} />
      </motion.section>

      <PriorityActions />

      {failed.length > 0 ? <DocumentIssues failed={failed} /> : null}
    </motion.div>
  );
}
