"use client";

/**
 * CountryPill + first-time gate.
 *
 * - If the user has no country selection → shows <CountrySelector mode="first"/>
 *   as a blocking modal until they pick one.
 * - Otherwise renders a small flag + name + visa-type pill (top-right of
 *   dashboard chrome). Clicking it opens the CountrySwitchModal.
 *
 * F-1 preservation: existing dashboard logic is untouched. This is an
 * additive layer that surfaces the country selection state — when no
 * selection exists yet, the legacy F-1 surfaces still render under the
 * modal because the modal sits above them at z-index 80.
 */

import { useState } from "react";
import { useCountry } from "@/lib/countryContext";
import {
  SUPPORTED_COUNTRIES,
  type CountryCode,
} from "@/lib/visa-countries";
import { CountrySelector } from "@/components/onboarding/CountrySelector";
import { CountrySwitchModal } from "@/components/dashboard/CountrySwitchModal";

export function CountryPill({ authed }: { authed: boolean }) {
  const { countryCode, countryData } = useCountry();
  const [switchTo, setSwitchTo] = useState<{ code: CountryCode; name: string } | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  if (!authed) return null;

  // Destination selection now happens as the last step of /onboarding.
  // The pill never auto-opens the picker — only opens when the user clicks
  // it. This avoids ambushing existing users who pre-date the onboarding
  // question; new users land here with a country already saved.

  const sup = countryCode
    ? SUPPORTED_COUNTRIES.find((c) => c.code === countryCode)
    : null;
  const flag = countryData?.flag_emoji ?? sup?.flag_emoji ?? "🌐";
  const name = countryData?.name ?? sup?.name ?? "Choose destination";
  const visaType = countryData?.visa_type ?? sup?.visa_type ?? "";

  return (
    <>
      <button
        type="button"
        className="country-pill"
        onClick={() => setShowPicker(true)}
        aria-label={`Destination: ${name}. Click to change.`}
      >
        <span aria-hidden style={{ fontSize: 16 }}>{flag}</span>
        <span className="country-pill-text">
          <span className="country-pill-name">{name}</span>
          {visaType ? <span className="country-pill-visa">{visaType}</span> : null}
        </span>
      </button>

      <CountrySelector
        open={showPicker}
        mode="switch"
        onClose={() => setShowPicker(false)}
        onComplete={(picked) => {
          // If user already had a country and picked a different one,
          // funnel through the warning modal (it resets step progress).
          if (countryCode && countryCode !== picked) {
            const sp = SUPPORTED_COUNTRIES.find((c) => c.code === picked);
            setSwitchTo({ code: picked, name: sp?.name ?? picked });
          }
        }}
      />

      {switchTo ? (
        <CountrySwitchModal
          open={true}
          newCountry={switchTo}
          onClose={() => setSwitchTo(null)}
        />
      ) : null}

      <style>{`
        .country-pill {
          all: unset; cursor: pointer;
          display: inline-flex; align-items: center; gap: 10px;
          padding: 6px 12px 6px 10px;
          background: var(--color-paper-soft);
          border: 1px solid var(--color-border);
          border-radius: 999px;
          transition: border-color 200ms var(--ease-soft),
            background-color 200ms var(--ease-soft),
            transform 160ms var(--ease-soft);
        }
        @media (hover: hover) and (pointer: fine) {
          .country-pill:hover { border-color: var(--color-persimmon); }
        }
        .country-pill:active { transform: scale(0.97); }
        .country-pill-text {
          display: flex; flex-direction: column; line-height: 1.1;
        }
        .country-pill-name {
          font-size: 12.5px; font-weight: 600; color: var(--color-ink);
        }
        .country-pill-visa {
          font-family: var(--font-mono-stack);
          font-size: 9.5px; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--color-ink-soft);
        }
      `}</style>
    </>
  );
}
