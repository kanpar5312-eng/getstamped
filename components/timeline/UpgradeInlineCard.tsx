"use client";

import Link from "next/link";
import { PRICES, formatPrice } from "@/lib/pricing";
import { usePricing } from "@/lib/PricingContext";

export function UpgradeInlineCard() {
  const { currency } = usePricing();
  const solo = PRICES.solo[currency];

  return (
    <section className="my-8 rounded-2xl border border-[var(--color-ink)] bg-[var(--color-persimmon)] text-[var(--color-paper-soft)] p-6 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md">
          <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-accent-soft)]">
            Phase 2 and beyond
          </p>
          <h3 className="mt-2 font-display text-xl sm:text-2xl tracking-tight leading-snug">
            You&rsquo;re past the easy part.
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-paper-soft)]/80">
            The next 41 steps are where consultants charge $300–$1,200. Get
            them all for {formatPrice(solo)} lifetime.
          </p>
        </div>
        <Link href="/dashboard/upgrade" className="shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-paper-soft)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-deep)] transition-colors"
          >
            Unlock all steps
          </button>
        </Link>
      </div>
    </section>
  );
}
