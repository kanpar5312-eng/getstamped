import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/documents/admin";
import { TOS_VERSION } from "@/lib/legal/tos";

/* ════════════════════════════════════════════════════════════════════════
   POST /api/auth/tos-consent
   Records the user's forced-scroll Terms-of-Service confirmation.
   Append-only log + profile flag flip so the consent step is not
   shown again on the same version.
   DPDP Act compliance — affirmative consent.
   ════════════════════════════════════════════════════════════════════════ */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  return real ? real.trim() : null;
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: "storage not configured" }, { status: 500 });

  const ip = clientIp(req);

  const { error: logErr } = await admin.from("tos_consent_log").insert({
    user_id: user.id,
    terms_version: TOS_VERSION,
    ip_address: ip,
    scrolled_to_bottom: true,
  });
  if (logErr) {
    console.error("[tos-consent] log insert failed:", logErr.message);
    return NextResponse.json({ error: "log_failed" }, { status: 500 });
  }

  const { error: profileErr } = await admin
    .from("profiles")
    .update({ tos_consent_version: TOS_VERSION })
    .eq("id", user.id);
  if (profileErr) {
    console.error("[tos-consent] profile update failed:", profileErr.message);
    // Log row already persisted; client can proceed. The gate re-checks
    // the profile flag on next nav, so a missed flag re-prompts the
    // user rather than silently letting them through.
  }

  return NextResponse.json({ ok: true, version: TOS_VERSION });
}
