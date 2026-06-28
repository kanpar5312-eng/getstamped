"use client";

import { useState } from "react";

/* ════════════════════════════════════════════════════════════════════════
   FAQ — Wavly-style minimal accordion.
   Layout: cream-soft card with divide-y rows, persimmon + icon that
   rotates 45° on open, smooth grid-row reveal of the answer. Copy is
   the existing 6 GetStamped questions verbatim.
   ═════════════════════════════════════════════════════════════════════════ */

type FaqItem = { question: string; answer: string };

const faqs: FaqItem[] = [
  {
    question: "Is it really one payment forever?",
    answer:
      "Yes. One charge unlocks every phase, every step, every tool until your visa is stamped. No renewal, no usage tier, no trial timer.",
  },
  {
    question: "Are you actual visa lawyers?",
    answer:
      "No, and we say that everywhere. We are a structured prep tool built on the official DS-160, FAM 9, and SEVP guidance, with sources cited on every claim. For legal advice, talk to an immigration attorney.",
  },
  {
    question: "What does the AI document check actually do?",
    answer:
      "It reads each page you upload — passport bio, I-20, bank statements — and flags missing signatures, expired SEVIS receipts, wrong DS-160 confirmation numbers, and 14 other refusal patterns documented in 221(g) data.",
  },
  {
    question: "How is the mock interview scored?",
    answer:
      "Your voice is transcribed and graded on four axes officers actually weight: clarity (filler words, sentence length), confidence (response latency, hedging), specificity (named programs, dates), and financial story (sponsor consistency).",
  },
  {
    question: "Do my parents need to install anything?",
    answer:
      "No. The parent view is a read-only link you share. They open it in any browser and see progress, the next step, and what is blocking. No login, no app, no document downloads.",
  },
  {
    question: "What if I get refused — do I get my money back?",
    answer:
      "Refunds in the first 14 days for any reason. After that, we don't refund based on visa outcome — that depends on factors no prep tool can guarantee. We're honest about that.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] font-medium">
            FAQ
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[var(--color-ink)]">
            Questions, <span className="text-[var(--color-persimmon)]">answered</span>.
          </h2>
          <p className="mt-5 text-base text-[var(--color-ink-soft)] leading-relaxed">
            Still curious? Email{" "}
            <a
              href="mailto:getstamped.online@gmail.com"
              className="text-[var(--color-persimmon)] hover:underline underline-offset-2"
            >
              getstamped.online@gmail.com
            </a>
            .
          </p>
        </div>

        <div className="mt-14 mx-auto max-w-3xl">
          <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] overflow-hidden">
            <ul className="divide-y divide-[var(--color-border-soft)]">
              {faqs.map((item, i) => {
                const open = openIndex === i;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(open ? null : i)}
                      aria-expanded={open}
                      aria-controls={`faq-panel-${i}`}
                      className="group w-full flex items-center justify-between gap-6 px-6 sm:px-8 py-5 sm:py-6 text-left hover:bg-[var(--color-surface)] transition-colors"
                    >
                      <span
                        className={`text-base sm:text-[1.05rem] font-medium pr-2 transition-colors ${
                          open
                            ? "text-[var(--color-persimmon)]"
                            : "text-[var(--color-ink)] group-hover:text-[var(--color-persimmon)]"
                        }`}
                      >
                        {item.question}
                      </span>
                      <span
                        className={`shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full border transition-all duration-300 ${
                          open
                            ? "bg-[var(--color-persimmon)] border-[var(--color-persimmon)] text-[var(--color-cream-soft)] rotate-45"
                            : "bg-transparent border-[var(--color-border)] text-[var(--color-persimmon)] group-hover:border-[var(--color-persimmon)]"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </button>

                    <div
                      id={`faq-panel-${i}`}
                      role="region"
                      className={`grid transition-all ease-out ${
                        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                      style={{ transitionDuration: "360ms" }}
                    >
                      <div className="overflow-hidden">
                        <div className="px-6 sm:px-8 pb-6 sm:pb-7 -mt-1">
                          <p className="text-sm sm:text-[0.95rem] leading-relaxed text-[var(--color-ink-soft)] max-w-2xl">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--color-ink-soft)]">
              Still have questions?{" "}
              <a
                href="mailto:getstamped.online@gmail.com"
                className="font-medium text-[var(--color-persimmon)] hover:text-[var(--color-persimmon-deep)] hover:underline underline-offset-2"
              >
                Email us
              </a>{" "}
              — we usually reply within a few hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
