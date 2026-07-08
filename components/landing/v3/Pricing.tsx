import Link from "next/link";
import { Eyebrow } from "./primitives/Eyebrow";
import { InfoTip } from "@/components/ui/InfoTip";
import {
  PRICES,
  formatPrice,
  formatOriginalPrice,
  type Currency,
  type PriceDisplay,
} from "@/lib/pricing";

type Bullet = { label: string; tip: string; included?: boolean };

type PlanProps = {
  name: string;
  caption: string;
  price: PriceDisplay;
  bullets: Bullet[];
  ctaHref: string;
  ctaLabel: string;
  variant: "free" | "solo" | "family";
};

export function Pricing({ currency }: { currency: Currency }) {
  return (
    <section id="pricing" className="v3-section v3-pricing">
      <span className="v3-portal-glow" aria-hidden />
      <div className="v3-pricing-head">
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="v3-h2 v3-mt-6">
          Phase 1 is free.{" "}
          <span className="v3-italic v3-persimmon">Forever.</span>
        </h2>
        <p className="v3-lead v3-mt-6 v3-max-reading">
          One payment unlocks everything through visa stamping. No subscription,
          no upsells, no trial timer. See{" "}
          <Link href="/#features" className="v3-link">
            what&rsquo;s included
          </Link>{" "}
          in every plan.
        </p>
      </div>
      <div className="v3-price-grid">
        <Plan
          variant="free"
          name="Free"
          caption="Phase 1 unlocked forever."
          price={PRICES.free[currency]}
          bullets={[
            { label: "Timeline · Phase 1 only", tip: "The full 47-step playbook, sequenced for your consulate — only the first phase (before your I-20) is unlocked on Free." },
            { label: "University & Course Fit Quiz", tip: "A 2-minute quiz that turns your field, budget, and scores into a personalized reach/target/safety shortlist framework." },
            { label: "Planner · Phase 1 only", tip: "A day-by-day schedule for your steps between today and your interview. Locked to Phase 1 until you upgrade." },
            { label: "Ask AI · 3 questions/day", tip: "Ask anything about your visa process, in context of your own timeline. Capped at 3 questions a day on Free." },
            { label: "Mock Interview · 1/week", tip: "Practice out loud with a voice AI officer, scored on clarity, confidence, and your ties-to-home story." },
            { label: "Document Vault · view only", tip: "Upload and organize your documents for the interview. AI formatting checks are a paid-plan feature." },
            { label: "Feedback", tip: "Your overall visa readiness, scored across study plan, financials, and ties to home.", included: false },
            { label: "Parent Share", tip: "A read-only link so a parent can see your progress without needing their own account.", included: false },
            { label: "214(b) Refusal Recovery Guidance", tip: "If you're refused, step-by-step guidance on what changed-circumstances evidence to fix before reapplying — part of Phase 5.", included: false },
          ]}
          ctaLabel="Start free"
          ctaHref="/sign-up"
        />
        <Plan
          variant="solo"
          name="Solo"
          caption="All 47 steps. Yours until stamped."
          price={PRICES.solo[currency]}
          bullets={[
            { label: "Timeline · all 47 steps", tip: "Every phase unlocked, sequenced for your consulate, from before your I-20 through post-approval." },
            { label: "University & Course Fit Quiz", tip: "A 2-minute quiz that turns your field, budget, and scores into a personalized reach/target/safety shortlist framework." },
            { label: "Planner · full schedule", tip: "Every remaining step scheduled day-by-day from today to your interview date." },
            { label: "Ask AI · unlimited", tip: "Ask anything about your visa process, in context of your own timeline, as often as you want." },
            { label: "Mock Interview · up to 5/week", tip: "Practice out loud with a voice AI officer, scored on clarity, confidence, and your ties-to-home story." },
            { label: "Document Vault · AI checks", tip: "AI reads every upload and flags missing signatures, expired dates, and wrong form versions." },
            { label: "Feedback", tip: "Your overall visa readiness, scored across study plan, financials, and ties to home." },
            { label: "Parent Share", tip: "A read-only link so a parent can see your progress without needing their own account." },
            { label: "214(b) Refusal Recovery Guidance", tip: "If you're refused, step-by-step guidance on what changed-circumstances evidence to fix before reapplying — part of Phase 5." },
          ]}
          ctaLabel="Get Solo"
          ctaHref="/sign-up?plan=solo"
        />
        <Plan
          variant="family"
          name="Family"
          caption="Two students. One payment."
          price={PRICES.family[currency]}
          bullets={[
            { label: "Timeline · all 47 steps, 2 students", tip: "Every phase unlocked for both students, each with their own sequenced playbook." },
            { label: "University & Course Fit Quiz · both students", tip: "A 2-minute quiz per student that turns their field, budget, and scores into a personalized reach/target/safety shortlist framework." },
            { label: "Planner · full schedule, both students", tip: "Every remaining step scheduled day-by-day, per student, from today to each interview date." },
            { label: "Ask AI · unlimited, both students", tip: "Ask anything about your visa process, in context of your own timeline, as often as you want." },
            { label: "Mock Interview · up to 12/week (6 each)", tip: "Practice out loud with a voice AI officer, scored on clarity, confidence, and ties to home." },
            { label: "Document Vault · shared + AI checks", tip: "AI reads every upload and flags issues; siblings can re-use shared documents like proof of funds." },
            { label: "Feedback · per student", tip: "Each student's overall visa readiness, scored across study plan, financials, and ties to home." },
            { label: "Parent Share · combined view", tip: "One read-only link showing both students' progress side by side — no separate accounts." },
            { label: "214(b) Refusal Recovery Guidance", tip: "If either student is refused, step-by-step guidance on what changed-circumstances evidence to fix before reapplying — part of Phase 5." },
            { label: "Priority email support", tip: "Family plan replies go to the front of the queue instead of the general support inbox." },
          ]}
          ctaLabel="Get Family"
          ctaHref="/sign-up?plan=family"
        />
      </div>
      <p className="v3-refund">
        14-day refund. No exit interview, no forms. Email and the money is back.
      </p>
    </section>
  );
}

function Plan({
  name, caption, price, bullets, ctaHref, ctaLabel, variant,
}: PlanProps) {
  const rec = variant === "solo";
  const original = formatOriginalPrice(price);
  return (
    <div className={`v3-price-card v3-price-${variant}`}>
      {rec ? <span className="v3-price-chip">Most chosen</span> : null}
      <h3 className="v3-price-name">{name}</h3>
      <p className="v3-price-caption">{caption}</p>
      <div className="v3-price-row">
        <span className="v3-price-amt">
          <span className="v3-price-symbol" aria-hidden="true">{price.symbol}</span>
          <span className="v3-price-num tabular-nums">{price.amount}</span>
        </span>
        {original ? (
          <span className="v3-price-strike v3-mono">
            <s>{original}</s>
            {price.discountPct ? (
              <span className="v3-price-pct">−{price.discountPct}%</span>
            ) : null}
          </span>
        ) : null}
      </div>
      <p className="v3-mono v3-price-per">
        {price.per ?? "one-time · no subscription"}
      </p>
      <ul className="v3-bullets v3-price-bullets">
        {bullets.map((b) => (
          <li key={b.label} className={b.included === false ? "is-excluded" : undefined}>
            <span className={`v3-check${b.included === false ? " is-excluded" : ""}`} aria-hidden />
            <span className="v3-bullet-label">{b.label}</span>
            <InfoTip text={b.tip} />
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={rec ? "v3-pill v3-pill-full" : "v3-ghost v3-ghost-full"}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
