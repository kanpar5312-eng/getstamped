"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readConsent, writeConsent, useConsent } from "@/lib/consent";

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const consent = useConsent();

  useEffect(() => {
    setMounted(true);
    // No-op — readConsent runs via useConsent. This just gates SSR hydration.
    readConsent();
  }, []);

  if (!mounted || consent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-up">
      <div
        role="dialog"
        aria-label="Cookies"
        className="mx-auto max-w-3xl rounded-2xl border border-white/40 bg-[var(--color-cream-soft)]/80 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/30 shadow-[0_40px_100px_-30px_rgba(20,33,28,0.5)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <p className="text-xs sm:text-sm leading-relaxed text-[var(--color-ink)] flex-1">
          We use essential cookies to keep you signed in. Optional cookies help
          us understand which steps people get stuck on. You choose.{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-[var(--color-tg-deep)] transition-colors"
          >
            Privacy
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => writeConsent("essential")}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent px-4 py-2 text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-tg)] hover:text-[var(--color-tg-deep)] transition-colors"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => writeConsent("all")}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-forest)] px-4 py-2 text-xs font-medium text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)] transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
