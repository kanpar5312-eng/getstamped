import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your visa is stamped — GetStamped",
};

export default function CelebrationPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-5">
      <div className="mx-auto max-w-2xl py-32 text-center">
        <div
          aria-hidden
          className="mx-auto h-0.5 w-10 bg-[var(--color-forest)]"
        />
        <h1 className="mt-8 animate-hero-rise font-display text-5xl sm:text-6xl tracking-tight text-[var(--color-ink)] leading-tight">
          Your visa is stamped.
        </h1>
        <p className="mt-6 mx-auto max-w-md text-base sm:text-lg leading-relaxed text-[var(--color-ink-soft)]">
          You did the hard part. Now we help with the next chapter — your move
          to the United States.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard/timeline?phase=5">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-6 py-3 text-sm font-medium text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)] transition-colors"
            >
              Continue to pre-departure prep →
            </button>
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-6 py-3 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors"
          >
            Share your story
          </button>
        </div>
        <p className="mt-12 text-xs text-[var(--color-muted)] leading-relaxed">
          Phase 5 covers SEVIS validation, pre-departure prep, and your first
          week in the US.
        </p>
      </div>
    </main>
  );
}
