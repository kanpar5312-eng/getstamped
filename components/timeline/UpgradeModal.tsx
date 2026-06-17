"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { PRICES, formatPrice } from "@/lib/pricing";
import { usePricing } from "@/lib/PricingContext";

type Props = {
  open: boolean;
  onClose: () => void;
  fromStep?: number;
};

export function UpgradeModal({ open, onClose, fromStep }: Props) {
  const { currency } = usePricing();
  const solo = PRICES.solo[currency];

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Unlock all steps"
      title="Get the full process"
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors"
          >
            Maybe later
          </button>
          <Link href="/dashboard/upgrade" onClick={onClose}>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-persimmon)] px-5 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors"
            >
              Upgrade now →
            </button>
          </Link>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
        All 47 steps. Voice mock interview. AI Q&amp;A. Document organizer.
        Parent view. {formatPrice(solo)} lifetime.
      </p>

      <div className="mt-6 text-center">
        <div className="font-display text-4xl tracking-tight text-[var(--color-ink)] tabular-nums leading-none">
          {formatPrice(solo)}
        </div>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          One-time. Lifetime access until visa stamped.
        </p>
      </div>

      {fromStep && (
        <p className="mt-5 text-xs text-[var(--color-muted)] text-center">
          You tapped step {fromStep}. It&rsquo;s ready when you upgrade.
        </p>
      )}
    </Modal>
  );
}
