"use client";

// global-error replaces the ENTIRE root layout when it's active, so it
// can't rely on app/layout.tsx for anything — global styles, fonts, the
// <html>/<body> tags themselves all have to be re-declared here. This
// only fires for errors thrown in the root layout itself (everywhere
// else, app/error.tsx + components/ErrorBoundary.tsx already catch it).
import "./globals.css";
import { instrumentSerif } from "@/lib/fonts";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ErrorFallback } from "@/components/ErrorBoundary";

// This Next.js version (16.2+, see node_modules/next/dist/docs/.../
// error.md) renamed the recovery callback from `reset` to
// `unstable_retry`.
export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html
      lang="en"
      className={[instrumentSerif.variable, GeistSans.variable, GeistMono.variable, "h-full"].join(" ")}
    >
      <body className="min-h-full bg-[var(--color-paper)] text-[var(--color-ink)]">
        <ErrorFallback onRetry={unstable_retry} />
      </body>
    </html>
  );
}
