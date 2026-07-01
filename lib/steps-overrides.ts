/**
 * Country-specific overrides for the 47-step playbook.
 *
 * lib/steps.ts stays universal/default — every field on `Step` keeps its
 * original type and every existing consumer keeps working unchanged. This
 * sidecar table is the ONLY place origin-country-specific text lives.
 * `resolveStepContent()` (lib/resolveStepContent.ts) merges these on top of
 * the base `Step` at render time, for a chosen `HomeCountryCode`.
 *
 * Only "IN" is populated today, using the exact text this app has always
 * shown (moved here verbatim, not rewritten). Do not invent content for
 * the other HomeCountryCode values — they fall back to the universal text
 * in lib/steps.ts until real, verified per-country content is written.
 */

import type { HomeCountryCode } from "@/lib/home-countries";

export type StepOverridePatch = Partial<{
  intro: string;
  outro: string;
  shortDescription: string;
  title: string;
  body: string;
  description: string;
  label: string;
  url: string;
}>;

export type StepOverridePath =
  | { field: "shortDescription" }
  | { field: "instructions.intro" }
  | { field: "instructions.outro" }
  | { field: "instructions.steps"; index: number }
  | { field: "commonMistakes"; index: number }
  | { field: "documents"; index: number }
  | { field: "officialSources"; index: number };

export type StepOverride = {
  stepNumber: number;
  country: HomeCountryCode;
  path: StepOverridePath;
  patch: StepOverridePatch;
};

