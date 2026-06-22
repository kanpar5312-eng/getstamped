/* ════════════════════════════════════════════════════════════════════════
   LoadingSkeleton — shown while a dashboard page resolves. Mirrors the
   dashboard's two-column shape so the layout shift on hydration is
   minimal: a top strip, a 240px left rail, and the main content well.

   Pure server component (no "use client") — Tailwind's animate-pulse
   handles the breathing without JS.
   ═════════════════════════════════════════════════════════════════════════ */

export function LoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1140px] px-5 sm:px-6 py-8 sm:py-10 lg:py-12">
      {/* Top bar */}
      <div
        aria-hidden
        className="w-full h-12 rounded-lg bg-[rgba(28,25,23,0.06)] animate-pulse"
      />

      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="hidden lg:flex w-[240px] flex-shrink-0 flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              aria-hidden
              className="h-9 rounded-md bg-[rgba(28,25,23,0.06)] animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>

        {/* Main column */}
        <div className="flex-1 min-w-0">
          <div
            aria-hidden
            className="w-full h-[120px] rounded-xl bg-[rgba(28,25,23,0.06)] animate-pulse"
          />
          <div className="mt-4 flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                aria-hidden
                className="h-[60px] rounded-lg bg-[rgba(28,25,23,0.04)] animate-pulse"
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
