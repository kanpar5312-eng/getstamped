/**
 * Pricing definitions for GetStamped.
 *
 * Two currencies: INR for India, USD everywhere else.
 * Three plans: Free / Solo / Family.
 * Early-bird overlay reduces Solo price for the first 100 paid users.
 *
 * Discount strike-through: each paid plan keeps an `originalAmount` so the UI
 * can render a "was X, now Y" with the discount % computed live.
 */

export type Currency = "INR" | "USD" | "GBP" | "CAD" | "AUD" | "EUR";

/** Map a destination country code to its launch currency for Pricing. */
export function currencyForCountry(code: string | null | undefined): Currency {
  switch (code) {
    case "UK": return "GBP";
    case "CA": return "CAD";
    case "AU": return "AUD";
    case "DE": return "EUR";
    case "US":
    default:   return "USD";
  }
}

export type PriceDisplay = {
  amount: string; // formatted current price, e.g. "1,499"
  /** Pre-discount sticker price; render struck-through when present. */
  originalAmount?: string;
  /** Whole-number discount percent, e.g. 30 (30% off). */
  discountPct?: number;
  symbol: string; // "₹" or "$"
  per?: string;
};

export const PRICES: Record<
  "free" | "solo" | "family" | "earlyBird",
  Record<Currency, PriceDisplay>
> = {
  // TODO(verify-before-launch: 2026-06-17): GBP / CAD / AUD / EUR price points
  // are stub conversions from the USD anchor. Replace with researched local
  // anchors (purchasing power + competitor scan) before non-US launch.
  free: {
    INR: { amount: "0", symbol: "₹" },
    USD: { amount: "0", symbol: "$" },
    GBP: { amount: "0", symbol: "£" },
    CAD: { amount: "0", symbol: "C$" },
    AUD: { amount: "0", symbol: "A$" },
    EUR: { amount: "0", symbol: "€" },
  },
  solo: {
    INR: {
      amount: "1,499",
      originalAmount: "2,142",
      discountPct: 30,
      symbol: "₹",
      per: "one-time · lifetime",
    },
    USD: {
      amount: "39",
      originalAmount: "56",
      discountPct: 30,
      symbol: "$",
      per: "one-time · lifetime",
    },
    // TODO(verify-before-launch: 2026-06-17): set local-anchor Solo price.
    GBP: { amount: "32",  originalAmount: "44",  discountPct: 27, symbol: "£",  per: "one-time · lifetime" },
    CAD: { amount: "52",  originalAmount: "74",  discountPct: 30, symbol: "C$", per: "one-time · lifetime" },
    AUD: { amount: "58",  originalAmount: "82",  discountPct: 29, symbol: "A$", per: "one-time · lifetime" },
    EUR: { amount: "36",  originalAmount: "52",  discountPct: 30, symbol: "€",  per: "one-time · lifetime" },
  },
  family: {
    INR: {
      amount: "2,499",
      originalAmount: "4,998",
      discountPct: 50,
      symbol: "₹",
      per: "one-time · 3 students",
    },
    USD: {
      amount: "69",
      originalAmount: "138",
      discountPct: 50,
      symbol: "$",
      per: "one-time · 3 students",
    },
    // TODO(verify-before-launch: 2026-06-17): set local-anchor Family price.
    GBP: { amount: "58",  originalAmount: "112", discountPct: 48, symbol: "£",  per: "one-time · 3 students" },
    CAD: { amount: "92",  originalAmount: "182", discountPct: 49, symbol: "C$", per: "one-time · 3 students" },
    AUD: { amount: "98",  originalAmount: "198", discountPct: 50, symbol: "A$", per: "one-time · 3 students" },
    EUR: { amount: "64",  originalAmount: "128", discountPct: 50, symbol: "€",  per: "one-time · 3 students" },
  },
  earlyBird: {
    INR: { amount: "799", symbol: "₹" },
    USD: { amount: "19",  symbol: "$" },
    GBP: { amount: "16",  symbol: "£" },
    CAD: { amount: "26",  symbol: "C$" },
    AUD: { amount: "28",  symbol: "A$" },
    EUR: { amount: "17",  symbol: "€" },
  },
};

export function formatPrice(p: PriceDisplay): string {
  return `${p.symbol}${p.amount}`;
}

export function formatOriginalPrice(p: PriceDisplay): string | null {
  if (!p.originalAmount) return null;
  return `${p.symbol}${p.originalAmount}`;
}
