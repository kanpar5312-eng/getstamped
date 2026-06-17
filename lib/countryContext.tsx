"use client";

/**
 * CountryContext — global selected-country state.
 *
 * F-1 preservation: when countryCode is null OR "US", consumers should fall
 * back to the existing canonical /lib/steps.ts and the hardcoded F-1 logic.
 * Only non-US flows query Supabase for visa_steps / visa_documents /
 * visa_interview_questions. This keeps the original F-1 path untouched.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isCountryCode,
  SUPPORTED_COUNTRIES,
  type CountryCode,
  type VisaCountry,
} from "@/lib/visa-countries";
import { getBrowserSupabase } from "@/lib/supabase/client";

type CountryCtx = {
  countryCode: CountryCode | null;
  countryData: VisaCountry | null;
  isLoading: boolean;
  setCountry: (code: CountryCode, applyingFrom?: string | null) => Promise<void>;
  /** Force-refresh from the DB (e.g. after a profile edit). */
  refresh: () => Promise<void>;
};

const Ctx = createContext<CountryCtx | null>(null);

export function CountryProvider({
  children,
  initialCountry,
}: {
  children: ReactNode;
  /** Optional SSR-sourced initial value so the modal doesn't flash for known users. */
  initialCountry?: CountryCode | null;
}) {
  const [countryCode, setCountryCode] = useState<CountryCode | null>(
    initialCountry ?? null,
  );
  const [countryData, setCountryData] = useState<VisaCountry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(initialCountry == null);

  const fetchSelection = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }
    const { data: sel } = await supabase
      .from("user_country_selection")
      .select("country_code")
      .eq("user_id", user.id)
      .maybeSingle();

    if (sel?.country_code && isCountryCode(sel.country_code)) {
      setCountryCode(sel.country_code);
      const { data: c } = await supabase
        .from("visa_countries")
        .select("*")
        .eq("code", sel.country_code)
        .maybeSingle();
      if (c) setCountryData(c as VisaCountry);
    } else {
      setCountryCode(null);
      setCountryData(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchSelection();
  }, [fetchSelection]);

  const setCountry = useCallback(
    async (code: CountryCode, applyingFrom?: string | null) => {
      setIsLoading(true);
      const supabase = getBrowserSupabase();
      if (!supabase) {
        setCountryCode(code);
        const sup = SUPPORTED_COUNTRIES.find((c) => c.code === code);
        if (sup) {
          setCountryData({
            id: "",
            code,
            name: sup.name,
            visa_type: sup.visa_type,
            flag_emoji: sup.flag_emoji,
            processing_time_weeks: sup.processing_time_weeks,
            official_portal_url: null,
            currency_code: sup.currency_code,
            is_active: true,
            created_at: new Date().toISOString(),
          });
        }
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      await supabase.from("user_country_selection").upsert(
        {
          user_id: user.id,
          country_code: code,
          applying_from_country: applyingFrom ?? null,
        },
        { onConflict: "user_id" },
      );

      const { data: c } = await supabase
        .from("visa_countries")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      setCountryCode(code);
      if (c) setCountryData(c as VisaCountry);
      setIsLoading(false);
    },
    [],
  );

  const value = useMemo<CountryCtx>(
    () => ({ countryCode, countryData, isLoading, setCountry, refresh: fetchSelection }),
    [countryCode, countryData, isLoading, setCountry, fetchSelection],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCountry(): CountryCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useCountry must be used inside <CountryProvider>");
  }
  return ctx;
}

/**
 * Convenience: returns true when the F-1 hardcoded path should be used.
 * (No country selected yet, OR country is US.)
 */
export function shouldUseHardcodedFOnePath(code: CountryCode | null): boolean {
  return code == null || code === "US";
}
