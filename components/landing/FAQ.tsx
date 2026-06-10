"use client";

import { Eyebrow } from "@/components/ui/Eyebrow";

const FAQS = [
  {
    q: "Is this only for Indian students?",
    a: "No. GetStamped is built for international students worldwide applying for F-1 visas. We have students from India, China, Vietnam, Nigeria, Brazil, South Korea, and 30+ other countries.",
  },
  {
    q: "What if my interview is in two weeks?",
    a: "You can still use GetStamped. We have an “interview imminent” mode that prioritizes the highest-impact prep — mock interviews, document verification, common red flags.",
  },
  {
    q: "Do you guarantee my visa will be approved?",
    a: "No, and no one honest can. Visa decisions are made by US consular officers. What we guarantee: you’ll walk into your interview prepared, with the right documents, having practiced the right questions.",
  },
  {
    q: "How is this different from a consultant?",
    a: "Consultants charge $300–$1,200 and manage a checklist. We’re $19 lifetime, available 24/7, and the information is structured for action, not for billable hours.",
  },
  {
    q: "What happens after my visa is stamped?",
    a: "Phase 5 (Post-approval) walks you through pre-departure prep, SEVIS validation, and your first week in the US. After that, lifetime access stays — you can refer back anytime.",
  },
  {
    q: "Can I share my account with my sibling?",
    a: "No — visa applications are personal and the data conflicts. Get the Family plan (₹2,499 / $29) for up to 3 students, each with their own dashboard.",
  },
  {
    q: "What if it doesn’t help me?",
    a: "Full refund within 14 days, no questions. Email us, we process the refund.",
  },
  {
    q: "Are you actually 17?",
    a: "Yes. I’m building GetStamped because I watched friends and family struggle through this process. I’m not selling a course or being an “EdTech founder” — I’m building one tool, done well.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="w-full bg-[var(--color-cream-soft)] py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-10">
        <div className="text-center">
          <Eyebrow>Frequently asked</Eyebrow>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-snug text-[var(--color-ink)]">
            Questions students actually ask.
          </h2>
        </div>

        <ul className="mt-12 space-y-2">
          {FAQS.map((item, i) => (
            <li key={i}>
              <details className="group rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-cream)] open:border-[var(--color-border)] transition-colors">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 select-none">
                  <span className="text-base sm:text-[17px] font-medium text-[var(--color-ink)] group-open:text-[var(--color-accent-deep)] transition-colors">
                    {item.q}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5 shrink-0 text-[var(--color-muted)] group-open:text-[var(--color-accent-deep)] transition-all duration-200 group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 -mt-1 text-sm sm:text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
                  {item.a}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
