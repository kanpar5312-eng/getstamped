"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/ErrorBoundary";

/* App Router's route-segment error boundary — catches errors that
   happen during a Server Component's render or in any child that
   components/ErrorBoundary.tsx (a client-only render-time boundary)
   doesn't wrap. Without this file, an uncaught error anywhere in the
   tree fell through to Next's default unstyled error screen instead of
   the site's own "this page hit a snag" panel.

   This Next.js version (16.2+, see node_modules/next/dist/docs/.../
   error.md) renamed the recovery callback from `reset` to
   `unstable_retry` — same idea (re-fetch + re-render the segment in
   place), `reset` still works but the docs now steer toward the new
   name. */
export default function RouteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[app/error.tsx]", error);
  }, [error]);

  return <ErrorFallback onRetry={unstable_retry} />;
}
