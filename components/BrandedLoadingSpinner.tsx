/* ════════════════════════════════════════════════════════════════════════
   BrandedLoadingSpinner — the site's loading state for anything routed
   through a loading.tsx boundary (App Router shows these on both hard
   navigation via streaming SSR and client-side <Link> transitions).

   Deliberately invisible for the first ~2s (see the CSS animation-delay
   below): most navigations resolve well under that, and a spinner that
   flashes for 100ms reads as jank, not polish. Only a genuinely slow
   segment — a cold Groq call, a heavy data fetch — holds the fallback up
   long enough for this to ever become visible.
   ════════════════════════════════════════════════════════════════════════ */

export function BrandedLoadingSpinner({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <div
      className={fullScreen ? "fixed inset-0 z-[70] flex items-center justify-center" : "flex items-center justify-center py-16"}
      style={{ background: fullScreen ? "var(--color-cream)" : "transparent" }}
      role="status"
      aria-label="Loading"
    >
      <div className="gs-loading-mark">
        <svg
          viewBox="0 0 120 100"
          width="56"
          height="56"
          fill="none"
          stroke="var(--color-persimmon)"
          strokeWidth="9"
          strokeLinecap="square"
          strokeLinejoin="miter"
          aria-hidden="true"
        >
          <path pathLength="1" className="gs-loading-stroke gs-loading-stroke-1" d="M 8 90 L 38 90 M 23 90 L 23 55" />
          <path pathLength="1" className="gs-loading-stroke gs-loading-stroke-2" d="M 23 55 Q 23 27 50 27 Q 77 27 77 55" />
          <path pathLength="1" className="gs-loading-stroke gs-loading-stroke-3" d="M 77 55 L 77 90 M 62 90 L 92 90" />
          <path pathLength="1" className="gs-loading-stroke gs-loading-stroke-4" d="M 23 90 L 105 22" />
          <path pathLength="1" className="gs-loading-stroke gs-loading-stroke-5" d="M 82 14 L 110 14 L 110 42" />
        </svg>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
