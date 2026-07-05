"use server";

import { revalidatePath } from "next/cache";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";
import { sendMail } from "@/lib/email";

export type AccountResult = { ok: true } | { ok: false; error: string };

async function requireUser() {
  if (!isSupabaseConfigured()) return { ok: false as const, error: "Auth not configured." };
  const sb = await getServerSupabase();
  if (!sb) return { ok: false as const, error: "Supabase unavailable." };
  const { data } = await sb.auth.getUser();
  if (!data.user) return { ok: false as const, error: "Not signed in." };
  return { ok: true as const, sb, user: data.user };
}

/**
 * Triggers Supabase's email-change flow. The user receives an email at the new
 * address; on confirmation Supabase swaps the primary email.
 */
export async function requestEmailChange(newEmail: string): Promise<AccountResult> {
  if (!newEmail || !/.+@.+\..+/.test(newEmail)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const { error } = await u.sb.auth.updateUser({ email: newEmail });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updatePassword(newPassword: string): Promise<AccountResult> {
  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const { error } = await u.sb.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function resetProgress(): Promise<AccountResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const userId = u.user.id;
  const [{ error: spErr }, { error: saErr }] = await Promise.all([
    u.sb.from("step_progress").delete().eq("user_id", userId),
    u.sb.from("step_activity").insert({ user_id: userId, action: "progress_reset" }),
  ]);
  if (spErr) return { ok: false, error: spErr.message };
  if (saErr) {/* non-fatal */}
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/timeline");
  return { ok: true };
}

/**
 * Marks the account for deletion 30 days from now. A scheduled cron (cf. README)
 * picks rows where scheduled_deletion_at < now() and finalizes via admin API.
 * Signing in within the window clears the flag.
 */
export async function scheduleAccountDeletion(): Promise<AccountResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const when = new Date(Date.now() + 30 * 86_400_000).toISOString();
  const { error } = await u.sb
    .from("profiles")
    .update({ scheduled_deletion_at: when })
    .eq("id", u.user.id);
  if (error) return { ok: false, error: error.message };
  await u.sb.auth.signOut();
  return { ok: true };
}

/**
 * Refund request. Stripe isn't wired yet, so we route this through the
 * support inbox with a structured payload. When Stripe lands, this action
 * gets replaced with a real `stripe.refunds.create()` call.
 *
 * Eligibility window: 14 days from purchase. We don't enforce it server-side
 * yet — the support team checks against Stripe's record manually.
 */
export async function requestRefund(input: {
  reason: string;
}): Promise<AccountResult> {
  const reason = (input.reason ?? "").trim();
  if (reason.length < 10) {
    return { ok: false, error: "Tell us briefly why so we can process this faster." };
  }
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };

  const { data: profile } = await u.sb
    .from("profiles")
    .select("first_name, last_name, plan")
    .eq("id", u.user.id)
    .maybeSingle();

  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() || "Customer";
  const plan = profile?.plan ?? "unknown";
  const email = u.user.email ?? "(no email on file)";

  const subject = `[REFUND] ${name} · plan: ${plan}`;
  const text = `Refund request received via Settings → Plan.

User ID: ${u.user.id}
Name:    ${name}
Email:   ${email}
Plan:    ${plan}

Reason:
${reason}

— Action required: verify charge in Stripe, issue refund within 14-day window if eligible, reply to ${email}.`;

  const supportInbox = process.env.SUPPORT_INBOX ?? "getstamped.online@gmail.com";
  await sendMail({
    to: supportInbox,
    subject,
    text,
    replyTo: email,
    from: "transactional",
  });

  return { ok: true };
}

