import "server-only";
import { Resend } from "resend";

/**
 * Resend client + sendMail helper.
 *
 * DNS setup required on the domain owning RESEND_FROM* addresses (Resend
 * dashboard → Domains → Add):
 *   • SPF:   "v=spf1 include:_spf.resend.com ~all"
 *   • DKIM:  CNAME records Resend issues per verified domain (resend._domainkey…)
 *   • DMARC: "v=DMARC1; p=quarantine; rua=mailto:legal@getstamped.app"
 * Until DNS is verified, Resend rejects sends and we degrade gracefully.
 *
 * Two from-addresses are recognised so callers can pick the right tone:
 *
 *   transactional → RESEND_FROM_TRANSACTIONAL
 *     (default "GetStamped <noreply@getstamped.app>") — verification, password
 *     reset, reminders, exports. No replies expected; replyTo points to support.
 *
 *   personal → RESEND_FROM_PERSONAL
 *     (default "Parneet at GetStamped <hello@getstamped.app>") — waitlist
 *     welcome, contact-form acknowledgement, anything signed as a person.
 *     Replies land in the support inbox.
 *
 * Reads RESEND_API_KEY lazily. If missing, sendMail returns
 * { ok: false, error: "not-configured" } and logs to console — never throws.
 */

let cached: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (cached) return cached;
  cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}

// Transactional + personal `From:` addresses must stay on the verified Resend
// domain — Resend rejects sends from Gmail. User-facing reply-to + support
// inbox is the GetStamped Gmail.
const DEFAULT_FROM_TRANSACTIONAL = "GetStamped <noreply@getstamped.app>";
const DEFAULT_FROM_PERSONAL      = "Parneet at GetStamped <hello@getstamped.app>";
const DEFAULT_SUPPORT_REPLY      = "getstamped.online@gmail.com";

export type FromKind = "transactional" | "personal";
export type SendResult = { ok: true; id: string } | { ok: false; error: string };

export function getFromAddress(kind: FromKind): string {
  if (kind === "personal") {
    return process.env.RESEND_FROM_PERSONAL ?? process.env.RESEND_FROM ?? DEFAULT_FROM_PERSONAL;
  }
  return (
    process.env.RESEND_FROM_TRANSACTIONAL ??
    process.env.RESEND_FROM ??
    DEFAULT_FROM_TRANSACTIONAL
  );
}

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  /** Default "transactional". Use "personal" for human-signed mails. */
  from?: FromKind;
}): Promise<SendResult> {
  const r = getResend();
  if (!r) {
    console.warn("[email] RESEND_API_KEY missing; skipping send to", opts.to);
    return { ok: false, error: "not-configured" };
  }
  try {
    const from = getFromAddress(opts.from ?? "transactional");
    const replyTo = opts.replyTo ?? (opts.from === "personal" ? DEFAULT_SUPPORT_REPLY : undefined);
    const res = await r.emails.send({
      from,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      text: opts.text ?? "",
      html: opts.html,
      replyTo,
    });
    if (res.error) return { ok: false, error: res.error.message };
    return { ok: true, id: res.data?.id ?? "" };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
