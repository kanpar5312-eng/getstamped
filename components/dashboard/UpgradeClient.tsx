"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePricing } from "@/lib/PricingContext";
import { PRICES, type Currency } from "@/lib/pricing";
import { applyPromoCode } from "@/app/actions/promo";

type Plan = "free" | "solo" | "family";

type Props = {
  currentPlan: Plan;
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
    perLabel: "one-time · 2 students",
    cta: "Get Family",
    ctaClass: "upg-cta-family",
    priceClass: "upg-price-fam",
    quota: { headline: "2 seats · shared vault", sub: "Unlimited AI pooled · parent dashboard included" },
    features: [
      { label: "Up to 2 student seats", included: true },
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
  // Source of truth = the shared PRICES table in lib/pricing.ts, so the
  // dashboard always matches what's rendered on the landing page. The
  // previous sale-override hardcoded ₹1,199/$15 (Solo) and ₹1,749/$20
  // (Family) — different from the landing — which is what the user kept
  // seeing as a price mismatch.
  if (id === "free") return { full: 0 };
  const p = id === "solo" ? PRICES.solo[currency] : PRICES.family[currency];
  return { full: parseInt(p.amount.replace(/,/g, ""), 10) };
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

/* ---------- Plan status (already-subscribed users) ----------
   Replaces the discount banner + promo pill once someone has actually
   paid — pitching "30% off, buy now" to a Solo/Family subscriber read
   as if the page didn't know they'd already upgraded. */
function PlanStatusBanner({ plan }: { plan: Plan }) {
  const name = plan === "family" ? "Family" : "Solo";
  return (
    <section className="mt-6 rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-tint)] p-6 sm:p-8 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)] px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-white">
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12l5 5 9-11" />
        </svg>
        Active
      </span>
      <h2 className="mt-4 font-display text-2xl sm:text-[32px] tracking-tight text-[var(--color-ink)]">
        You&rsquo;re on {name}.
      </h2>
      <p className="mt-2 max-w-md mx-auto text-sm text-[var(--color-ink-soft)] leading-relaxed">
        {plan === "family"
          ? "Every phase, every step, for up to two students — already unlocked, one-time payment, no renewals."
          : "Every phase, every step is already unlocked — one-time payment, no renewals."}
        {plan === "solo" && " Need a second seat? Family is below."}
      </p>
    </section>
  );
}

/* ---------- Promo pill (replaces the old Monthly/Lifetime toggle) ---------- */

function PromoPill() {
  return (
    <div
      className="inline-flex items-center gap-2.5 rounded-full pl-4 pr-1.5 py-1.5"
      style={{
        background: "var(--color-ink)",
        boxShadow: "0 4px 14px -4px rgba(11,30,63,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <span
        className="text-[13px] font-semibold"
        style={{ color: "var(--color-paper)", letterSpacing: "-0.005em" }}
      >
        One-time payment · lifetime access
      </span>
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold"
        style={{ background: "var(--color-persimmon)", color: "var(--color-paper)" }}
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

export function UpgradeClient({ currentPlan }: Props) {
  const { currency } = usePricing();
  const isSubscribed = currentPlan !== "free";

  return (
    <div className="upgrade-page mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
        <Link href="/dashboard" className="hover:text-[var(--color-ink)] transition-colors">Dashboard</Link>
        <span aria-hidden>→</span>
        <span className="text-[var(--color-ink-soft)]">Upgrade</span>
      </nav>

      {/* Already-paying users don't need the discount pitch aimed at
          prospects — show them a plain confirmation of what they have
          instead of the same "30% off, buy now" banner every time. */}
      {isSubscribed ? (
        <PlanStatusBanner plan={currentPlan} />
      ) : (
        <>
          <DiscountBanner />
          <div className="mt-10 flex items-center justify-center">
            <PromoPill />
          </div>
        </>
      )}

      {/* Promo code (visible only to free users; if they're already on
          a paid plan there's nothing to unlock). */}
      {currentPlan === "free" && (
        <div className="mt-10 flex justify-center">
          <PromoCodeBox />
        </div>
      )}

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

      {/* Trust strip — three reasons the price isn't the whole story.
          Concrete promises, no marketing fluff. */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            label: "14 days to change your mind",
            body: "Try every step, every tool. One email gets you a full refund — no forms, no questions.",
          },
          {
            label: "One payment, lifetime access",
            body: "Pay once and every phase, every step, and every tool stays unlocked until your visa is stamped — no renewals, no recurring charges.",
          },
          {
            label: "A founder reads every email",
            body: "Support replies come from the team, not a bot. Typical weekday turnaround is under 6 hours.",
          },
        ].map((row) => (
          <div key={row.label} className="upg-card rounded-2xl border p-4 sm:p-5">
            <span className="upg-ink text-[12px] font-medium text-[var(--color-ink)]">{row.label}</span>
            <p className="upg-ink-soft mt-1.5 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">{row.body}</p>
          </div>
        ))}
      </section>

      <p className="upg-muted mt-8 mb-2 text-center text-[11px] text-[var(--color-muted)]">
        Prices in {currency === "USD" ? "US dollars" : "Indian rupees"}. Checkout wires up in Phase 3 — email{" "}
        <a href="mailto:getstamped.online@gmail.com" className="text-[var(--color-accent-deep)] dark:text-blue-400 hover:text-[var(--color-accent)] transition-colors">
          getstamped.online@gmail.com
        </a>{" "}
        with any questions.
      </p>
    </div>
  );
}

/* ─────────────────────────── Promo code box ─────────────────────────── */

function PromoCodeBox() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !code.trim()) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    const r = await applyPromoCode(code);
    setBusy(false);
    if (r.ok) {
      // Success → celebratory popup. router.refresh() runs when the
      // popup closes so the upgrade-state UI re-renders behind it.
      setSuccess(r.message);
    } else {
      setError(r.error);
    }
  };

  const closeSuccess = () => {
    setSuccess(null);
    setCode("");
    router.refresh();
  };

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper-soft)] p-4 sm:p-5"
        aria-label="Promo code"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-medium text-[var(--color-ink)]">
            Have a promo code?
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Unlocks paid plan
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter your code"
            autoCapitalize="characters"
            autoComplete="off"
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/70 outline-none focus:border-[var(--color-persimmon)]"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !code.trim()}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-persimmon)] px-4 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50"
          >
            {busy ? "Applying…" : "Apply"}
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-3 text-[12px] text-red-600"
          >
            {error}
          </p>
        )}
      </form>

      <PromoSuccessPopup message={success} onClose={closeSuccess} />
    </>
  );
}

