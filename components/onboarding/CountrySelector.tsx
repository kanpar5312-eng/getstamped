"use client";

/**
 * CountrySelector — full-screen modal shown to a user the first time they
 * land in the dashboard with no `user_country_selection` row.
 *
 * Also re-openable from dashboard settings via `<CountrySelector mode="switch">`.
 *
 * F-1 preservation: this only writes to `user_country_selection`. It does
 * not touch the legacy `profiles.country` column or `lib/steps.ts`.
 */

import { useCallback, useMemo, useState } from "react";
import {
  APPLICANT_COUNTRIES,
  SUPPORTED_COUNTRIES,
  type CountryCode,
} from "@/lib/visa-countries";
import { useCountry } from "@/lib/countryContext";
import { PersonalizationCurtain } from "./PersonalizationCurtain";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Props = {
  open: boolean;
  onClose?: () => void;
  /** "first" = blocks dashboard; "switch" = closable from settings. */
  mode?: "first" | "switch";
  onComplete?: (code: CountryCode) => void;
};

export function CountrySelector({ open, onClose, mode = "first", onComplete }: Props) {
  const { setCountry } = useCountry();
  const [selected, setSelected] = useState<CountryCode | null>(null);
  const [from, setFrom] = useState<string>("");
  const [fromQuery, setFromQuery] = useState<string>("");
  const [showFromList, setShowFromList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [curtain, setCurtain] = useState<{
    destination: CountryCode;
    applyingFrom: string | null;
    firstName: string | null;
  } | null>(null);

  const filteredFrom = useMemo(() => {
    const q = fromQuery.trim().toLowerCase();
    if (!q) return APPLICANT_COUNTRIES;
    return APPLICANT_COUNTRIES.filter((c) =>
      c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [fromQuery]);

  const submit = useCallback(async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      await setCountry(selected, from || null);

      // Try to read first name for a personalised headline. Silent failure ok.
      let firstName: string | null = null;
      const sb = getBrowserSupabase();
      if (sb) {
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
          const { data } = await sb
            .from("profiles")
            .select("first_name")
            .eq("id", user.id)
            .maybeSingle();
          firstName = (data?.first_name as string | null) ?? null;
        }
      }

      // Show the personalization curtain — onComplete and onClose fire when
      // the curtain finishes, so the dashboard isn't visible mid-animation.
      setCurtain({ destination: selected, applyingFrom: from || null, firstName });
    } finally {
      setSubmitting(false);
    }
  }, [selected, submitting, from, setCountry]);

  // The curtain owns the close moment — render it instead of the selector
  // once it's active so the modal feels like one continuous experience.
  if (curtain) {
    return (
      <PersonalizationCurtain
        destination={curtain.destination}
        applyingFrom={curtain.applyingFrom}
        firstName={curtain.firstName}
        onDone={() => {
          onComplete?.(curtain.destination);
          onClose?.();
        }}
      />
    );
  }

  if (!open) return null;

  return (
    <div className="cs-overlay" role="dialog" aria-modal="true" aria-labelledby="cs-title">
      <div className="cs-card">
        {mode === "switch" && onClose ? (
          <button type="button" aria-label="Close" className="cs-close" onClick={onClose}>
            ×
          </button>
        ) : null}
        <h2 id="cs-title" className="cs-title">Where are you going to study?</h2>
        <p className="cs-sub">
          We&rsquo;ll build your exact visa checklist, document requirements, and
          interview prep based on your destination.
        </p>

        <div className="cs-grid" role="radiogroup" aria-label="Destination country">
          {SUPPORTED_COUNTRIES.map((c) => {
            const isSelected = selected === c.code;
            const locked = Boolean(c.comingSoon);
            return (
              <button
                key={c.code}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-disabled={locked}
                disabled={locked}
                onClick={() => !locked && setSelected(c.code)}
                className={`cs-card-country${isSelected ? " is-selected" : ""}${locked ? " is-locked" : ""}`}
              >
                <span className="cs-flag" aria-hidden>{c.flag_emoji}</span>
                <span className="cs-name">{c.name}</span>
                <span className="cs-visa">{c.visa_type}</span>
                <span className="cs-pt">
                  {locked ? "Coming soon" : `~${c.processing_time_weeks} weeks processing`}
                </span>
                {isSelected && !locked ? (
                  <span className="cs-check" aria-hidden>
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                      <path d="M3 8.5L6.5 12L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : null}
              </button>
            );
          })}
          <div className="cs-card-country cs-card-soon" aria-disabled>
            <span className="cs-flag" aria-hidden>+</span>
            <span className="cs-name">More countries</span>
            <span className="cs-visa">Coming soon</span>
            <span className="cs-pt">Schengen, NZ, Ireland…</span>
          </div>
        </div>

        <div className="cs-from">
          <label htmlFor="cs-from-input" className="cs-from-label">
            Also, which country are you applying <em>from</em>?
          </label>
          <div className="cs-from-field">
            <input
              id="cs-from-input"
              type="text"
              value={fromQuery}
              placeholder="Start typing your country…"
              onChange={(e) => {
                setFromQuery(e.target.value);
                setShowFromList(true);
              }}
              onFocus={() => setShowFromList(true)}
              onBlur={() => setTimeout(() => setShowFromList(false), 150)}
              autoComplete="off"
              className="cs-from-input"
            />
            {from ? (
              <span className="cs-from-chip">
                {APPLICANT_COUNTRIES.find((c) => c.code === from)?.name ?? from}
                <button
                  type="button"
                  aria-label="Clear"
                  onClick={() => { setFrom(""); setFromQuery(""); }}
                >×</button>
              </span>
            ) : null}
            {showFromList && filteredFrom.length > 0 ? (
              <ul className="cs-from-list" role="listbox">
                {filteredFrom.slice(0, 8).map((c) => (
                  <li key={c.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={from === c.code}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setFrom(c.code);
                        setFromQuery(c.name);
                        setShowFromList(false);
                      }}
                    >
                      <span className="cs-mono">{c.code}</span>{c.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!selected || submitting}
          className="cs-cta"
        >
          {submitting ? "Building your plan…" : "Build my visa plan →"}
        </button>
      </div>

      <style>{`
        .cs-overlay {
          position: fixed; inset: 0; z-index: 80;
          display: flex; align-items: center; justify-content: center;
          background: rgba(28, 27, 26, 0.80);
          padding: 16px;
        }
        .cs-card {
          position: relative;
          background: var(--color-paper);
          border-radius: 16px;
          padding: 48px;
          max-width: 560px; width: 100%;
          max-height: calc(100vh - 32px);
          overflow-y: auto;
          font-family: var(--font-sans-stack);
        }
        @media (max-width: 480px) { .cs-card { padding: 28px 20px; } }
        .cs-close {
          position: absolute; top: 14px; right: 14px;
          width: 32px; height: 32px; border-radius: 999px;
          border: 0; background: transparent; cursor: pointer;
          font-size: 24px; color: var(--color-ink-soft);
        }
        .cs-title {
          font-family: var(--font-display-stack);
          font-size: 32px; line-height: 1.05;
          color: var(--color-ink); font-weight: 400;
        }
        .cs-sub {
          margin-top: 8px; font-size: 14px;
          color: var(--color-ink-soft); line-height: 1.5;
          max-width: 44ch;
        }
        .cs-grid {
          margin-top: 28px;
          display: grid; gap: 12px;
          grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 480px) { .cs-grid { grid-template-columns: 1fr; } }
        .cs-card-country {
          position: relative;
          all: unset; cursor: pointer; display: flex; flex-direction: column;
          gap: 4px; padding: 20px;
          border: 1.5px solid rgba(28,27,26,0.1);
          border-radius: 12px;
          background: var(--color-paper-soft);
          transition: border-color 200ms var(--ease-soft),
            background-color 200ms var(--ease-soft),
            transform 160ms var(--ease-soft);
        }
        @media (hover: hover) and (pointer: fine) {
          .cs-card-country:not(.cs-card-soon):hover {
            border-color: var(--color-persimmon);
            background: color-mix(in srgb, var(--color-persimmon) 4%, var(--color-paper-soft));
          }
        }
        .cs-card-country:not(.cs-card-soon):active { transform: scale(0.98); }
        .cs-card-country.is-selected {
          border-width: 2px; padding: 19px;
          border-color: var(--color-persimmon);
          background: color-mix(in srgb, var(--color-persimmon) 6%, var(--color-paper-soft));
        }
        .cs-card-soon {
          border-style: dashed; cursor: default;
          background: transparent;
        }
        .cs-card-soon .cs-name, .cs-card-soon .cs-visa, .cs-card-soon .cs-pt { color: var(--color-muted); }
        .cs-card-country.is-locked {
          opacity: 0.5;
          cursor: not-allowed;
          border-style: dashed;
        }
        .cs-card-country.is-locked:hover {
          border-color: rgba(28,27,26,0.1) !important;
          background: var(--color-paper-soft) !important;
        }
        .cs-card-country.is-locked .cs-pt {
          color: var(--color-persimmon-deep);
          font-weight: 600;
        }
        .cs-flag { font-size: 32px; line-height: 1; }
        .cs-name { font-size: 15px; font-weight: 600; color: var(--color-ink); margin-top: 8px; }
        .cs-visa {
          font-family: var(--font-mono-stack);
          font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;
          color: var(--color-ink-soft);
        }
        .cs-pt {
          font-size: 11px; color: var(--color-ink-soft);
        }
        .cs-check {
          position: absolute; top: 12px; right: 12px;
          color: var(--color-persimmon);
        }

        .cs-from { margin-top: 32px; position: relative; }
        .cs-from-label { font-size: 13px; color: var(--color-ink); font-weight: 500; }
        .cs-from-label em { font-style: italic; }
        .cs-from-field {
          margin-top: 8px; position: relative;
          display: flex; gap: 8px; align-items: center;
        }
        .cs-from-input {
          width: 100%; height: 44px; padding: 0 14px;
          border: 1px solid var(--color-border);
          border-radius: 8px; background: var(--color-paper-soft);
          font-family: var(--font-sans-stack); font-size: 14px; color: var(--color-ink);
          transition: border-color 200ms var(--ease-soft);
        }
        .cs-from-input:focus { outline: none; border-color: var(--color-persimmon); }
        .cs-from-chip {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          background: var(--color-persimmon-tint); color: var(--color-persimmon-deep);
          padding: 4px 10px; border-radius: 999px;
          font-size: 12px; display: inline-flex; gap: 6px; align-items: center;
        }
        .cs-from-chip button { all: unset; cursor: pointer; }
        .cs-from-list {
          position: absolute; top: 100%; left: 0; right: 0; margin: 4px 0 0;
          background: var(--color-paper-soft);
          border: 1px solid var(--color-border); border-radius: 10px;
          list-style: none; padding: 4px; z-index: 5;
          max-height: 260px; overflow-y: auto;
          box-shadow: 0 12px 32px -16px rgba(28,27,26,0.18);
        }
        .cs-from-list button {
          all: unset; cursor: pointer; display: flex; gap: 12px; align-items: center;
          padding: 10px 12px; border-radius: 6px; width: 100%;
          font-size: 14px; color: var(--color-ink);
        }
        .cs-from-list button:hover { background: var(--color-paper-deep); }
        .cs-from-list .cs-mono {
          font-family: var(--font-mono-stack); font-size: 11px; color: var(--color-muted);
          width: 24px;
        }

        .cs-cta {
          all: unset; cursor: pointer;
          margin-top: 32px; width: 100%; height: 52px;
          display: flex; align-items: center; justify-content: center;
          background: var(--color-persimmon); color: var(--color-paper-soft);
          font-size: 15px; font-weight: 600; border-radius: 8px;
          transition: background-color 200ms var(--ease-soft),
            transform 160ms var(--ease-soft);
        }
        .cs-cta:disabled { background: rgba(28,27,26,0.2); cursor: not-allowed; }
        @media (hover: hover) and (pointer: fine) {
          .cs-cta:not(:disabled):hover { background: var(--color-persimmon-deep); }
        }
        .cs-cta:not(:disabled):active { transform: scale(0.98); }
      `}</style>
    </div>
  );
}
