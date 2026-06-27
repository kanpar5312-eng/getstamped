import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/config";
import { sendMail } from "@/lib/email";
import { renderProductNews } from "@/lib/email-templates/product-news";

/* ════════════════════════════════════════════════════════════════════════
   POST /api/admin/product-news
   ──────────────────────────────────────────────────────────────────────
   Manual broadcast endpoint. Sends a single subject + body to every
   user with notif_prefs.product_updates === true.

   Auth: bearer token must equal env ADMIN_BROADCAST_SECRET (separate
   secret from CRON_SECRET so this can't be triggered by the cron
   schedule by accident).

   Request body:
     {
       "subject":   "What's new this month",
       "bodyText":  "We shipped X.\n\nWe also fixed Y.",
       "ctaLabel":  "Open dashboard",          // optional
       "ctaUrl":    "https://...",             // optional, paired with ctaLabel
       "dryRun":    false                      // optional, no sends if true
     }
   ════════════════════════════════════════════════════════════════════════ */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Body = {
  subject?: string;
  bodyText?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  dryRun?: boolean;
};

function adminClient() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  const expected = process.env.ADMIN_BROADCAST_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_BROADCAST_SECRET not set" },
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  const presented = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  if (presented !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await req.json().catch(() => ({}))) as Body;
  const subject = (payload.subject ?? "").trim();
  const bodyText = (payload.bodyText ?? "").trim();
  if (!subject || !bodyText) {
    return NextResponse.json(
      { ok: false, error: "subject and bodyText are required" },
      { status: 400 },
    );
  }
  const ctaLabel = payload.ctaLabel?.trim() || undefined;
  const ctaUrl = payload.ctaUrl?.trim() || undefined;
  const dryRun = !!payload.dryRun;

  const sb = adminClient();
  if (!sb) {
    return NextResponse.json(
      { ok: false, error: "Supabase admin unavailable" },
      { status: 500 },
    );
  }

  // Pull every profile that has opted in to product_updates.
  const { data: rawProfiles, error: profErr } = await sb
    .from("profiles")
    .select("id, first_name, notif_prefs");
  if (profErr) {
    return NextResponse.json({ ok: false, error: profErr.message }, { status: 500 });
  }

  type ProfileRow = {
    id: string;
    first_name: string | null;
    notif_prefs: { product_updates?: boolean } | null;
  };

  const recipients = ((rawProfiles ?? []) as ProfileRow[]).filter(
    (p) => p.notif_prefs?.product_updates === true,
  );

  // Resolve emails.
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

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      wouldSend: recipients.filter((r) => emailById.get(r.id)).length,
    });
  }

  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    const to = emailById.get(r.id);
    if (!to) continue;
    const { subject: s, html, text } = renderProductNews({
      firstName: r.first_name ?? "",
      subject,
      bodyText,
      ctaLabel,
      ctaUrl,
    });
    try {
      await sendMail({ to, subject: s, html, text });
      sent++;
    } catch (err) {
      console.error("[admin/product-news] send failed for", r.id, err);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, scanned: recipients.length, sent, failed });
}
