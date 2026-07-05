import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "What Is GetStamped? F-1 Visa Prep Explained | GetStamped",
  description:
    "GetStamped is a guided F-1 student visa preparation workspace: a 47-step checklist, AI document checks, and voice-based mock interviews, built by a 17-year-old founder.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "What Is GetStamped? F-1 Visa Prep Explained",
    description:
      "GetStamped is a guided F-1 student visa preparation workspace: a 47-step checklist, AI document checks, and voice-based mock interviews.",
    url: "/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What Is GetStamped? F-1 Visa Prep Explained",
    description:
      "A guided F-1 student visa preparation workspace: 47 steps, AI document checks, voice mock interviews.",
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <LegalPage
        title="About GetStamped"
        eyebrow="About"
        effectiveDate="June 2026"
        intro={
          <p>
            <strong className="font-medium text-[var(--color-ink)]">
              GetStamped is a guided preparation workspace for the US F-1
              student visa process.
            </strong>{" "}
            It breaks the process into 47 ordered steps, checks uploaded
            documents for common mistakes with AI, and runs voice-based mock
            visa interviews — all in one place, so an applicant does not have
            to piece the process together from forums and consultant PDFs.
          </p>
        }
        sections={[
          {
            heading: "How GetStamped works",
            body: (
              <>
                <p>
                  GetStamped sequences the F-1 process into 47 ordered steps,
                  grouped into five phases from choosing a school through
                  landing in the US. Each step tells the applicant exactly
                  what to do next, in order, instead of leaving them to search
                  for it.
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li>
                    <strong className="font-medium text-[var(--color-ink)]">
                      AI document checks
                    </strong>{" "}
                    — uploaded documents (passport bio page, I-20, bank
                    statements) are scanned for missing signatures, expired
                    SEVIS receipts, and formatting issues drawn from documented
                    221(g) refusal patterns.
                  </li>
                  <li>
                    <strong className="font-medium text-[var(--color-ink)]">
                      Voice mock interviews
                    </strong>{" "}
                    — spoken practice answers are transcribed and scored on
                    clarity, confidence, specificity, and financial-story
                    consistency, the same axes consular officers commonly
                    weight.
                  </li>
                  <li>
                    <strong className="font-medium text-[var(--color-ink)]">
                      Parent Share
                    </strong>{" "}
                    — a read-only link that shows a student&rsquo;s parents
                    their current phase and next step, with no login and no
                    document access.
                  </li>
                </ul>
              </>
            ),
          },
          {
            heading: "Who it's for",
            body: (
              <p>
                GetStamped is built for international students applying for
                a US F-1 student visa, from any of the roughly 10 countries
                that send the most F-1 applicants each year. The 47 steps are
                identical at every US consulate worldwide; mock interview
                officer profiles are tuned per region.
              </p>
            ),
          },
          {
            heading: "Pricing",
            body: (
              <p>
                Phase 1 (the first 6 steps) is free forever. A single
                one-time payment — no subscription — unlocks all 47 steps,
                unlimited AI document checks, and weekly voice mock
                interviews (up to 5/week on Solo, 12/week on Family). See
                the full{" "}
                <Link href="/pricing" className="text-[var(--color-accent-deep)] underline underline-offset-2">
                  pricing breakdown
                </Link>{" "}
                for exact amounts by plan.
              </p>
            ),
          },
          {
            heading: "Who built it",
            body: (
              <p>
                GetStamped is built by a solo, 17-year-old founder. It is an
                independent product, not affiliated with the US Department of
                State, USCIS, or any government agency, and it is not a
                substitute for advice from a licensed immigration attorney —
                see the{" "}
                <Link href="/disclaimer" className="text-[var(--color-accent-deep)] underline underline-offset-2">
                  disclaimer
                </Link>{" "}
                for details.
              </p>
            ),
          },
          {
            heading: "Common questions",
            body: (
              <p>
                For specific questions about payment, refunds, document
                safety, and interview scoring, see the{" "}
                <Link href="/faq" className="text-[var(--color-accent-deep)] underline underline-offset-2">
                  full FAQ
                </Link>
                .
              </p>
            ),
          },
        ]}
      />
    </>
  );
}
