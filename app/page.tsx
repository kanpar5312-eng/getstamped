import { cookies } from "next/headers";
import type { Metadata } from "next";
import { MarketingLanding } from "@/components/landing/v3/MarketingLanding";
import { getWaitlistCount } from "@/app/actions/waitlist";
import type { Currency } from "@/lib/pricing";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, softwareApplicationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "F-1 Visa Preparation & Student Visa Interview Prep | GetStamped",
  description:
    "GetStamped guides international students through F-1 visa preparation with a 47-step checklist, AI document checks, and voice-based student visa interview prep. Phase 1 is free forever.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "F-1 Visa Preparation & Student Visa Interview Prep | GetStamped",
    description:
      "The complete F-1 visa process — 47 ordered steps, AI document checks, and voice mock interviews for student visa interview prep. One workspace, until your visa is stamped.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "F-1 Visa Preparation & Student Visa Interview Prep | GetStamped",
    description:
      "The complete F-1 visa process — 47 ordered steps, AI document checks, and voice mock interviews for student visa interview prep.",
  },
};

export default async function Home() {
  const { totalSignups, earlyBirdClaimed } = await getWaitlistCount();

  const c = await cookies();
  const stored = c.get("gs_currency")?.value;
  // Default to INR; only flip to USD if the cookie says so explicitly.
  const currency: Currency = stored === "USD" ? "USD" : "INR";

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={softwareApplicationJsonLd()} />
      <MarketingLanding
        currency={currency}
        totalSignups={totalSignups}
        earlyBirdClaimed={earlyBirdClaimed}
      />
    </>
  );
}
