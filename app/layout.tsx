import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { inter, instrumentSerif } from "@/lib/fonts";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { PricingProvider } from "@/lib/PricingContext";
import { CountryProvider } from "@/lib/countryContext";
import { Suspense } from "react";
import { CookieBanner } from "@/components/ui/CookieBanner";
import { Analytics } from "@/components/ui/Analytics";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import { IntroGate } from "@/components/intro/IntroGate";
import type { Currency } from "@/lib/pricing";

export const metadata: Metadata = {
  metadataBase: new URL("https://getstamped.app"),
  title: "GetStamped — F-1 visa preparation, end to end",
  description:
    "The 47-step F-1 visa process, organized into a single guided experience. Built for international students applying to US universities.",
  openGraph: {
    title: "GetStamped",
    description:
      "The F-1 visa has forty-seven steps. We made sure you don’t miss one.",
    url: "https://getstamped.app",
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
  const initialCurrency: Currency = storedCurrency === "INR" ? "INR" : "USD";

  return (
    <html
      lang="en"
      className={[
        inter.variable,
        instrumentSerif.variable,
        GeistSans.variable,
        GeistMono.variable,
        "h-full",
      ].join(" ")}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] overflow-x-hidden">
        <PricingProvider initial={initialCurrency}>
          <CountryProvider>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            <IntroGate />
            <div className="page-fade">
              {children}
            </div>
            <CookieBanner />
            <Analytics domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? null} />
          </CountryProvider>
        </PricingProvider>
      </body>
    </html>
  );
}