export async function cancelAccountDeletion(): Promise<AccountResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const { error } = await u.sb
    .from("profiles")
    .update({ scheduled_deletion_at: null })
    .eq("id", u.user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Hard-delete an already-scheduled account. Requires service role key.
 * Called by the deletion cron OR directly from Settings if the user opts to
 * "delete immediately" with re-auth (not exposed in UI by default).
 */
export async function purgeAccountNow(): Promise<AccountResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return { ok: false, error: "Service role not configured." };
  const admin = createClient(getSupabaseUrl()!, serviceKey, { auth: { persistSession: false } });
  const { error } = await admin.auth.admin.deleteUser(u.user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type NotifPrefs = {
  weekly_digest: boolean;
  reminders: boolean;
  product_updates: boolean;
  step_updates?: boolean;
};

export async function updateNotifPrefs(patch: Partial<NotifPrefs>): Promise<AccountResult> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  // Merge with existing
  const { data: row } = await u.sb
    .from("profiles")
    .select("notif_prefs")
    .eq("id", u.user.id)
    .maybeSingle();
  const current = (row?.notif_prefs as Partial<NotifPrefs> | null) ?? {};
  const next = { ...current, ...patch };
  const { error } = await u.sb
    .from("profiles")
    .update({ notif_prefs: next })
    .eq("id", u.user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Builds a clean, human-readable PDF report of the user's account
 * (profile, step progress, documents, AI threads, mock interviews).
 * Returns a base64 PDF the UI offers as a download. The legacy field
 * name is `jsonBase64` for backwards-compat with the UI; payload is now
 * application/pdf, not JSON.
 */
export async function exportUserData(): Promise<
  | { ok: true; filename: string; jsonBase64: string; mimeType: string }
  | { ok: false; error: string }
> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: u.error };
  const userId = u.user.id;
  const userEmail = u.user.email ?? "";

  // Any failure below (a bad query, an encoding error from pdf-lib, etc.)
  // used to throw past the caller uncaught — the client's handleExport
  // has no try/catch around this call, so it just silently died with the
  // button never re-enabling. Catch here and always return a real result.
  try {
    return await buildExportPdf(u.sb, userId, userEmail);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? `Export failed: ${err.message}` : "Export failed. Please try again.",
    };
  }
}

async function buildExportPdf(
  sb: SupabaseClient,
  userId: string,
  userEmail: string,
): Promise<
  | { ok: true; filename: string; jsonBase64: string; mimeType: string }
  | { ok: false; error: string }
