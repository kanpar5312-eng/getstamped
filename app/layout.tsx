import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { instrumentSerif } from "@/lib/fonts";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { PricingProvider } from "@/lib/PricingContext";
import { CountryProvider } from "@/lib/countryContext";
import { Suspense } from "react";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { Analytics } from "@/components/ui/Analytics";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkToast } from "@/components/NetworkToast";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Currency } from "@/lib/pricing";

export const metadata: Metadata = {
  // Site lives on the Vercel preview domain until the custom apex
  // (getstamped.app) is wired up. Update both this base AND openGraph.url
  // when DNS lands so social cards stop pointing to the Vercel host.
  metadataBase: new URL("https://getstampedonline.vercel.app"),
  title: "GetStamped — F-1 visa preparation, end to end",
  description:
    "The 47-step F-1 visa process, organized into a single guided experience. Built for international students applying to US universities.",
  openGraph: {
    title: "GetStamped",
    description:
      "The F-1 visa has forty-seven steps. We made sure you don’t miss one.",
    url: "https://getstampedonline.vercel.app",
    siteName: "GetStamped",
    // Image auto-discovered from app/opengraph-image.tsx
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GetStamped",
    description:
      "The F-1 visa has forty-seven steps. We made sure you don’t miss one.",
    // Image auto-discovered from app/opengraph-image.tsx (Next reuses it for Twitter)
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const c = await cookies();
  const storedCurrency = c.get("gs_currency")?.value;
  // Default to INR; only flip to USD if the user has explicitly toggled
  // (which sets the cookie). INR is now the default state on first load.
  const initialCurrency: Currency = storedCurrency === "USD" ? "USD" : "INR";

  return (
    <html
      lang="en"
      className={[
        instrumentSerif.variable,
        GeistSans.variable,
        GeistMono.variable,
        "h-full",
      ].join(" ")}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] overflow-x-hidden">
        <PricingProvider initial={initialCurrency}>
          <CountryProvider>
            <SmoothScroll />
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            <ErrorBoundary>
              <div className="page-fade">
                {children}
              </div>
            </ErrorBoundary>
            <CookieBanner />
            <NetworkToast />
            <Analytics domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? null} />
            <SpeedInsights />
          </CountryProvider>
        </PricingProvider>
      </body>
    </html>
  );
}
