import { BrandedLoadingSpinner } from "@/components/BrandedLoadingSpinner";

/* Root fallback for every route segment that doesn't define its own
   loading.tsx (e.g. /dashboard/* overrides this with a tailored
   skeleton — see app/dashboard/loading.tsx). Covers the marketing
   site, sign-in/sign-up, onboarding, and everything else. */
export default function RootLoading() {
  return <BrandedLoadingSpinner />;
}
