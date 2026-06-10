"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Cloudflare site key. Mirrors NEXT_PUBLIC_TURNSTILE_SITE_KEY. */
  siteKey: string | null;
  /** Called with the token once the challenge passes. */
  onVerify: (token: string) => void;
  /** Called if the token expires (rare). */
  onExpire?: () => void;
  /** Theme. Defaults to "light". */
  theme?: "light" | "dark" | "auto";
};

/**
 * Cloudflare Turnstile widget — a privacy-friendly, free CAPTCHA alternative
 * to reCAPTCHA. Renders nothing when `siteKey` is absent so the form keeps
 * working in dev without Cloudflare credentials.
 *
 * Setup:
 *   1. Create a free Turnstile site at https://dash.cloudflare.com/?to=/:account/turnstile
 *   2. NEXT_PUBLIC_TURNSTILE_SITE_KEY = the site key
 *   3. TURNSTILE_SECRET_KEY            = the secret (used server-side to verify)
 *   4. The signUp action calls verifyTurnstile(token) before creating the user
 */
export function TurnstileWidget({
  siteKey,
  onVerify,
  onExpire,
  theme = "light",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  // Load the Turnstile script once per page
  useEffect(() => {
    if (!siteKey) return;
    if (typeof window === "undefined") return;
    const existing = document.getElementById("turnstile-script");
    if (existing) {
      setReady(true);
      return;
    }
    const s = document.createElement("script");
    s.id = "turnstile-script";
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, [siteKey]);

  // Render the widget once script + DOM are ready
  useEffect(() => {
    if (!ready || !siteKey || !containerRef.current) return;
    const turnstile = (window as unknown as {
      turnstile?: {
        render: (
          el: HTMLElement,
          opts: {
            sitekey: string;
            theme: "light" | "dark" | "auto";
            callback: (token: string) => void;
            "expired-callback"?: () => void;
          },
        ) => string;
        remove: (id: string) => void;
      };
    }).turnstile;
    if (!turnstile) return;
    if (widgetIdRef.current) return;
    widgetIdRef.current = turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme,
      callback: onVerify,
      "expired-callback": onExpire,
    });
    return () => {
      if (widgetIdRef.current && turnstile.remove) {
        turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [ready, siteKey, onVerify, onExpire, theme]);

  if (!siteKey) return null;
  return <div ref={containerRef} className="mt-1" />;
}
