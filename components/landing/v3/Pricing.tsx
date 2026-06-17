import Link from "next/link";
import { Eyebrow } from "./primitives/Eyebrow";
import {
  PRICES,
  formatPrice,
  formatOriginalPrice,
  type Currency,
  type PriceDisplay,
} from "@/lib/pricing";

type PlanProps = {
  name: string;
  caption: string;
  price: PriceDisplay;
  bullets: string[];
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
          no upsells, no trial timer.
        </p>
      </div>
      <div className="v3-price-grid">
        <Plan
          variant="free"
          name="Free"
          caption="Phase 1 unlocked forever."
          price={PRICES.free[currency]}
          bullets={[
            "All 6 Phase 1 steps",
            "3 AI questions per day",
            "1 voice mock per week",
            "Document vault read-only",
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
            "Every phase unlocked",
            "Unlimited AI questions",
            "Unlimited voice mocks",
            "Document vault with AI checks",
            "Parent share view",
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
            "Everything in Solo, for 2",
            "Combined parent view",
            "Sibling document re-use",
            "Priority email support",
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
          <li key={b}>
            <span className="v3-check" aria-hidden />
            {b}
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
