import Link from "next/link";
import { WaitlistForm } from "@/components/ui/WaitlistForm";

export function FinalCTA() {
  return (
    <section
      id="waitlist"
      className="w-full bg-[var(--color-forest)] text-[var(--color-cream-soft)] py-24 lg:py-32 relative overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
      >
        <div className="absolute -inset-[20%] mesh-layer-2 animate-mesh-medium" />
      </div>

      <div className="relative mx-auto max-w-2xl px-5 sm:px-6 lg:px-10 text-center">
        <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-cream-soft)]/70">
          Ready?
        </span>
        <h2 className="mt-5 font-display text-4xl sm:text-5xl tracking-tight leading-tight">
          Forty-seven steps. One tool. Start free.
        </h2>
        <p className="mt-6 text-base sm:text-lg text-[var(--color-cream-soft)]/80 leading-relaxed">
          No card required. Phase 1 unlocked forever. Upgrade when you hit
          Phase 2.
        </p>

        <div className="mt-8 flex justify-center">
          <Link href="/dashboard">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-cream-soft)] px-8 py-4 text-base font-medium text-[var(--color-forest)] hover:bg-[var(--color-cream)] transition-colors"
            >
              Start free — no card
            </button>
          </Link>
        </div>

        <p className="mt-8 text-xs text-[var(--color-cream-soft)]/60">
          Or join the waitlist with your email — we&rsquo;ll let you know about
          new features.
        </p>
        <div className="mt-4 flex justify-center">
          <WaitlistForm variant="dark" source="final-cta" />
        </div>
      </div>
    </section>
  );
}
