"use client";

import { useEffect, useState } from "react";

/**
 * Cookie-consent state.
 *
 *   "all"        — user accepted optional analytics + functional cookies
 *   "essential"  — user rejected optional cookies; only auth session is set
 *   null         — no decision yet (banner still showing)
 *
 * Source of truth: localStorage["gs.cookieConsent"]. Components that need to
 * gate behavior on consent should subscribe via the hook below — it listens
 * for the `gs:consent-changed` custom event so banner clicks update everywhere
 * at once without a page reload.
 */

export const CONSENT_KEY = "gs.cookieConsent";
export const CONSENT_EVENT = "gs:consent-changed";

export type Consent = "all" | "essential" | null;

export function readConsent(): Consent {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "all" || stored === "essential") return stored;
  } catch { /* localStorage blocked */ }
  return null;
}

export function writeConsent(value: "all" | "essential") {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch { /* ignore */ }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  }
}

export function clearConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch { /* ignore */ }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
  }
}

export function useConsent(): Consent {
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    setConsent(readConsent());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Consent>).detail ?? null;
      setConsent(detail);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  return consent;
}
