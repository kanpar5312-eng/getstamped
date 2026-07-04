import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Header } from "@/components/landing/v3/Header";
import { Pricing } from "@/components/landing/v3/Pricing";
import { Styles } from "@/components/landing/v3/Styles";
import { Footer } from "@/components/landing/Footer";
import type { Currency } from "@/lib/pricing";
import { JsonLd } from "@/components/seo/JsonLd";
import { pricingProductsJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "F-1 Visa Prep Pricing — Free Phase 1, One-Time Payment | GetStamped",
  description:
    "GetStamped F-1 visa prep pricing: Phase 1 is free forever. Solo plan ($39 / ₹2,999 one-time) unlocks all 47 steps, unlimited AI document checks, and voice mock interviews. No subscription.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "F-1 Visa Prep Pricing | GetStamped",
    description:
      "Phase 1 free forever. One one-time payment unlocks every F-1 visa step through visa stamping — no subscription, no upsells.",
    url: "/pricing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "F-1 Visa Prep Pricing | GetStamped",
    description:
      "Phase 1 free forever. One one-time payment unlocks every F-1 visa step through visa stamping.",
  },
};

export default async function PricingPage() {
  const c = await cookies();
  const stored = c.get("gs_currency")?.value;
  const currency: Currency = stored === "USD" ? "USD" : "INR";

  return (
    <div className="v3-root">
      <JsonLd data={pricingProductsJsonLd()} />
      <Header />
      <main>
        <Pricing currency={currency} />
      </main>
      <Footer />
      <Styles />
    </div>
  );
}
