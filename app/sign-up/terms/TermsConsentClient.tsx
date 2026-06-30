"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ════════════════════════════════════════════════════════════════════════
   TermsConsentClient — forced-scroll ToS confirmation.

   DPDP Act compliance — affirmative consent. Continue is disabled
   until ALL of:
     1. The scrollable Terms region has been scrolled to the bottom.
     2. Checkbox A: read + agree to ToS + Privacy.
     3. Checkbox B: understand GetStamped does not guarantee outcomes.

   A thin persimmon progress bar at the top of the scroll region tracks
   how much remains to read. The content mirrors /terms verbatim so
   nothing is hidden from the user.
   ════════════════════════════════════════════════════════════════════════ */

type Section = { heading: string; body: string };

const TOS_SECTIONS: Section[] = [
  {
    heading: "What GetStamped is",
    body:
      "GetStamped is a guided checklist and reference tool for the United States F-1 student visa process. It is an educational resource. It is not legal advice, immigration counsel, or a substitute for the official information published by the US Department of State.",
  },
  {
    heading: "No guarantee of visa outcomes",
    body:
      "GetStamped helps you prepare. It does not, and cannot, guarantee that your visa will be approved, that any specific consulate will admit you, or that any officer will accept the documents you produce. Visa adjudication is a sovereign decision made by the issuing government. We are not affiliated with any government agency and our checklist outputs are not legal verifications.",
  },
  {
    heading: "Eligibility",
    body:
      "You may use the product if you are at least 18 years old, or if a parent or guardian is using it on your behalf and providing consent. You confirm this at signup.",
  },
  {
    heading: "Accounts and your responsibilities",
    body:
      "You are responsible for keeping your account credentials safe and for the accuracy of any information you enter. You agree not to misrepresent identity or documents, not to resell or scrape the content for commercial use, and not to attempt to break, abuse, or disrupt the service for other users. We work hard to keep the 47-step process current with US visa requirements, but immigration policies change — you are responsible for verifying critical forms, fees, and consulate-specific instructions against the official source before acting on them.",
  },
  {
    heading: "Refunds",
    body:
      "Every paid plan includes a full refund within 14 days of purchase if the product is not useful to you. Refund requests after the 14-day window are evaluated case-by-case but are not guaranteed, and refunds are never tied to visa outcome — that depends on factors no preparation tool can guarantee. See the Refund Policy page for the full procedure.",
  },
  {
    heading: "Limitation of liability",
    body:
      "GetStamped is provided as is. We make no warranty that the product will be uninterrupted, error-free, or fit for any particular purpose. To the extent permitted by law, our total liability for any claim arising out of your use of the service is limited to the amount you paid us in the twelve months before the claim.",
  },
  {
    heading: "Termination",
    body:
      "We may suspend or terminate your access if you violate these terms, attempt to abuse the service, or use it to commit fraud. You may delete your account at any time by emailing founder@getstamped.app — your data is removed within 7 business days.",
  },
  {
    heading: "Privacy and data handling",
    body:
      "Your privacy is governed by our Privacy Policy. In short: raw document files are processed transiently and deleted within minutes; only the structured checklist outcome is stored. We do not sell your data. We do not run cross-site tracking. We comply with India's Digital Personal Data Protection Act as a Data Fiduciary.",
  },
  {
    heading: "Changes to these terms",
    body:
      "If we change anything material, we will email you before the change takes effect and re-prompt you for confirmation on your next login. Continuing to use the service after a change constitutes acceptance of the updated terms.",
  },
  {
    heading: "Governing law",
    body:
      "These terms are governed by the laws of the jurisdiction in which GetStamped is registered. Any disputes will be resolved there. We will update this section once the company is formally incorporated.",
  },
];

