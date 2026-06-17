"use server";

import { sendMail } from "@/lib/email";
import { buildContactNotification, buildContactReceived } from "@/lib/email-templates";

export type ContactCategory =
  | "general"
  | "billing"
  | "bug"
  | "feature"
  | "press"
  | "other";

export type ContactResult =
  | { ok: true; receivedId?: string }
  | { ok: false; error: string };

const SUPPORT_INBOX = process.env.SUPPORT_INBOX ?? "getstamped.online@gmail.com";
const RESPONSE_WINDOW_HOURS = 24;

/**
 * Contact-form submission.
 *
 *   1. Validates input
 *   2. Sends a notification email to the support inbox with the message
 *   3. Sends an autoresponder to the visitor confirming receipt + SLA
 *
 * Resend may be unconfigured in dev. In that case we log the message and
 * still return ok=true so the UI flow can complete (the visitor doesn't see
 * a failure for our missing env).
 */
export async function submitContact(input: {
  name: string;
  email: string;
  category: ContactCategory;
  message: string;
}): Promise<ContactResult> {
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim().toLowerCase();
  const message = (input.message ?? "").trim();
  const category = input.category ?? "general";

  if (name.length < 2) return { ok: false, error: "Tell us your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email." };
  if (message.length < 10) return { ok: false, error: "Your message is too short." };
  if (message.length > 5000) return { ok: false, error: "Your message is too long (max 5000 chars)." };

  const notify = buildContactNotification({ name, email, category, message });
  const ack = buildContactReceived({
    name,
    category,
    responseWindowHours: RESPONSE_WINDOW_HOURS,
  });

  // Best-effort: log when Resend isn't configured (dev), still report success.
  const [notifyRes, ackRes] = await Promise.all([
    sendMail({
      to: SUPPORT_INBOX,
      subject: notify.subject,
      text: notify.text,
      html: notify.html,
      replyTo: email,
      from: "transactional",
    }),
    sendMail({
      to: email,
      subject: ack.subject,
      text: ack.text,
      html: ack.html,
      from: "personal",
      replyTo: SUPPORT_INBOX,
    }),
  ]);

  if (!notifyRes.ok && notifyRes.error !== "not-configured") {
    console.error("[contact] notify send failed:", notifyRes.error);
  }
  if (!ackRes.ok && ackRes.error !== "not-configured") {
    console.error("[contact] ack send failed:", ackRes.error);
  }

  return { ok: true, receivedId: notifyRes.ok ? notifyRes.id : undefined };
}
