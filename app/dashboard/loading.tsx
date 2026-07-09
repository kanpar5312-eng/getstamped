// Next 16's segment-level loading.tsx — picked up automatically while a
// dashboard route's data fetches resolve. app/loading.tsx (the root
// boundary, used for marketing/auth/onboarding) never applies here:
// this file is more specific to the /dashboard subtree, so it's the
// ONLY loading UI dashboard routes ever get — the branded spinner
// wasn't layered in here before, so the site's main surface never
// showed it at all, no matter how slow a page was.
//
// Skeleton renders instantly (no delay, matches the page shape so
// hydration doesn't jump) for the common fast case. BrandedLoadingSpinner
// stays invisible for its first 1s (see globals.css .gs-loading-mark)
// and then covers the screen with the branded mark — a page that's
// still loading past 1s gets the same, unmistakable brand signal every
// other route in the app gets.
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { BrandedLoadingSpinner } from "@/components/BrandedLoadingSpinner";

export default function DashboardLoading() {
  return (
    <>
      <LoadingSkeleton />
      <BrandedLoadingSpinner />
    </>
  );
}
