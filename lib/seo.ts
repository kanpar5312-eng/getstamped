/**
 * Shared JSON-LD (Schema.org) builders for structured data.
 *
 * Kept in one place so every page emits facts that agree with each other —
 * same site name, same URL base, same plan prices as lib/pricing.ts.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://getstampedonline.vercel.app";

// Real, always-live branded image asset (app/opengraph-image.tsx, a
// Next.js file-convention route — served at /opengraph-image, NOT
// /icon.png, which doesn't exist and was a dead link in every piece of
// structured data that referenced it below).
const BRAND_IMAGE = `${SITE_URL}/opengraph-image`;

// Real return policy — mirrors the live copy in Pricing.tsx
// ("14-day refund. No exit interview, no forms.") — required by
// Google's Merchant listing structured data for the Product entries
// below, and true, not invented.
const RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "US",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnFees: "https://schema.org/FreeReturn",
};

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GetStamped",
    url: SITE_URL,
    logo: BRAND_IMAGE,
    description:
      "GetStamped is a guided F-1 student visa preparation platform: a 47-step checklist, AI document checks, and voice-based mock interviews in one workspace.",
    sameAs: ["https://twitter.com", "https://instagram.com"],
    email: "founder@getstamped.app",
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GetStamped",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    image: BRAND_IMAGE,
    description:
      "A guided workspace for the US F-1 student visa process: 47 ordered steps, AI-powered document checks, voice-based mock interviews, and a read-only progress view for parents.",
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
        description: "All 6 Phase 1 steps, 3 AI questions per day, 1 voice mock per week.",
      },
      {
        "@type": "Offer",
        name: "Solo",
        price: "39",
        priceCurrency: "USD",
        description:
          "All 47 F-1 visa steps unlocked, unlimited AI document checks, up to 5 voice mock interviews per week, and parent share view. One-time payment, no subscription.",
      },
      {
        "@type": "Offer",
        name: "Family",
        price: "69",
        priceCurrency: "USD",
        description:
          "Everything in Solo for two students (up to 12 voice mock interviews per week combined, 6 each), combined parent view, and priority email support. One-time payment, no subscription.",
      },
    ],
  };
}

/** Product/Service schema for the three pricing plans, in USD (canonical
 *  anchor currency) — mirrors the live numbers in lib/pricing.ts. */
export function pricingProductsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "Product",
        position: 1,
        name: "GetStamped Free",
        description: "Phase 1 of the F-1 visa checklist, unlocked forever at no cost.",
        image: BRAND_IMAGE,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/pricing`,
        },
      },
      {
        "@type": "Product",
        position: 2,
        name: "GetStamped Solo",
        description:
          "All 47 F-1 visa steps, unlimited AI document checks, and up to 5 voice mock interviews per week. One-time payment, lifetime access.",
        image: BRAND_IMAGE,
        offers: {
          "@type": "Offer",
          price: "39",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/pricing`,
          hasMerchantReturnPolicy: RETURN_POLICY,
        },
      },
      {
        "@type": "Product",
        position: 3,
        name: "GetStamped Family",
        description:
          "Everything in Solo, for two students (up to 12 voice mock interviews per week combined, 6 each), with a combined parent view. One-time payment, lifetime access.",
        image: BRAND_IMAGE,
        offers: {
          "@type": "Offer",
          price: "69",
          priceCurrency: "USD",
          hasMerchantReturnPolicy: RETURN_POLICY,
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/pricing`,
        },
      },
    ],
  };
}

export type FaqEntry = { question: string; answer: string };

export function faqPageJsonLd(faqs: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
