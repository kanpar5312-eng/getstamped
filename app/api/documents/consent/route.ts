import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/documents/admin";
import { DOCUMENT_CONSENT_VERSION } from "@/lib/documents/consent";

/* ════════════════════════════════════════════════════════════════════════
   POST /api/documents/consent
   Records the user's affirmative consent to upload documents into the
   transient scan pipeline. Two writes:
     1. profiles.document_consent_version = <current version>
     2. document_consent_log (append-only row with ip_address)

   DPDP Act compliance — data minimization + affirmative consent. Do NOT
   add any fields here that capture document contents or PII beyond the
   IP address (already a standard audit field).
   ════════════════════════════════════════════════════════════════════════ */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    // x-forwarded-for can be a comma-separated list; the client is the first hop.
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

  // Append-only log row.
  const { error: logErr } = await admin.from("document_consent_log").insert({
    user_id: user.id,
    consent_type: DOCUMENT_CONSENT_VERSION,
    ip_address: ip,
  });
  if (logErr) {
    console.error("[consent] log insert failed:", logErr.message);
    return NextResponse.json({ error: "log_failed" }, { status: 500 });
  }

  // Short-circuit flag on the profile so the modal doesn't reappear.
  const { error: profileErr } = await admin
    .from("profiles")
    .update({ document_consent_version: DOCUMENT_CONSENT_VERSION })
    .eq("id", user.id);
  if (profileErr) {
    console.error("[consent] profile update failed:", profileErr.message);
    // Log row already wrote — return ok so the client can proceed. Next
    // page load will re-show the modal but the audit trail is intact.
  }

  return NextResponse.json({ ok: true, version: DOCUMENT_CONSENT_VERSION });
}
