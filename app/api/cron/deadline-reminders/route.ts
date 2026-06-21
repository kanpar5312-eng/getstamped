import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/config";
import { sendMail } from "@/lib/email";
import { renderDeadlineEmail } from "@/lib/email-templates/deadline-reminder";

/* ════════════════════════════════════════════════════════════════════════
   POST /api/cron/deadline-reminders
   ──────────────────────────────────────────────────────────────────────
   Called once a day at 09:00 IST by Supabase pg_cron (see migration 0005
   for the schedule SQL). Computes per-user step deadlines from
   profiles.interview_date − visa_steps.deadline_offset_days, finds the
   ones falling exactly 30, 14, 7, or 3 days from today, and sends a
   reminder via Resend. The (user_id, step_id, days_before) unique
   constraint on email_reminders_log is the dedupe guarantee — a
   second cron run on the same day, or a retry after a partial failure,
   skips anything already logged.

   Auth: bearer token in `Authorization` header must equal env CRON_SECRET.
   Service-role Supabase client bypasses RLS (cron isn't a user).
   ════════════════════════════════════════════════════════════════════════ */

const TARGET_DAYS = [30, 14, 7, 3] as const;
type TargetDay = (typeof TARGET_DAYS)[number];

// Disable any Next caching — cron output is one-shot and the function
// reads live DB state every invocation.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type StepRow = {
  id: string;
  step_number: number;
  title: string;
  description: string;
  what_to_upload: string | null;
  deadline_offset_days: number | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  interview_date: string | null;
  country_code: string | null;
  country: string | null;
};

function adminClient() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function appOrigin(req: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_ORIGIN ??
    new URL(req.url).origin
  );
}

/** Days between two dates, ignoring time-of-day. Always integer. */
function daysUntil(target: Date, today: Date): number {
  const t = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  const n = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((t - n) / 86_400_000);
}

