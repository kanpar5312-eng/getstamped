import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/config";
import { sendMail } from "@/lib/email";
import { renderWeeklyDigest } from "@/lib/email-templates/weekly-digest";

/* ════════════════════════════════════════════════════════════════════════
   POST /api/cron/weekly-digest
   ──────────────────────────────────────────────────────────────────────
   Schedules itself via Supabase pg_cron — see /supabase/migrations
   0008_weekly_digest_cron.sql. Runs every Sunday at 09:00 IST (= 03:30
   UTC). Computes per-user step-completion delta for the past 7 days,
   skips users who muted the weekly recap in Settings, sends an email.

   Auth: bearer token must equal env CRON_SECRET. Service-role Supabase
   client bypasses RLS (cron isn't a user).
   ════════════════════════════════════════════════════════════════════════ */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProfileRow = {
  id: string;
  first_name: string | null;
  interview_date: string | null;
  notif_prefs: { weekly_digest?: boolean } | null;
};

type StepProgressRow = {
  user_id: string;
  status: "not_started" | "in_progress" | "complete";
  completed_at: string | null;
  step_number: number;
};

function adminClient() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function appOrigin(req: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_ORIGIN ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    new URL(req.url).origin
  );
}

function daysBetween(target: Date, today: Date): number {
  const t = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  const n = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((t - n) / 86_400_000);
}

export async function POST(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET not set" }, { status: 500 });
  }
  const auth = req.headers.get("authorization") ?? "";
  const presented = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  if (presented !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const sb = adminClient();
  if (!sb) {
    return NextResponse.json({ ok: false, error: "Supabase admin unavailable" }, { status: 500 });
  }

  // ---- Pull every profile that hasn't muted the weekly digest. ----
  const { data: rawProfiles, error: profErr } = await sb
    .from("profiles")
    .select("id, first_name, interview_date, notif_prefs");
  if (profErr) {
    return NextResponse.json({ ok: false, error: profErr.message }, { status: 500 });
  }
  const profiles = ((rawProfiles ?? []) as ProfileRow[]).filter(
    (p) => p.notif_prefs?.weekly_digest !== false,
  );
  if (profiles.length === 0) {
    return NextResponse.json({ ok: true, scanned: 0, sent: 0 });
  }

  // ---- Email lookup via admin API. ----
  const emailById = new Map<string, string>();
  {
    const { data: list, error } = await sb.auth.admin.listUsers({ perPage: 1000 });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    for (const u of list?.users ?? []) {
      if (u.email) emailById.set(u.id, u.email);
    }
  }

  // ---- Step progress for the past 7 days (and overall percent). ----
  const userIds = profiles.map((p) => p.id);
  const { data: allProgress } = await sb
    .from("step_progress")
    .select("user_id, status, completed_at, step_number")
    .in("user_id", userIds);

  const progressByUser = new Map<string, StepProgressRow[]>();
  for (const row of (allProgress ?? []) as StepProgressRow[]) {
    const arr = progressByUser.get(row.user_id) ?? [];
    arr.push(row);
    progressByUser.set(row.user_id, arr);
  }

  // ---- Find next step per user (smallest step_number not complete). ----
  const { data: stepCatalog } = await sb
    .from("visa_steps")
    .select("step_number, title");
  const stepTitleByNumber = new Map<number, string>();
  for (const s of (stepCatalog ?? []) as { step_number: number; title: string }[]) {
    if (!stepTitleByNumber.has(s.step_number)) {
      stepTitleByNumber.set(s.step_number, s.title);
    }
  }
  const totalSteps = stepTitleByNumber.size || 47;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const origin = appOrigin(req);

  let sent = 0;
  let failed = 0;

  for (const profile of profiles) {
    const to = emailById.get(profile.id);
    if (!to) continue;

    const myProgress = progressByUser.get(profile.id) ?? [];
    const stepsDoneThisWeek = myProgress.filter(
      (r) =>
        r.status === "complete" &&
        r.completed_at &&
        new Date(r.completed_at) >= weekAgo &&
        new Date(r.completed_at) <= now,
    ).length;
    const totalDone = myProgress.filter((r) => r.status === "complete").length;
    const percentComplete = Math.round((totalDone / totalSteps) * 100);

    // Smallest step_number not yet complete; falls back to step 1.
    const completedNumbers = new Set(
      myProgress.filter((r) => r.status === "complete").map((r) => r.step_number),
    );
    let nextNumber = 1;
    for (let n = 1; n <= totalSteps; n++) {
      if (!completedNumbers.has(n)) {
        nextNumber = n;
        break;
      }
    }
    const nextStepTitle = stepTitleByNumber.get(nextNumber) ?? null;

    let daysToInterview: number | null = null;
    if (profile.interview_date) {
      daysToInterview = daysBetween(new Date(profile.interview_date), now);
      if (daysToInterview < 0) daysToInterview = null;
    }

    const { subject, html, text } = renderWeeklyDigest({
      firstName: profile.first_name ?? "",
      stepsDoneThisWeek,
      totalSteps,
      percentComplete,
      nextStepTitle,
      daysToInterview,
      ctaUrl: `${origin}/dashboard`,
    });

    try {
      await sendMail({ to, subject, html, text });
      sent++;
    } catch (err) {
      console.error("[cron/weekly-digest] send failed for", profile.id, err);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, scanned: profiles.length, sent, failed });
}
