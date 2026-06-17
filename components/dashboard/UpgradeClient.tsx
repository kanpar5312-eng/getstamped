"use client";

import Link from "next/link";
import { usePricing } from "@/lib/PricingContext";
import { PRICES, type Currency } from "@/lib/pricing";

type Plan = "free" | "solo" | "family";

type Props = {
  currentPlan: Plan;
  earlyBirdRemaining: number;
};

const DISCOUNT_PCT = 30;

/* ---------- Tier content (real product from lib/pricing.ts) ---------- */

type Tier = {
  id: Plan;
  name: string;
  tagline: string;
  highlight?: "popular" | "best-value";
  badge?: string;
  perLabel: string;
  cta: string;
  ctaClass: string;       // upg-cta-* class hook
  priceClass: string;     // upg-price-* class hook
  ringClass: string;      // upg-popular-ring / upg-value-ring
  bannerClass?: string;
  bannerLabel?: string;
  features: { label: string; included: boolean; chip?: string }[];
  quota: { headline: string; sub: string };
};

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Basic",
    tagline: "For first-time F-1 applicants exploring the process",
    perLabel: "forever",
    cta: "Current plan",
    ctaClass: "bg-[var(--color-paper-deep)] text-[var(--color-ink)] border border-[var(--color-border)] cursor-default",
    priceClass: "text-[var(--color-ink)]",
    ringClass: "",
    quota: { headline: "3 AI questions / day", sub: "1 voice mock per week · Phase 1 (7 of 47 steps)" },
    features: [
      { label: "First 7 steps unlocked", included: true },
      { label: "DS-160 walkthrough", included: true },
      { label: "Voice mock · 1 / week", included: true },
      { label: "All 47 steps", included: false },
      { label: "Unlimited AI Q&A", included: false },
      { label: "Interview Day PDF", included: false },
    ],
  },
  {
    id: "solo",
    name: "Solo",
    tagline: "For applicants going the full distance — every phase, every step",
    highlight: "popular",
    bannerLabel: "Most popular",
    bannerClass: "upg-popular-banner",
    ringClass: "upg-popular-ring",
    badge: "21% OFF",
    perLabel: "one-time · lifetime",
    cta: "Get Solo",
    ctaClass: "upg-cta-solo",
    priceClass: "upg-price-solo",
    quota: { headline: "Unlimited AI", sub: "Unlimited voice mocks · all 47 steps · every phase" },
    features: [
      { label: "All 47 steps · every phase", included: true },
      { label: "Unlimited AI Q&A", included: true },
      { label: "Voice mock · unlimited", included: true, chip: "GROQ-SCORED" },
      { label: "Document vault · 2 GB", included: true },
      { label: "Auto Interview Day PDF", included: true },
      { label: "Email + WhatsApp reminders", included: true },
    ],
  },
  {
    id: "family",
    name: "Family",
    tagline: "For households with siblings or cohorts applying together",
    highlight: "best-value",
    bannerLabel: "Best value",
    bannerClass: "upg-value-banner",
    ringClass: "upg-value-ring",
    badge: `${DISCOUNT_PCT}% OFF`,
    perLabel: "one-time · 3 students",
    cta: "Get Family",
    ctaClass: "upg-cta-family",
    priceClass: "upg-price-fam",
    quota: { headline: "3 seats · shared vault", sub: "Unlimited AI pooled · parent dashboard included" },
    features: [
      { label: "Up to 3 student seats", included: true },
      { label: "Shared document vault · 6 GB", included: true },
      { label: "Parent dashboard · live progress", included: true },
      { label: "Switch seats anytime", included: true },
      { label: "Everything in Solo · per seat", included: true },
      { label: "Lowest cost per seat", included: true, chip: "70% CHEAPER" },
    ],
  },
];

/* ---------- Helpers ---------- */

function formatN(n: number, currency: Currency) {
  return currency === "INR" ? n.toLocaleString("en-IN") : n.toLocaleString("en-US");
}
function Sym(c: Currency) { return c === "INR" ? "₹" : "$"; }

function priceFor(id: Plan, currency: Currency): { full: number; sale?: number } {
  if (id === "free") return { full: 0 };
  if (id === "solo") {
    const p = PRICES.solo[currency];
    return {
      full: parseInt(p.amount.replace(/,/g, ""), 10),
      sale: currency === "USD" ? 15 : 1199,
    };
  }
  // family
  const p = PRICES.family[currency];
  return {
    full: parseInt(p.amount.replace(/,/g, ""), 10),
    sale: currency === "USD" ? 20 : 1749,
  };
}

/* ---------- Banner ---------- */

function DiscountBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl mt-6 border border-[var(--color-border)]">
      {/* Light gradient: forest */}
      <div
        aria-hidden
        className="upg-banner-light absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, var(--color-accent-tint) 0%, transparent 55%), linear-gradient(135deg, var(--color-ink) 0%, var(--color-ink-soft) 55%, var(--color-ink-deep) 100%)",
        }}
      />
      {/* Dark gradient: pink */}
      <div
        aria-hidden
        className="upg-banner-dark absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(236,72,153,0.22) 0%, transparent 55%), linear-gradient(135deg, #ec4899, #be185d)",
        }}
      />

      {/* corner glow */}
      <div
        aria-hidden
        className="absolute -right-10 -top-10 h-72 w-72 rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4), transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* serpent motif */}
      <svg
        aria-hidden
        viewBox="0 0 400 400"
        className="absolute right-2 top-2 h-44 w-44 sm:h-60 sm:w-60 opacity-25 text-white"
      >
        <path
          d="M120 80c40 0 60 40 60 80s-30 60-60 60-60 20-60 60 30 80 60 80 60-20 60-60-30-60-60-60-60-30-60-60 30-100 60-100z"
          fill="none"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative px-6 sm:px-10 py-8 sm:py-12 text-white">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink)] dark:text-pink-700 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.25)]">
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
            <path d="M21 5l-2-2H10.4a2 2 0 0 0-1.4.6L3 9.6a2 2 0 0 0 0 2.8L11.6 21a2 2 0 0 0 2.8 0L21 14.4a2 2 0 0 0 0-2.8L21 5z" />
          </svg>
          Special {DISCOUNT_PCT}% OFF
        </span>
        <h2 className="mt-4 font-display text-[28px] sm:text-[40px] leading-[1.04] tracking-tight">
          Unlimited AI mocks &amp; advisor review.
          <br />
          <span className="text-white/85">All 47 steps · 30% off this week.</span>
        </h2>
        <p className="mt-3 max-w-xl text-sm sm:text-base text-white/80 leading-relaxed">
          Get every paid-tier feature for the next 7 days at our biggest
          discount of the year. Refund within 14 days, no questions asked.
        </p>
      </div>
    </section>
  );
}

/* ---------- Promo pill (replaces the old Monthly/Lifetime toggle) ---------- */

