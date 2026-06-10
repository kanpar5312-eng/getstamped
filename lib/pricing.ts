/**
 * Pricing definitions for GetStamped.
 *
 * Two currencies: INR for India, USD everywhere else.
 * Three plans: Free / Solo / Family.
 * Early-bird overlay reduces Solo price for the first 100 paid users.
 */

export type Currency = "INR" | "USD";

export type PriceDisplay = {
  amount: string; // formatted, e.g. "1,499"
  symbol: string; // "₹" or "$"
  per?: string; // optional descriptor, e.g. "one-time"
};

export const PRICES: Record<
  "free" | "solo" | "family" | "earlyBird",
  Record<Currency, PriceDisplay>
> = {
  free: {
    INR: { amount: "0", symbol: "₹" },
    USD: { amount: "0", symbol: "$" },
  },
  solo: {
    INR: { amount: "1,499", symbol: "₹", per: "one-time · lifetime" },
    USD: { amount: "19", symbol: "$", per: "one-time · lifetime" },
  },
  family: {
    INR: { amount: "2,499", symbol: "₹", per: "one-time · 3 students" },
    USD: { amount: "29", symbol: "$", per: "one-time · 3 students" },
  },
  earlyBird: {
    INR: { amount: "799", symbol: "₹" },
    USD: { amount: "9", symbol: "$" },
  },
};

export function formatPrice(p: PriceDisplay): string {
  return `${p.symbol}${p.amount}`;
}
