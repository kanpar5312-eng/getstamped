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
import type { Currency } from "@/lib/pricing";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  // SITE_URL (lib/seo.ts) is the one source of truth for the site's own
  // domain — robots.ts, sitemap.ts, and every JSON-LD builder all read
  // the same constant now. Previously this file and lib/seo.ts shared a
  // fallback (getstampedonline.vercel.app) while robots.ts/sitemap.ts
  // fell back to a DIFFERENT domain (getstamped.app) — since
  // NEXT_PUBLIC_SITE_ORIGIN wasn't actually set in prod, canonical/OG
  // urls pointed at one domain while sitemap.xml listed a different one,
  // a self-contradicting signal to search/AI crawlers. Once DNS for the
  // custom apex lands, set NEXT_PUBLIC_SITE_ORIGIN and every file updates
  // together — no more hunting down scattered hardcoded domains.
  metadataBase: new URL(SITE_URL),
  title: "GetStamped — F-1 visa preparation, end to end",
  description:
    "The 47-step F-1 visa process, organized into a single guided experience. Built for international students applying to US universities.",
  openGraph: {
    title: "GetStamped",
    description:
      "The F-1 visa has forty-seven steps. We made sure you don’t miss one.",
    url: SITE_URL,
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
      suppressHydrationWarning
      className={[
        instrumentSerif.variable,
        GeistSans.variable,
        GeistMono.variable,
        "h-full",
      ].join(" ")}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] overflow-x-hidden">
        {/* Anti-flash: applies the stored dashboard theme class before
            paint. Only ever adds/removes `dark` on <html> — inert outside
            [data-surface="dashboard"] (see app/globals.css), so it can't
            affect landing/marketing/auth pages. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('gs-theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}",
          }}
        />
        <PricingProvider initial={initialCurrency}>
          <CountryProvider>
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
          </CountryProvider>
        </PricingProvider>
      </body>
    </html>
  );
}
