"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { fadeUp, staggerContainer, inViewOnce } from "@/lib/motion";
import type { DocReview } from "@/lib/feedback-data";

export function DocumentIssues({ failed }: { failed: DocReview[] }) {
  return (
    <section className="mt-6 rounded-[12px] bg-white border border-[rgba(28,25,23,0.08)] p-8">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: "#EF4444" }}
        />
        <h2 className="font-display text-[24px] text-[var(--color-ink)]">
          Documents Needing Attention
        </h2>
      </div>

      <motion.div
        className="mt-4 space-y-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={inViewOnce}
      >
        {failed.map((doc) => (
          <motion.div
            key={doc.document_key}
            variants={fadeUp}
            className="rounded-r-[8px] p-5"
            style={{
              borderLeft: "3px solid #EF4444",
              background: "rgba(239,68,68,0.02)",
            }}
          >
            <p className="font-sans font-semibold text-[15px] text-[var(--color-ink)]">
              {doc.document_display_name}
            </p>
            {doc.issues.length > 0 ? (
              <ul className="mt-3 space-y-1">
                {doc.issues.map((issue, i) => (
                  <li
                    key={i}
                    className="font-sans text-[13px]"
                    style={{ color: "#EF4444", lineHeight: 1.8 }}
                  >
                    → {issue}
                  </li>
                ))}
              </ul>
            ) : null}
            {doc.suggestions.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {doc.suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="font-sans text-[13px]"
                    style={{ color: "#22C55E" }}
                  >
                    ✓ fix: {s}
                  </li>
                ))}
              </ul>
            ) : null}
            <Link
              href={`/dashboard/documents?doc=${encodeURIComponent(doc.document_key)}`}
              className="inline-block mt-3 font-sans text-[13px] text-[var(--color-persimmon)]"
            >
              Re-upload →
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