export async function POST(req: Request) {
  // ---- Secret check ----
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

  // ---- Pull every profile with a known interview date ----
  const { data: profiles, error: profErr } = await sb
    .from("profiles")
    .select("id, first_name, interview_date, country_code, country")
    .not("interview_date", "is", null);

  if (profErr) {
    return NextResponse.json({ ok: false, error: profErr.message }, { status: 500 });
  }
  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ ok: true, scanned: 0, sent: 0 });
  }

  // ---- Pre-load step catalogs keyed by country, only steps that have a
  //      non-null deadline_offset_days (others are not time-bound). ----
  const countryCodes = Array.from(
    new Set((profiles as ProfileRow[]).map((p) => p.country_code).filter(Boolean)),
  ) as string[];

  const { data: steps, error: stepsErr } = countryCodes.length
    ? await sb
        .from("visa_steps")
        .select("id, country_code, step_number, title, description, what_to_upload, deadline_offset_days")
        .in("country_code", countryCodes)
        .not("deadline_offset_days", "is", null)
    : { data: [], error: null };
  if (stepsErr) {
    return NextResponse.json({ ok: false, error: stepsErr.message }, { status: 500 });
  }

  const stepsByCountry = new Map<string, StepRow[]>();
  for (const s of (steps ?? []) as Array<StepRow & { country_code: string }>) {
    const arr = stepsByCountry.get(s.country_code) ?? [];
    arr.push(s);
    stepsByCountry.set(s.country_code, arr);
  }

  // ---- Email lookup (Supabase auth.users isn't exposed via PostgREST,
  //      so use the admin API). Pull addresses for just the users we
  //      need, in one paginated sweep up to 1000. ----
  const emailById = new Map<string, string>();
  {
    const { data: list, error: usersErr } = await sb.auth.admin.listUsers({ perPage: 1000 });
    if (usersErr) {
      return NextResponse.json({ ok: false, error: usersErr.message }, { status: 500 });
    }
    for (const u of list?.users ?? []) {
      if (u.email) emailById.set(u.id, u.email);
    }
  }

  // ---- Step-progress: skip anything the user already finished. ----
  const userIds = (profiles as ProfileRow[]).map((p) => p.id);
  const { data: progressRows } = await sb
    .from("step_progress")
    .select("user_id, step_number, status")
    .in("user_id", userIds);
  const completedKey = new Set<string>(); // `${userId}:${stepNumber}`
  for (const r of progressRows ?? []) {
    if (r.status === "completed" || r.status === "done") {
      completedKey.add(`${r.user_id}:${r.step_number}`);
    }
  }

  // ---- Walk every (user, step) pair, pick out the ones whose deadline
  //      lands exactly on a target day. ----
  const today = new Date();
  type Candidate = {
    user: ProfileRow;
    email: string;
    step: StepRow;
    daysBefore: TargetDay;
  };
  const candidates: Candidate[] = [];
  for (const p of profiles as ProfileRow[]) {
    if (!p.interview_date || !p.country_code) continue;
    const email = emailById.get(p.id);
    if (!email) continue;
    const interview = new Date(p.interview_date);
    if (Number.isNaN(interview.getTime())) continue;

    const stepsForCountry = stepsByCountry.get(p.country_code) ?? [];
    for (const step of stepsForCountry) {
      if (step.deadline_offset_days == null) continue;
      if (completedKey.has(`${p.id}:${step.step_number}`)) continue;

      const deadline = new Date(interview.getTime() - step.deadline_offset_days * 86_400_000);
      const remaining = daysUntil(deadline, today);
      if (!TARGET_DAYS.includes(remaining as TargetDay)) continue;

      candidates.push({ user: p, email, step, daysBefore: remaining as TargetDay });
    }
  }

  if (candidates.length === 0) {
    return NextResponse.json({ ok: true, scanned: profiles.length, sent: 0 });
  }

  // ---- Dedupe against the log in one batched read. ----
  const { data: alreadySent } = await sb
    .from("email_reminders_log")
    .select("user_id, step_id, days_before")
    .in("user_id", candidates.map((c) => c.user.id));
  const sentKey = new Set<string>();
  for (const r of alreadySent ?? []) {
    sentKey.add(`${r.user_id}:${r.step_id}:${r.days_before}`);
  }
  const toSend = candidates.filter(
    (c) => !sentKey.has(`${c.user.id}:${c.step.id}:${c.daysBefore}`),
  );

  // ---- Send + log. Sequential keeps Resend rate-limits happy and
  //      means one bad send doesn't take down the whole sweep. ----
  const origin = appOrigin(req);
  let sent = 0;
  const failures: Array<{ userId: string; stepId: string; error: string }> = [];

  for (const c of toSend) {
    const ctaUrl = `${origin}/dashboard/playbook#step-${c.step.step_number}`;
    const email = renderDeadlineEmail({
      firstName: c.user.first_name ?? "",
      stepTitle: c.step.title,
      stepDescription: c.step.description,
      whatToUpload: c.step.what_to_upload,
      daysBefore: c.daysBefore,
      ctaUrl,
    });

    const r = await sendMail({
      to: c.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    if (!r.ok) {
      failures.push({ userId: c.user.id, stepId: c.step.id, error: r.error });
      continue;
    }

    // Log AFTER a successful send so a Resend failure doesn't dedupe
    // a future retry. The unique constraint guards against double-log.
    const { error: logErr } = await sb
      .from("email_reminders_log")
      .insert({
        user_id: c.user.id,
        step_id: c.step.id,
        days_before: c.daysBefore,
      });
    if (logErr && !/duplicate key/i.test(logErr.message)) {
      console.error("[cron/deadline-reminders] log insert failed:", logErr);
    }
    sent++;
  }

  return NextResponse.json({
    ok: true,
    scanned: profiles.length,
    candidates: candidates.length,
    sent,
    failures,
  });
}
