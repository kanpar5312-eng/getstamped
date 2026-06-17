/**
 * Allowed env keys for the dev-only env manager.
 * Lives outside "use server" so it can be imported into both server actions
 * and the page component without violating Next's server-action constraints.
 */

export type AllowedKey =
  | "GROQ_API_KEY"
  | "RESEND_API_KEY"
  | "RESEND_FROM_NOREPLY"
  | "RESEND_FROM_HELLO"
  | "NEXT_PUBLIC_TURNSTILE_SITE_KEY"
  | "TURNSTILE_SECRET_KEY"
  | "NEXT_PUBLIC_PLAUSIBLE_DOMAIN";

export const ALLOWED: {
  key: AllowedKey;
  label: string;
  hint: string;
  pattern?: string;
  secret: boolean;
}[] = [
  { key: "GROQ_API_KEY",                   label: "Groq API key",                hint: "console.groq.com/keys — starts with gsk_",      pattern: "^gsk_[A-Za-z0-9_\\-]{20,}$", secret: true },
  { key: "RESEND_API_KEY",                 label: "Resend API key",              hint: "resend.com/api-keys — starts with re_",         pattern: "^re_[A-Za-z0-9_\\-]{8,}$",   secret: true },
  { key: "RESEND_FROM_NOREPLY",            label: "Resend FROM (no-reply)",      hint: "e.g. \"GetStamped <noreply@yourdomain.com>\"",  secret: false },
  { key: "RESEND_FROM_HELLO",              label: "Resend FROM (personal)",      hint: "e.g. \"Parneet <hello@yourdomain.com>\"",       secret: false },
  { key: "NEXT_PUBLIC_TURNSTILE_SITE_KEY", label: "Turnstile site key (public)", hint: "dash.cloudflare.com → Turnstile",               secret: false },
  { key: "TURNSTILE_SECRET_KEY",           label: "Turnstile secret",            hint: "dash.cloudflare.com → Turnstile",               secret: true },
  { key: "NEXT_PUBLIC_PLAUSIBLE_DOMAIN",   label: "Plausible domain (public)",   hint: "e.g. getstamped.app",                           secret: false },
];

export type EnvStatus = {
  key: AllowedKey;
  label: string;
  hint: string;
  secret: boolean;
  pattern?: string;
  present: boolean;
  masked: string;
};