export function TermsConsentClient() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const [reachedBottom, setReachedBottom] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [understandOutcomes, setUnderstandOutcomes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollable = el.scrollHeight - el.clientHeight;
    if (scrollable <= 0) {
      // Content fits without scrolling — treat as fully read.
      setScrollPct(100);
      setReachedBottom(true);
      return;
    }
    const pct = Math.min(100, Math.max(0, (el.scrollTop / scrollable) * 100));
    setScrollPct(pct);
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setReachedBottom(true);
    }
  }, []);

  // Run once on mount in case the viewport is tall enough to already
  // show the whole document — otherwise the bottom check would never
  // fire and Continue would stay disabled forever.
  useEffect(() => {
    onScroll();
  }, [onScroll]);

  const canContinue =
    reachedBottom && agreeTerms && understandOutcomes && !submitting;

  const onContinue = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/auth/tos-consent", { method: "POST" });
      if (!r.ok) {
        setError("Could not record your confirmation. Try again.");
        setSubmitting(false);
        return;
      }
      // Send the user where they were going. The /sign-up/terms server
      // shell will not redirect them back here on the next nav because
      // their tos_consent_version is now current.
      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Could not record your confirmation. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] px-4 py-10">
      <div className="w-full max-w-2xl">
        <header className="text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
            One more step
          </p>
          <h1 className="mt-2 font-display text-[28px] sm:text-[32px] leading-tight tracking-tight text-[var(--color-ink)]">
            Confirm our Terms of Service
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Please read through, then confirm below. Continue is enabled
            once you&rsquo;ve scrolled to the bottom and ticked both boxes.
          </p>
        </header>

        <section
          aria-label="Terms of Service"
          className="mt-6 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] overflow-hidden"
        >
          {/* Scroll progress — thin persimmon bar pinned to top of the
              scroll region. Sticks visually to the container edge. */}
          <div
            aria-hidden
            className="h-1 w-full bg-[var(--color-border-soft)]"
          >
            <div
              className="h-full bg-[var(--color-persimmon)] transition-[width] duration-150 ease-out"
              style={{ width: `${scrollPct}%` }}
            />
          </div>

          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="max-h-[55vh] min-h-[320px] overflow-y-auto px-5 sm:px-7 py-6 text-[14px] leading-relaxed text-[var(--color-ink-soft)]"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Effective June 2026
            </p>

            {TOS_SECTIONS.map((s) => (
              <article key={s.heading} className="mt-6 first:mt-4">
                <h2 className="font-display text-[18px] tracking-tight text-[var(--color-ink)]">
                  {s.heading}
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed">{s.body}</p>
              </article>
            ))}

            <p className="mt-8 text-[12px] text-[var(--color-muted)]">
              You can read the same Terms anytime at{" "}
              <a href="/terms" className="underline underline-offset-2">
                getstamped.app/terms
              </a>
              .
            </p>
          </div>
        </section>

        {/* Required acknowledgements */}
        <div className="mt-5 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-3 hover:border-[var(--color-border)] transition-colors">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--color-persimmon)] cursor-pointer shrink-0"
            />
            <span className="text-[13px] text-[var(--color-ink)] leading-snug">
              I have read and agree to the Terms of Service and Privacy
              Policy.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-3 hover:border-[var(--color-border)] transition-colors">
            <input
              type="checkbox"
              checked={understandOutcomes}
              onChange={(e) => setUnderstandOutcomes(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--color-persimmon)] cursor-pointer shrink-0"
            />
            <span className="text-[13px] text-[var(--color-ink)] leading-snug">
              I understand that GetStamped is a preparation tool and does
              not guarantee visa approval or consulate outcomes.
            </span>
          </label>
        </div>

        {!reachedBottom && (
          <p className="mt-3 text-center text-[11px] text-[var(--color-muted)]">
            Scroll to the bottom of the Terms to enable Continue.
          </p>
        )}

        {error && (
          <p
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="inline-flex items-center justify-center rounded-xl bg-[var(--color-persimmon)] px-6 py-3 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : "I agree, continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
