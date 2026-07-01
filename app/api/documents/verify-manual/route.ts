import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/documents/admin";
import { getChecklistItem } from "@/lib/documents/checklist";
import { recomputeReadiness } from "@/lib/recompute-readiness";
import { pushNotification } from "@/lib/notifications";

export const runtime = "nodejs";

type Body = { slug: string };

/* ════════════════════════════════════════════════════════════════════════
   POST /api/documents/verify-manual

   Privacy-conscious alternative to the AI upload/scan flow. No file is
   ever sent — the user reviews their own document against the on-screen
   example + checklist and self-attests that it matches. This route just
   records that attestation.

   DPDP Act compliance — this is the strongest-possible data minimization
   path: nothing is uploaded, so there is nothing to delete. Only the
   verification_method flag + a timestamp are written to the existing
   `documents` row (same row the AI-upload path uses), matching the
   upload route's upsert shape so both paths stay compatible.

   Does NOT touch the AI vision check, the storage upload/delete
   pipeline, or any existing document logic — this is an additive,
   separate write path only.
   ════════════════════════════════════════════════════════════════════════ */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: "storage not configured" }, { status: 500 });

  const { slug } = (await req.json().catch(() => ({}))) as Partial<Body>;
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const item = getChecklistItem(slug);
  if (!item) return NextResponse.json({ error: "unknown document slug" }, { status: 400 });

  const nowIso = new Date().toISOString();

  const { data: row, error: dbErr } = await admin
    .from("documents")
    .upsert(
      {
        user_id: user.id,
        slug,
        display_name: item.display_name,
        phase: item.phase,
        status: "accepted",
        verification_method: "manual",
        // No file for this path — leave file fields untouched if a row
        // already exists (e.g. a prior failed AI attempt); upsert only
        // overwrites the columns listed here.
        ai_feedback: null,
        checked_at: nowIso,
        deleted_at: null,
      },
      { onConflict: "user_id,slug" },
    )
    .select("id, slug, status, verification_method, checked_at")
    .single();

  if (dbErr || !row) {
    return NextResponse.json({ error: dbErr?.message || "db error" }, { status: 500 });
  }

  // Same downstream effects as an accepted AI check — readiness score
  // should reflect this document being done, and the user gets the same
  // confirmation notification (worded for self-verification).
  void recomputeReadiness();
  void pushNotification({
    userId: user.id,
    kind: "doc_checked",
    title: `${item.display_name} marked as verified`,
    body: "You confirmed this document matches the example. No file was uploaded.",
    href: "/dashboard/documents",
  });

  return NextResponse.json({
    ok: true,
    documentId: row.id,
    slug: row.slug,
    status: row.status,
    verificationMethod: row.verification_method,
    checkedAt: row.checked_at,
  });
}