function PromoPill() {
  return (
    <div
      className="inline-flex items-center gap-2.5 rounded-full pl-4 pr-1.5 py-1.5"
      style={{
        background: "#14211c",
        boxShadow: "0 4px 14px -4px rgba(20,33,28,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <span
        className="text-[13px] font-semibold"
        style={{ color: "var(--surface)", letterSpacing: "-0.005em" }}
      >
        One-time payment · lifetime access
      </span>
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold"
        style={{ background: "#229ed9", color: "#ffffff" }}
      >
        {DISCOUNT_PCT}% OFF
      </span>
    </div>
  );
}

/* ---------- Card ---------- */

function TierCard({
  tier,
  currency,
  isCurrent,
}: {
  tier: Tier;
  currency: Currency;
  isCurrent: boolean;
}) {
  const p = priceFor(tier.id, currency);
  const liveFull = p.full;
  const liveSale = p.sale;

  return (
    <div
      className={[
        "upg-card relative rounded-2xl border p-6 sm:p-7 flex flex-col gap-5 h-full",
        tier.ringClass,
      ].join(" ")}
    >
      {tier.bannerLabel && tier.bannerClass && (
        <div className={`${tier.bannerClass} absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider whitespace-nowrap`}>
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
            <path d="M12 1l2.6 7.1 7.4.5-5.7 4.7 1.8 7.2L12 16.4l-6.1 4.1 1.8-7.2-5.7-4.7 7.4-.5z" />
          </svg>
          {tier.bannerLabel}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h3 className="upg-ink font-display text-[24px] tracking-tight text-[var(--color-ink)] uppercase">
            {tier.name}
          </h3>
          {tier.badge && (
            <span className="upg-chip-discount inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider">
              {tier.badge}
            </span>
          )}
        </div>
        <p className="upg-ink-soft mt-1.5 text-[12.5px] text-[var(--color-ink-soft)] leading-snug min-h-[2.4em]">
          {tier.tagline}
        </p>
      </div>

      {/* Quota tile */}
      <div className="upg-quota rounded-xl border p-4">
        <div className="upg-ink flex items-center gap-2 text-[13px] font-medium text-[var(--color-ink)]">
          <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${tier.priceClass}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 2l2.4 5 5.6.8-4 3.9 1 5.6L12 14.8l-5 2.5 1-5.6-4-3.9 5.6-.8z" />
          </svg>
          <span>{tier.quota.headline}</span>
        </div>
        <p className="upg-muted mt-1.5 text-[12px] text-[var(--color-muted)] leading-relaxed">
          {tier.quota.sub}
        </p>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2 flex-wrap">
        {liveSale != null && (
          <span className="upg-muted font-display text-[24px] leading-none tracking-tight text-[var(--color-muted)] line-through">
            {Sym(currency)}{formatN(liveFull, currency)}
          </span>
        )}
        <span className={`font-display text-[44px] leading-none tracking-tight ${liveSale != null ? tier.priceClass : "upg-ink text-[var(--color-ink)]"}`}>
          {Sym(currency)}{formatN(liveSale ?? liveFull, currency)}
        </span>
        <span className="upg-muted text-[12px] text-[var(--color-muted)]">
          {tier.perLabel}
        </span>
      </div>

      {/* CTA */}
      <div>
        {tier.id === "free" || isCurrent ? (
          <button
            type="button"
            disabled
            className={`w-full inline-flex items-center justify-center rounded-xl px-5 py-3 text-[13px] font-medium ${tier.ctaClass}`}
          >
            {isCurrent ? "Current plan" : tier.cta}
          </button>
        ) : (
          <Link href={`/dashboard/upgrade?plan=${tier.id}`} className="block">
            <button
              type="button"
              className={`w-full inline-flex items-center justify-center rounded-xl px-5 py-3 text-[13px] font-medium transition-colors ${tier.ctaClass}`}
            >
              {tier.cta}
            </button>
          </Link>
        )}
        <p className="upg-muted mt-2 text-center text-[11px] text-[var(--color-muted)]">
          {tier.id === "free"
            ? "No difference compared to paid"
            : liveSale != null
            ? `Save ${Sym(currency)}${formatN(liveFull - liveSale, currency)} vs full price`
            : ""}
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-2.5 border-t border-[var(--color-border-soft)] dark:border-white/[0.06] pt-5 flex-1">
        {tier.features.map((f, i) => (
          <li
            key={i}
            className={[
              "flex items-start gap-2.5 text-[13px]",
              f.included ? "upg-ink text-[var(--color-ink)]" : "upg-muted text-[var(--color-muted)] line-through",
            ].join(" ")}
          >
            {f.included ? (
              <svg viewBox="0 0 24 24" className="upg-check mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-ink)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12l5 5 9-11" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            )}
            <span className="flex-1 leading-snug">
              {f.label}
              {f.chip && (
                <span className="ml-1.5 inline-flex items-center rounded-md bg-[var(--color-accent-tint)] dark:bg-white/[0.07] px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-[var(--color-accent-deep)] dark:text-white/70">
                  {f.chip}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Page ---------- */

export function UpgradeClient({ currentPlan, earlyBirdRemaining }: Props) {
  const { currency, toggle } = usePricing();

  return (
    <div className="upgrade-page mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
        <Link href="/dashboard" className="hover:text-[var(--color-ink)] transition-colors">Dashboard</Link>
        <span aria-hidden>→</span>
        <span className="text-[var(--color-ink-soft)]">Upgrade</span>
      </nav>

      <DiscountBanner />

      {/* Promo pill + currency */}
      <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
        <PromoPill />
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors"
          style={{
            background: "#14211c",
            color: "var(--surface)",
            boxShadow: "0 4px 14px -4px rgba(20,33,28,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <span className="font-mono" style={{ color: "var(--surface)" }}>{currency}</span>
          <span style={{ color: "rgba(250,246,237,0.5)" }}>·</span>
          <span style={{ color: "var(--surface)" }}>switch to {currency === "USD" ? "INR" : "USD"}</span>
        </button>
      </div>

      {/* 3-card grid */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        {TIERS.map((t) => (
          <TierCard
            key={t.id}
            tier={t}
            currency={currency}
            isCurrent={t.id === currentPlan}
          />
        ))}
      </section>

      {/* Trust strip */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "14-day refund", body: "Don't like it? Email us within 14 days for a full refund." },
          { label: `${earlyBirdRemaining} early-bird spots left`, body: "First 100 Solo buyers lock $9 / ₹799 pricing forever." },
          { label: "Receipt + email support", body: "Resend-powered receipts. Reply-to-founder support on every plan." },
        ].map((row) => (
          <div key={row.label} className="upg-card rounded-2xl border p-4 sm:p-5">
            <span className="upg-ink text-[12px] font-medium text-[var(--color-ink)]">{row.label}</span>
            <p className="upg-ink-soft mt-1.5 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">{row.body}</p>
          </div>
        ))}
      </section>

      <p className="upg-muted mt-8 mb-2 text-center text-[11px] text-[var(--color-muted)]">
        Prices in {currency === "USD" ? "US dollars" : "Indian rupees"}. Checkout wires up in Phase 3 — email{" "}
        <a href="mailto:parneet@getstamped.app" className="text-[var(--color-accent-deep)] dark:text-blue-400 hover:text-[var(--color-accent)] transition-colors">
          parneet@getstamped.app
        </a>{" "}
        for early-bird interest.
      </p>
    </div>
  );
}
