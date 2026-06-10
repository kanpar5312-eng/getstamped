import { Eyebrow } from "@/components/ui/Eyebrow";

function CustomCheck({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-3 w-3 ${className}`}
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

function ParentMockup() {
  const percent = (32 / 47) * 100;

  return (
    <div className="relative w-full max-w-[520px] mx-auto">
      <div className="relative aspect-[5/6] sm:aspect-[1/1]">
        {/* Back sibling card */}
        <div
          aria-hidden
          className="absolute inset-0 origin-center"
          style={{ transform: "rotate(2deg)", opacity: 0.3 }}
        >
          <div className="h-full w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream-deep)]" />
        </div>

        {/* Foreground mockup card */}
        <div
          className="absolute inset-0 origin-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream-deep)] p-7 sm:p-8 flex flex-col shadow-[0_30px_80px_-30px_rgba(20,33,28,0.25)]"
          style={{ transform: "rotate(-2deg)" }}
        >
          <div>
            <h3 className="font-display text-xl leading-snug text-[var(--color-ink)]">
              Aarav&rsquo;s F-1 Application
            </h3>
            <p className="mt-2 text-xs text-[var(--color-ink-soft)]">
              Currently on Phase 4: Interview Preparation
            </p>
          </div>

          <div className="mt-7">
            <div
              className="h-2 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-cream-soft)] overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={47}
              aria-valuenow={32}
              aria-label="Application progress"
            >
              <div
                className="h-full bg-[var(--color-forest)]"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] font-mono text-[var(--color-ink-soft)] tracking-wide">
              32 of 47 steps complete
            </p>
          </div>

          <ul className="mt-7 space-y-3 text-[13px] text-[var(--color-ink)]">
            <li className="flex items-start gap-3">
              <span className="mt-[3px] text-[var(--color-forest)]">
                <CustomCheck />
              </span>
              <span>Mock interview completed yesterday</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-[3px] text-[var(--color-forest)]">
                <CustomCheck />
              </span>
              <span>Financial documents uploaded 2 days ago</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-[3px] h-3 w-3 shrink-0">
                <span className="block h-3 w-3 rounded-full border border-[var(--color-accent)]" />
              </span>
              <span>
                Currently working on: Interview question practice
              </span>
            </li>
          </ul>

          <div className="mt-auto pt-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--color-muted)]">
            <span>Parent view</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-soft-pulse" />
              Live · read-only
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ForParents() {
  return (
    <section
      id="parents"
      aria-labelledby="parents-heading"
      className="w-full bg-[var(--color-cream)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16 lg:items-center">
          {/* LEFT — visual 55% */}
          <div className="lg:col-span-7 order-1">
            <ParentMockup />
          </div>

          {/* RIGHT — text 45% */}
          <div className="lg:col-span-5 order-2">
            <Eyebrow>For parents</Eyebrow>
            <h2
              id="parents-heading"
              className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-snug text-[var(--color-ink)]"
            >
              Know exactly where they are.
            </h2>

            <p className="mt-7 text-base sm:text-[17px] leading-relaxed text-[var(--color-ink)] max-w-[460px]">
              You&rsquo;re trusting GetStamped with the most important
              application your child will make this year. We built a shared
              progress view so you can see exactly where they are in the
              process — without having to ask twice.
            </p>
            <p className="mt-6 text-base sm:text-[17px] leading-relaxed text-[var(--color-ink)] max-w-[460px]">
              It&rsquo;s read-only. No login required. Just a link your child
              shares once, and you can check in whenever you need to.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <span
                aria-hidden
                className="block h-[2px] w-10 bg-[var(--color-forest)]"
              />
              <span className="text-sm text-[var(--color-ink-soft)]">
                Available with every plan.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
