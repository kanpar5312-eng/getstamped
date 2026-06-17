"use client";

import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { usePricing } from "@/lib/PricingContext";
import { PRICES, formatPrice } from "@/lib/pricing";
import { Reveal, TiltCard } from "@/components/motion/MotionKit";

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 text-[var(--color-ink)] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12l5 5 9-11" />
    </svg>
  );
}

type CardProps = {
  title: string;
  price: string;
  originalPrice?: string;
  discountPct?: number;
  subPrice?: string;
  highlight?: boolean;
  pill?: string;
  features: string[];
  cta: { label: string; href: string; primary?: boolean };
  badge?: React.ReactNode;
};

function PriceCard({
  title,
  price,
  originalPrice,
  discountPct,
  subPrice,
  highlight,
  pill,
  features,
  cta,
  badge,
}: CardProps) {
  const cardBody = (
    <div
      className={[
        "relative rounded-2xl p-6 sm:p-7 flex flex-col h-full",
        highlight
          ? "border-2 border-[var(--color-persimmon)] bg-[var(--color-paper-soft)] shadow-[0_30px_80px_-30px_rgba(217,70,30,0.25)]"
          : "border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)]",
      ].join(" ")}
    >
      {pill && (
        <span className="absolute -top-2.5 right-5 inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)] text-[var(--color-paper-soft)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]">
          {pill}
        </span>
      )}

      <div>
        <h3 className="text-base font-medium text-[var(--color-ink)]">
          {title}
        </h3>
        <div className="mt-4 flex items-baseline gap-3 flex-wrap">
          <span className="font-display text-4xl sm:text-5xl tracking-tight text-[var(--color-ink)] tabular-nums leading-none">
            {price}
          </span>
          {originalPrice && (
            <span className="font-display text-xl text-[var(--color-muted)] tabular-nums line-through leading-none">
              {originalPrice}
            </span>
          )}
          {discountPct && (
            <span className="rounded-full bg-[var(--color-persimmon-tint)] text-[var(--color-persimmon-deep)] px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.08em]">
              {discountPct}% off
            </span>
          )}
        </div>
        {subPrice && (
          <p className="mt-2 text-xs text-[var(--color-muted)]">{subPrice}</p>
        )}
        {badge && <div className="mt-3">{badge}</div>}
      </div>

      <div className="my-6 border-t border-[var(--color-border-soft)]" />

      <ul className="space-y-3 flex-1">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2.5 text-sm text-[var(--color-ink)] leading-relaxed"
          >
            <span className="mt-0.5"><Check /></span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7">
        <Link href={cta.href} className="block">
          <button
            type="button"
            className={[
              "w-full inline-flex items-center justify-center rounded-lg px-5 py-2.5",
              "text-sm font-medium tracking-tight transition-colors duration-200",
              cta.primary
                ? "bg-[var(--color-persimmon)] text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)]"
                : "border border-[var(--color-border)] bg-transparent text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)]",
            ].join(" ")}
          >
            {cta.label}
          </button>
        </Link>
      </div>
    </div>
  );
  return highlight ? <TiltCard className="h-full">{cardBody}</TiltCard> : cardBody;
}

type Props = {
  earlyBirdClaimed: number;
};

export function Pricing({ earlyBirdClaimed }: Props) {
  const { currency, toggle } = usePricing();
  const free = PRICES.free[currency];
  const solo = PRICES.solo[currency];
  const family = PRICES.family[currency];
  const eb = PRICES.earlyBird[currency];

  const earlyBirdAvailable = earlyBirdClaimed < 100;
  const otherCurrency = currency === "INR" ? "USD" : "INR";
  const otherSymbol = otherCurrency === "INR" ? "₹" : "$";

  return (
    <section
      id="pricing"
      className="w-full bg-[var(--color-paper-soft)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-snug text-[var(--color-ink)]">
            Free to start. Pay when you&rsquo;re ready.
          </h2>
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[var(--color-ink-soft)]">
            Phase 1 is free forever. Upgrade to unlock the steps that actually
            matter.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
          <Reveal delay={0} className="h-full">
          <PriceCard
            title="Free"
            price={formatPrice(free)}
            subPrice="Forever. No card."
            features={[
              "Phase 1 unlocked (6 steps)",
              "Full timeline preview",
              "3 AI questions",
              "1 text-based mock interview",
              "Basic dashboard",
            ]}
            cta={{ label: "Start free", href: "/dashboard" }}
          />
          </Reveal>

          <Reveal delay={80} className="h-full">
          <PriceCard
            title="Solo"
            price={formatPrice(solo)}
            originalPrice={solo.originalAmount ? `${solo.symbol}${solo.originalAmount}` : undefined}
            discountPct={solo.discountPct}
            subPrice={solo.per}
            highlight
            pill="Most popular"
            badge={
              earlyBirdAvailable ? (
                <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent-tint)] px-3 py-2 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-soft-pulse" />
                  <span className="text-[var(--color-accent-deep)] font-medium">
                    {formatPrice(eb)} for first 100 ·{" "}
                    <span className="font-mono tabular-nums">
                      {earlyBirdClaimed}
                    </span>{" "}
                    of 100 claimed
                  </span>
                </div>
              ) : undefined
            }
            features={[
              "All 47 steps unlocked",
              "Voice mock interview (unlimited)",
              "AI Q&A (unlimited)",
              "Document organizer + interview-day PDF",
              "Parent view (shareable link)",
              "Real-time policy updates",
              "14-day refund",
            ]}
            cta={{ label: "Get Solo", href: "/dashboard?plan=solo", primary: true }}
          />
          </Reveal>

          <Reveal delay={160} className="h-full">
          <PriceCard
            title="Family"
            price={formatPrice(family)}
            originalPrice={family.originalAmount ? `${family.symbol}${family.originalAmount}` : undefined}
            discountPct={family.discountPct}
            subPrice={family.per}
            features={[
              "Everything in Solo",
              "3 independent student dashboards",
              "Family overview for the buyer",
              "Best for siblings, cousins, friends",
            ]}
            cta={{ label: "Get Family", href: "/dashboard?plan=family" }}
          />
          </Reveal>
        </div>

        <div className="mt-10 text-center text-xs text-[var(--color-muted)] space-y-1.5">
          <p>
            All plans: lifetime access until your visa is stamped. 14-day full
            refund if it doesn&rsquo;t help.
          </p>
          <p>
            Pricing in {currency === "INR" ? "₹" : "$"} ·{" "}
            <button
              type="button"
              onClick={toggle}
              className="underline underline-offset-2 hover:text-[var(--color-ink)] transition-colors"
            >
              change to {otherSymbol}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
