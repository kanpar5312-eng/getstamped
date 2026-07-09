/* ════════════════════════════════════════════════════════════════════════
   BrandedLoadingSpinner — the site's loading state for anything routed
   through a loading.tsx boundary (App Router shows these on both hard
   navigation via streaming SSR and client-side <Link> transitions).

   Deliberately invisible for the first 1s (see the CSS animation-delay
   below): most navigations resolve well under that, and a spinner that
   flashes for 100ms reads as jank, not polish. Only a genuinely slow
   segment — a cold Groq call, a heavy data fetch — holds the fallback up
   long enough for this to ever become visible.
   ════════════════════════════════════════════════════════════════════════ */

export function BrandedLoadingSpinner({
  fullScreen = true,
  zIndex = 70,
  /** Skip the 1s reveal delay — used by NavigationProgress, which
   *  already waits 1s itself before mounting this at all, so the CSS
   *  delay would just double up and never show. loading.tsx usages
   *  (which mount immediately on route entry) want the built-in delay. */
  instant = false,
}: {
  fullScreen?: boolean;
  zIndex?: number;
  instant?: boolean;
}) {
  return (
    <div
      className={fullScreen ? "fixed inset-0 flex items-center justify-center" : "flex items-center justify-center py-16"}
      style={{
        background: fullScreen ? "var(--color-cream)" : "transparent",
        zIndex,
      }}
      role="status"
      aria-label="Loading"
    >
      <div className={instant ? "gs-loading-mark gs-loading-mark-instant" : "gs-loading-mark"}>
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
