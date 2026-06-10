"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Currency } from "@/lib/pricing";

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggle: () => void;
};

const PricingContext = createContext<Ctx | null>(null);

type ProviderProps = {
  initial: Currency;
  children: React.ReactNode;
};

export function PricingProvider({ initial, children }: ProviderProps) {
  const [currency, setCurrencyState] = useState<Currency>(initial);

  // Keep cookie in sync when user toggles manually
  useEffect(() => {
    document.cookie = `gs_currency=${currency}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }, [currency]);

  const setCurrency = (c: Currency) => setCurrencyState(c);
  const toggle = () =>
    setCurrencyState((c) => (c === "INR" ? "USD" : "INR"));

  return (
    <PricingContext.Provider value={{ currency, setCurrency, toggle }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing(): Ctx {
  const ctx = useContext(PricingContext);
  if (!ctx) {
    throw new Error("usePricing must be used inside <PricingProvider>");
  }
  return ctx;
}