/* Modal popup confirming the code applied. Persimmon checkmark badge,
   the server message in display serif, and a single CTA. Auto-closes
   after 4s in case the user navigates away. */
function PromoSuccessPopup({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  // Auto-dismiss after 4s
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(t);
  }, [message, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!message) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Promo code applied"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(11, 30, 63, 0.42)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        animation: "gs-promo-fade 220ms cubic-bezier(0.22, 1, 0.36, 1) both",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-paper)",
          border: "1px solid var(--color-border)",
          borderRadius: 18,
          padding: "28px 28px 24px",
          maxWidth: 380,
          width: "calc(100% - 32px)",
          textAlign: "center",
          boxShadow:
            "0 24px 60px -16px rgba(11,30,63,0.4), 0 6px 20px -6px rgba(11,30,63,0.2)",
          animation: "gs-promo-pop 280ms cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        {/* Persimmon checkmark badge */}
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 999,
            background: "var(--color-persimmon)",
            color: "var(--color-paper-soft)",
            boxShadow: "0 14px 28px -10px rgba(232,98,42,0.6)",
            animation: "gs-promo-check 480ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both",
          }}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
            <path
              d="M5 12l5 5 9-11"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <p
          style={{
            margin: "18px 0 0",
            fontFamily: "var(--font-display-stack)",
            fontSize: 22,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            color: "var(--color-ink)",
          }}
        >
          Code applied
        </p>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 14,
            lineHeight: 1.55,
            color: "var(--color-ink-soft)",
          }}
        >
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 20,
            padding: "10px 22px",
            borderRadius: 999,
            background: "var(--color-persimmon)",
            color: "var(--color-paper-soft)",
            border: "none",
            fontFamily: "var(--font-sans-stack)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.04em",
            cursor: "pointer",
          }}
        >
          Got it
        </button>
      </div>

      <style>{`
        @keyframes gs-promo-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes gs-promo-pop {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gs-promo-check {
          0%   { opacity: 0; transform: scale(0.4); }
          60%  { opacity: 1; transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