> {
  const [profileRes, stepsRes, activityRes, docsRes, threadsRes, messagesRes, sessionsRes] =
    await Promise.all([
      sb.from("profiles").select("*").eq("id", userId).maybeSingle(),
      sb.from("step_progress").select("*").eq("user_id", userId).order("step_number"),
      sb
        .from("step_activity")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      sb
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false }),
      sb.from("ai_threads").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      sb
        .from("ai_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      sb
        .from("mock_interview_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("ended_at", { ascending: false }),
    ]);

  type AnyRow = Record<string, unknown>;
  const profile = (profileRes.data ?? {}) as AnyRow;
  const steps = (stepsRes.data ?? []) as AnyRow[];
  const activity = (activityRes.data ?? []) as AnyRow[];
  const docs = (docsRes.data ?? []) as AnyRow[];
  const threads = (threadsRes.data ?? []) as AnyRow[];
  const messages = (messagesRes.data ?? []) as AnyRow[];
  const sessions = (sessionsRes.data ?? []) as AnyRow[];

  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

  const pdf = await PDFDocument.create();
  pdf.setTitle("GetStamped — Account Export");
  pdf.setAuthor("GetStamped");
  pdf.setSubject(`Account export for ${userEmail}`);

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvOb = await pdf.embedFont(StandardFonts.HelveticaOblique);

  // Palette mirrors the dashboard's Paper/Ink/Persimmon brand.
  const paper = rgb(0.984, 0.965, 0.925);
  const ink = rgb(0.110, 0.106, 0.102);
  const inkSoft = rgb(0.290, 0.282, 0.267);
  const muted = rgb(0.522, 0.498, 0.451);
  const persimmon = rgb(1.0, 0.357, 0.180);
  const hairline = rgb(0.902, 0.875, 0.800);

  const W = 612; // US Letter (8.5" × 11" at 72dpi)
  const H = 792;
  const MARGIN = 56;

  // Active page + cursor for body text. A `flow()` helper below handles
  // wrapping and auto-pagination so each section can stay short.
  let page = pdf.addPage([W, H]);
  let y = H - MARGIN;

  function paintBackground() {
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: paper });
  }
  paintBackground();

  function pageBreak() {
    page = pdf.addPage([W, H]);
    paintBackground();
    y = H - MARGIN;
  }

  function need(rows: number, lineH = 14) {
    if (y - rows * lineH < MARGIN + 40) pageBreak();
  }

  function drawLine(opts: { y: number; thick?: number; color?: ReturnType<typeof rgb> }) {
    page.drawLine({
      start: { x: MARGIN, y: opts.y },
      end: { x: W - MARGIN, y: opts.y },
      thickness: opts.thick ?? 0.5,
      color: opts.color ?? hairline,
    });
  }

  function eyebrow(text: string) {
    need(2);
    page.drawText(text.toUpperCase(), {
      x: MARGIN,
      y,
      size: 9,
      font: helvBold,
      color: persimmon,
    });
    y -= 16;
  }

  function h1(text: string) {
    need(3);
    page.drawText(text, { x: MARGIN, y, size: 24, font: helvBold, color: ink });
    y -= 30;
  }

  function h2(text: string) {
    need(3);
    page.drawText(text, { x: MARGIN, y, size: 14, font: helvBold, color: ink });
    y -= 18;
    drawLine({ y: y + 4 });
    y -= 6;
  }

  function wrap(text: string, font: typeof helv, size: number, maxWidth: number): string[] {
    const words = String(text ?? "").replace(/\s+/g, " ").trim().split(" ");
    if (!words[0]) return [""];
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) <= maxWidth) {
        cur = test;
      } else {
        if (cur) lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function body(text: string, opts?: { font?: typeof helv; size?: number; color?: ReturnType<typeof rgb> }) {
    const font = opts?.font ?? helv;
    const size = opts?.size ?? 10;
    const color = opts?.color ?? inkSoft;
    const lines = wrap(text, font, size, W - MARGIN * 2);
    for (const ln of lines) {
      need(1);
      page.drawText(ln, { x: MARGIN, y, size, font, color });
      y -= size + 4;
    }
  }

  function kv(label: string, value: string) {
    need(1);
    page.drawText(label, { x: MARGIN, y, size: 9, font: helvBold, color: muted });
    page.drawText(value || "—", { x: MARGIN + 130, y, size: 10, font: helv, color: ink });
    y -= 16;
  }

  function fmt(v: unknown): string {
    if (v == null || v === "") return "—";
    if (typeof v === "string") {
      // Render ISO dates a little friendlier.
      if (/^\d{4}-\d{2}-\d{2}(T|$)/.test(v)) {
        const d = new Date(v);
        if (!isNaN(d.getTime())) {
          return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
        }
      }
      return v;
    }
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (typeof v === "number") return String(v);
    return JSON.stringify(v);
  }

  /* ─────────────────────── Cover ─────────────────────── */
  // Persimmon top rail
  page.drawRectangle({ x: 0, y: H - 6, width: W, height: 6, color: persimmon });

  page.drawText("GETSTAMPED", {
    x: MARGIN, y: H - 70, size: 11, font: helvBold, color: persimmon,
  });
  page.drawText("ACCOUNT EXPORT", {
    x: MARGIN, y: H - 86, size: 9, font: helv, color: muted,
  });

  y = H - 190;
  h1((profile.first_name as string) || userEmail || "Your account");
  page.drawText(userEmail, { x: MARGIN, y, size: 12, font: helvOb, color: muted });
  y -= 28;

  drawLine({ y });
  y -= 24;

  const exportedAt = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
  kv("Exported", exportedAt);
  kv("User ID", userId);
  kv("Total steps tracked", String(steps.length));
  kv("Documents", String(docs.length));
  kv("AI chat threads", String(threads.length));
  kv("Mock interviews", String(sessions.length));

  y -= 12;
  body(
    "This document is a complete, human-readable snapshot of your GetStamped account on the date above. Keep it as a personal record — it is not a legal document.",
    { font: helvOb, size: 10, color: muted },
  );

  /* ─────────────────────── Profile ─────────────────────── */
  pageBreak();
  eyebrow("Profile");
  h1("Personal details");
  for (const key of [
    "first_name",
    "last_name",
    "country",
    "country_code",
    "consulate",
    "university",
    "program_type",
    "intake_term",
    "interview_date",
    "plan",
    "created_at",
    "updated_at",
  ]) {
    if (key in profile) kv(key.replace(/_/g, " "), fmt(profile[key]));
  }

  /* ─────────────────────── Step progress ─────────────────────── */
  pageBreak();
  eyebrow("47-step playbook");
  h1("Your step progress");

  const done = steps.filter((s) => s.status === "complete").length;
  const inProg = steps.filter((s) => s.status === "in_progress").length;
  body(`${done} complete · ${inProg} in progress · ${Math.max(0, steps.length - done - inProg)} not started`);
  y -= 6;

  for (const s of steps) {
    const n = String(s.step_number ?? "?").padStart(2, "0");
    const status = String(s.status ?? "not_started");
    // pdf-lib's standard Helvetica font only supports WinAnsi encoding —
    // ■ / ◐ / □ aren't in that character set and throw at draw time,
    // which is why export silently failed for any user with step
    // progress rows (i.e. almost everyone). Plain ASCII marks instead.
    const mark = status === "complete" ? "[x]" : status === "in_progress" ? "[~]" : "[ ]";
    const color = status === "complete" ? persimmon : muted;
    need(1);
    page.drawText(mark, { x: MARGIN, y, size: 11, font: helvBold, color });
    page.drawText(`Step ${n}`, { x: MARGIN + 32, y, size: 10, font: helvBold, color: ink });
    page.drawText(status.replace("_", " "), { x: MARGIN + 94, y, size: 10, font: helv, color: inkSoft });
    if (s.completed_at) {
      page.drawText(fmt(s.completed_at), {
        x: MARGIN + 220, y, size: 9, font: helv, color: muted,
      });
    }
    y -= 16;
  }

  /* ─────────────────────── Documents ─────────────────────── */
  if (docs.length > 0) {
    pageBreak();
    eyebrow("Document vault");
    h1("Uploaded documents");
    for (const d of docs) {
      need(3);
      page.drawText(String(d.display_name ?? d.slug ?? "Document"), {
        x: MARGIN, y, size: 11, font: helvBold, color: ink,
      });
      y -= 14;
      page.drawText(`Status: ${fmt(d.status)} · Uploaded ${fmt(d.uploaded_at)}`, {
        x: MARGIN, y, size: 9, font: helv, color: muted,
      });
      y -= 16;
    }
  }

  /* ─────────────────────── Mock interviews ─────────────────────── */
  if (sessions.length > 0) {
    pageBreak();
    eyebrow("Mock interview history");
    h1("Recorded sessions");
    for (const s of sessions) {
      need(4);
      page.drawText(`Ended ${fmt(s.ended_at)}`, {
        x: MARGIN, y, size: 11, font: helvBold, color: ink,
      });
      y -= 14;
      if (s.overall_score != null) {
        page.drawText(`Overall score: ${fmt(s.overall_score)}`, {
          x: MARGIN, y, size: 10, font: helv, color: inkSoft,
        });
        y -= 14;
      }
      y -= 4;
    }
  }

  /* ─────────────────────── AI chats ─────────────────────── */
  if (threads.length > 0) {
    pageBreak();
    eyebrow("Ask GetStamped");
    h1("AI chat threads");
    body(`You have ${threads.length} thread${threads.length === 1 ? "" : "s"} and ${messages.length} recent message${messages.length === 1 ? "" : "s"} on record. The most recent threads are summarised below.`);
    y -= 8;
    for (const t of threads.slice(0, 12)) {
      need(2);
      page.drawText(String(t.title ?? "Untitled thread"), {
        x: MARGIN, y, size: 10, font: helvBold, color: ink,
      });
      y -= 14;
      page.drawText(`Created ${fmt(t.created_at)}`, {
        x: MARGIN, y, size: 9, font: helv, color: muted,
      });
      y -= 14;
    }
  }

  /* ─────────────────────── Activity ─────────────────────── */
  if (activity.length > 0) {
    pageBreak();
    eyebrow("Activity log");
    h1("Recent activity");
    body("Most recent 50 step events, newest first.");
    y -= 6;
    for (const a of activity) {
      need(1);
      const line = `${fmt(a.created_at)} · ${String(a.event_type ?? a.kind ?? "event")} · Step ${fmt(a.step_number)}`;
      page.drawText(line, { x: MARGIN, y, size: 9, font: helv, color: inkSoft });
      y -= 14;
    }
  }

  // Footer on the last page.
  page.drawText(`Exported ${exportedAt} · GetStamped`, {
    x: MARGIN, y: 40, size: 8, font: helvOb, color: muted,
  });

  const bytes = await pdf.save();
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(bytes).toString("base64")
      : btoa(String.fromCharCode(...bytes));

  return {
    ok: true,
    filename: `getstamped-export-${new Date().toISOString().slice(0, 10)}.pdf`,
    jsonBase64: base64,
    mimeType: "application/pdf",
  };
}
