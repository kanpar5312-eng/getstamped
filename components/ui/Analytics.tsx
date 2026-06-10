"use client";

import { useEffect } from "react";
import { useConsent } from "@/lib/consent";

type Props = {
  /**
   * Plausible domain (e.g. "getstamped.app"). Mirrors NEXT_PUBLIC_PLAUSIBLE_DOMAIN.
   * If absent, this component renders nothing.
   */
  domain: string | null;
};

/**
 * Consent-gated Plausible loader.
 *
 *   1. Renders nothing until consent === "all".
 *   2. Injects the Plausible script tag once consent is given.
 *   3. Removes the script + window.plausible if consent is later cleared.
 *
 * Plausible itself is cookieless and GDPR-friendly. We still gate it behind
 * explicit consent because (a) the banner promised we would, and (b) some
 * jurisdictions classify product analytics as non-essential regardless of
 * whether the vendor uses cookies.
 */
export function Analytics({ domain }: Props) {
  const consent = useConsent();

  useEffect(() => {
    if (!domain) return;
    if (consent !== "all") {
      // Tear down if we previously injected
      const existing = document.getElementById("plausible-script");
      if (existing) existing.remove();
      delete (window as unknown as Record<string, unknown>).plausible;
      return;
    }
    if (document.getElementById("plausible-script")) return;
    const s = document.createElement("script");
    s.id = "plausible-script";
    s.defer = true;
    s.dataset.domain = domain;
    s.src = "https://plausible.io/js/script.js";
    document.head.appendChild(s);
  }, [consent, domain]);

  return null;
}
