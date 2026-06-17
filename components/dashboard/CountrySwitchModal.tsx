"use client";

/**
 * CountrySwitchModal — confirms a country switch and resets step progress.
 *
 * F-1 preservation: switching country deletes `step_progress` rows for the
 * old country only (filtered by country_code). Uploaded documents stay in
 * Storage. F-1 logic itself is untouched.
 */

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useCountry } from "@/lib/countryContext";
import type { CountryCode } from "@/lib/visa-countries";

type Props = {
  open: boolean;
  /** The country being switched TO. */
  newCountry: { code: CountryCode; name: string };
  onClose: () => void;
  onSwitched?: (code: CountryCode) => void;
};

export function CountrySwitchModal({ open, newCountry, onClose, onSwitched }: Props) {
  const { countryCode, setCountry, refresh } = useCountry();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = getBrowserSupabase();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && countryCode) {
          // Clear progress for the OUTGOING country only.
          // Documents in storage are intentionally preserved.
          await supabase
            .from("step_progress")
            .delete()
            .eq("user_id", user.id)
            .eq("country_code", countryCode);
        }
      }
      await setCountry(newCountry.code);
      await refresh();
      onSwitched?.(newCountry.code);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not switch — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="csm-overlay" role="dialog" aria-modal="true" aria-labelledby="csm-title">
      <div className="csm-card">
        <h3 id="csm-title" className="csm-title">
          Switch destination to {newCountry.name}?
        </h3>
        <p className="csm-body">
          Switching to <strong>{newCountry.name}</strong> will reset your
          checklist progress. Your uploaded documents will be saved but your
          step completion will start fresh.
        </p>
        {error ? <p className="csm-error">{error}</p> : null}
        <div className="csm-cta">
          <button type="button" className="csm-ghost" onClick={onClose} disabled={busy}>
            Keep current
          </button>
          <button type="button" className="csm-primary" onClick={confirm} disabled={busy}>
            {busy ? "Switching…" : "Switch anyway"}
          </button>
        </div>
      </div>
      <style>{`
        .csm-overlay {
          position: fixed; inset: 0; z-index: 90;
          display: flex; align-items: center; justify-content: center;
          background: rgba(28,27,26,0.7); padding: 16px;
        }
        .csm-card {
          background: var(--color-paper);
          border-radius: 14px; padding: 32px;
          max-width: 440px; width: 100%;
          font-family: var(--font-sans-stack);
        }
        .csm-title {
          font-family: var(--font-display-stack);
          font-size: 24px; line-height: 1.2; color: var(--color-ink); font-weight: 400;
        }
        .csm-body {
          margin-top: 12px; font-size: 14.5px; line-height: 1.55;
          color: var(--color-ink-soft);
        }
        .csm-error {
          margin-top: 12px; font-size: 13px;
          color: var(--color-persimmon-deep);
        }
        .csm-cta { margin-top: 24px; display: flex; gap: 10px; justify-content: flex-end; }
        .csm-ghost, .csm-primary {
          all: unset; cursor: pointer;
          padding: 0 18px; height: 40px;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 999px; font-size: 14px; font-weight: 600;
          transition: transform 160ms var(--ease-soft),
            background-color 200ms var(--ease-soft),
            border-color 200ms var(--ease-soft);
        }
        .csm-ghost {
          border: 1px solid var(--color-border); color: var(--color-ink);
        }
        @media (hover: hover) and (pointer: fine) {
          .csm-ghost:hover { border-color: var(--color-ink); }
        }
        .csm-primary {
          background: var(--color-persimmon); color: var(--color-paper-soft);
        }
        @media (hover: hover) and (pointer: fine) {
          .csm-primary:hover { background: var(--color-persimmon-deep); }
        }
        .csm-ghost:active, .csm-primary:active { transform: scale(0.97); }
        .csm-ghost:disabled, .csm-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