export const STEP_OVERRIDES: StepOverride[] = [
  // Step 1 — university shortlist
  {
    stepNumber: 1,
    country: "IN",
    path: { field: "instructions.steps", index: 0 },
    patch: {
      body: "Search each school on the official SEVP school finder before you spend a rupee on application fees. If a school isn't SEVP-certified, it cannot issue an I-20, period. Many community colleges and almost all fully-online programs aren't certified — don't assume.",
    },
  },
  {
    stepNumber: 1,
    country: "IN",
    path: { field: "instructions.steps", index: 4 },
    patch: {
      body: "Where you interview depends on your home country, not the school — but knowing the consulate's interview patterns helps you prep. Indian Chennai, Mumbai, and Delhi consulates show different historical approval patterns for STEM applicants. Use that data when comparing fit.",
    },
  },
  {
    stepNumber: 1,
    country: "IN",
    path: { field: "instructions.outro" },
    patch: {
      outro: "Spend a full work-week on this list. The cost of a bad shortlist is months of your life and tens of thousands of rupees in application + test fees.",
    },
  },

  // Step 10 — passport & identity documents
  {
    stepNumber: 10,
    country: "IN",
    path: { field: "instructions.steps", index: 1 },
    patch: {
      body: "Indian passport renewal is 30-45 days normal, 7-10 days tatkal. Other countries vary. If your passport expires within a year, renew now — going to the interview with a fresh passport is far better than carrying both.",
    },
  },
  {
    stepNumber: 10,
    country: "IN",
    path: { field: "instructions.steps", index: 3 },
    patch: {
      body: "Aadhaar, national ID card, or driver's license — bring one as secondary identity proof. Some consulates ask, most don't, but it's a one-minute prep.",
    },
  },
  {
    stepNumber: 10,
    country: "IN",
    path: { field: "instructions.steps", index: 4 },
    patch: {
      body: "2x2 inches, white background, taken within last 6 months, no glasses, no smile, no head covering except religious. Indian/Asian photo studios usually don't know US specs — show them the official spec sheet.",
    },
  },
  {
    stepNumber: 10,
    country: "IN",
    path: { field: "documents", index: 2 },
    patch: {
      description: "Secondary identity proof. Aadhaar card, national ID, or country-issued driver's license. Original or attested copy.",
    },
  },

  // Step 14 — photo specs
  {
    stepNumber: 14,
    country: "IN",
    path: { field: "instructions.intro" },
    patch: {
      intro: "US visa photos are NOT the same as Indian/Asian passport photos. Different aspect ratio, different head-size rules, different background requirements. Most studios get it wrong unless you show them the spec.",
    },
  },
  {
    stepNumber: 14,
    country: "IN",
    path: { field: "commonMistakes", index: 0 },
    patch: {
      title: "Wrong dimensions (Indian passport size instead of US)",
      body: "Indian passport photos are 35x45mm. US visa photos are 51x51mm (2x2 inches). Wrong size = photo rejected at the consulate window OR DS-160 upload failure.",
    },
  },

  // Step 16 — DS-160 personal information
  {
    stepNumber: 16,
    country: "IN",
    path: { field: "instructions.steps", index: 0 },
    patch: {
      body: "Copy from the passport bio page character-by-character. If your passport says 'KUMAR' write 'KUMAR' — not 'Kumar'. If your passport's surname field is empty (common for South Indian names), enter 'FNU' (First Name Unknown) per State Dept guidance.",
    },
  },

  // Step 18 — family & education section
  {
    stepNumber: 18,
    country: "IN",
    path: { field: "instructions.steps", index: 0 },
    patch: {
      body: "Father's full name (matching his passport/Aadhaar), date of birth, country of birth. Same for mother. If a parent is deceased, indicate that — there's a separate option.",
    },
  },

  // Step 23 — create profile on US visa service site
  {
    stepNumber: 23,
    country: "IN",
    path: { field: "shortDescription" },
    patch: {
      shortDescription: "ustraveldocs.com for most countries (India, etc.). Profile lets you pay MRV fee and book the interview slot.",
    },
  },
  {
    stepNumber: 23,
    country: "IN",
    path: { field: "instructions.steps", index: 0 },
    patch: {
      body: "India and many others: ustraveldocs.com. Specific Indian portal: ustraveldocs.com/in. Different countries use different vendors (CGI Federal in some regions). Check the US Embassy's website for your country to confirm the right one.",
      label: "USTravelDocs (India)",
      url: "https://www.ustraveldocs.com/in/",
    },
  },
  {
    stepNumber: 23,
    country: "IN",
    path: { field: "officialSources", index: 0 },
    patch: {
      label: "USTravelDocs (India)",
      url: "https://www.ustraveldocs.com/in/",
    },
  },

  // Step 24 — pay the MRV fee
  {
    stepNumber: 24,
    country: "IN",
    path: { field: "instructions.steps", index: 1 },
    patch: {
      body: "India: NEFT, IMPS, or cash at AXIS Bank/Citi Bank branches. UK: online card. Many others: online card via the service site. The site shows which methods are valid for your country.",
    },
  },
  {
    stepNumber: 24,
    country: "IN",
    path: { field: "instructions.steps", index: 2 },
    patch: {
      body: "On ustraveldocs.com (or equivalent), click 'Pay MRV fee'. The site generates a unique reference number (CGI number in India). Use this exact number for the payment — paying without it = unattributable transfer.",
    },
  },

  // Step 30 — financial ties talking points
  {
    stepNumber: 30,
    country: "IN",
    path: { field: "instructions.steps", index: 3 },
    patch: {
      body: "If asked 'what does your father do?' — 'He runs a textile export business in Mumbai earning approximately INR 40 lakhs annually.' Specific income, specific business. Vague = follow-up.",
    },
  },

  // Step 38 — interview-day outfit
  {
    stepNumber: 38,
    country: "IN",
    path: { field: "instructions.steps", index: 1 },
    patch: {
      title: "Women: blouse or kurti + trousers/skirt/salwar",
      body: "Conservative top + bottoms or traditional Indian formal wear (kurta, salwar). Closed-toe shoes. Avoid: clubwear, exposed midriff, flashy jewelry.",
    },
  },

  // Step 44 — verify visa details
  {
    stepNumber: 44,
    country: "IN",
    path: { field: "instructions.steps", index: 1 },
    patch: {
      body: "Valid-from date is when you can first travel on this visa. Validity period varies — Indian F-1 visas typically valid 5 years. Travel up to the validity-end date.",
    },
  },

  // Step 45 — pre-departure preparations
  {
    stepNumber: 45,
    country: "IN",
    path: { field: "instructions.steps", index: 3 },
    patch: {
      body: "Call your Indian/home bank to flag international travel for your credit/debit cards. Without notification, cards get auto-blocked on first US transaction.",
    },
  },
  {
    stepNumber: 45,
    country: "IN",
    path: { field: "commonMistakes", index: 1 },
    patch: {
      body: "Indian bank sees a Walmart transaction at 2 AM IST, auto-blocks the card thinking it's fraud. Call the bank before travel to whitelist US.",
    },
  },
];

/**
 * Per-step content status, per country. Missing entries default to
 * "universal" at read time (see resolveStepContent). Nothing is invented
 * here for countries beyond IN — this is a scaffold for future research.
 */
export const STEP_CONTENT_STATUS: Record<number, Partial<Record<HomeCountryCode, "verified" | "universal">>> = {
  1: { IN: "verified" },
  10: { IN: "verified" },
  14: { IN: "verified" },
  16: { IN: "verified" },
  18: { IN: "verified" },
  23: { IN: "verified" },
  24: { IN: "verified" },
  30: { IN: "verified" },
  38: { IN: "verified" },
  44: { IN: "verified" },
  45: { IN: "verified" },
};
