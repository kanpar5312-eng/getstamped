"use client";

import { useState } from "react";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageJsonLd } from "@/lib/seo";

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
      "Yes. One charge unlocks every phase, every step, and every tool until your visa is stamped. No renewals, no usage tiers, no trial timer.",
  },
  {
    question: "Are you actual visa lawyers?",
    answer:
      "No. GetStamped is a structured preparation tool built on the official DS-160, FAM 9, and SEVP guidance, with sources cited on every claim. We are not immigration attorneys and our checks are not legal advice. For legal questions, please consult a licensed immigration attorney or your DSO.",
  },
  {
    question: "What does the AI document check actually do?",
    answer:
      "It reads each page you upload — passport bio, I-20, bank statements — and flags missing signatures, expired SEVIS receipts, wrong DS-160 confirmation numbers, and checks for 14 common formatting issues documented in 221(g) refusal data. It is an automated formatting check, not a legal review, and it does not guarantee visa approval.",
  },
  {
    question: "What happens to my documents after the AI scan?",
    answer:
      "Your file is sent for an automated formatting check and then permanently deleted from our storage within 5 minutes. We only retain the structured checklist result (for example, \"signature: verified\") — never the image, never extracted text, never any personally identifying data beyond your account email and name. Our AI provider, Groq, has Zero Data Retention (ZDR) enabled on our account, so submitted content is not stored on their side either.",
  },
  {
    question: "How is the mock interview scored?",
    answer:
      "Your spoken answer is transcribed and graded on four axes consular officers commonly weight: clarity, confidence, specificity, and the consistency of your financial story. We store the transcript and scores so you can review your sessions; we do not store the raw audio, and our AI provider (Groq) does not retain the transcripts beyond the inference request.",
  },
  {
    question: "Do my parents need to install anything?",
    answer:
      "No. Parent Share is a read-only link you choose to share. They open it in any browser and see progress, the current phase, and the next step — no login, no app install, no access to your documents.",
  },
  {
    question: "What if I get refused — do I get my money back?",
    answer:
      "Every paid plan includes a full refund within 14 days of purchase if the product is not useful to you. Refunds are never tied to visa outcome — that depends on factors no preparation tool can control, and we will not promise otherwise.",
  },
  {
    question: "When should I actually start using this?",
    answer:
      "Ideally the day your I-20 arrives. Earlier than that you're still picking schools — Phase 1 is free, so feel free to explore. We recommend starting at least 6 weeks before your appointment; tighter than that and the mock interview practice gets rushed.",
  },
  {
    question: "Is my passport and bank info actually safe?",
    answer:
      "Yes. Documents are deleted from our storage within 5 minutes of upload — only the structured checklist result is kept. Account data (name, email, progress, mock transcripts) is encrypted at rest, never used to train AI models, and never sold or shared with advertisers. You can request deletion of your account and all associated data at any time by emailing getstampedlegal@gmail.com — we action requests within 7 business days. We operate as a Data Fiduciary under India's Digital Personal Data Protection (DPDP) Act.",
  },
  {
    question: "Will this work for my consulate? (Mumbai, Lagos, Bogotá, etc.)",
    answer:
      "Yes. The 47 steps are identical across every US consulate worldwide. Mock interview officer profiles are tuned per region — officers at different posts tend to ask different follow-ups, and the practice content reflects that.",
  },
  {
    question: "What about UK / Canada / Australia visas?",
    answer:
      "Not yet. Right now we cover US F-1 only — that's where we're sharpest. The same architecture (phased playbook, document checks, mock interview) is designed to extend to the UK Student Route, Canadian Study Permit, and Australian subclass 500. Targeted rollout late 2026.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 lg:py-32">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] font-medium">
            FAQ
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[var(--color-ink)]">
            Questions, <span className="text-[var(--color-persimmon)]">answered</span>.
          </h2>
          <p className="mt-5 text-base text-[var(--color-ink-soft)] leading-relaxed">
            Still curious? See the{" "}
            <Link
              href="/pricing"
              className="text-[var(--color-persimmon)] hover:underline underline-offset-2"
            >
              full pricing breakdown
            </Link>{" "}
            or email{" "}
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
