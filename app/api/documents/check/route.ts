import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getAdminSupabase, BUCKET } from "@/lib/documents/admin";
import { getChecklistItem } from "@/lib/documents/checklist";
import { LIMITS, tierFromPlan, utcDayStart } from "@/lib/documents/limits";
import { checkDocument } from "@/lib/documents/vision";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = { documentId: string };

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: "storage not configured" }, { status: 500 });

  const { documentId } = (await req.json().catch(() => ({}))) as Partial<Body>;
  if (!documentId) return NextResponse.json({ error: "documentId required" }, { status: 400 });

  // Load the document row and verify ownership
  const { data: doc } = await admin
    .from("documents")
    .select("id, user_id, slug, file_path, mime_type")
    .eq("id", documentId)
    .maybeSingle();

  if (!doc || doc.user_id !== user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const item = getChecklistItem(doc.slug);
  if (!item) return NextResponse.json({ error: "unknown slug" }, { status: 400 });

  // ---------- Plan + tier ----------
  const { data: profile } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  const tier = tierFromPlan(profile?.plan ?? "free");
  const cfg = LIMITS[tier];

  // ---------- Rate-limit check (server-authoritative) ----------
  const dayStart = utcDayStart();
  const [{ count: perDocCount }, { count: globalCount }] = await Promise.all([
    admin
      .from("ai_check_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("document_slug", doc.slug)
      .eq("was_skipped", false)
      .gte("checked_at", dayStart),
    admin
      .from("ai_check_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("was_skipped", false)
      .gte("checked_at", dayStart),
  ]);

  const perDoc = perDocCount ?? 0;
  const global = globalCount ?? 0;

  if (perDoc >= cfg.perDoc || global >= cfg.global) {
    const reason = perDoc >= cfg.perDoc ? "per_document_cap" : "global_cap";
    await admin.from("ai_check_usage").insert({
      user_id: user.id,
      document_id: doc.id,
      document_slug: doc.slug,
      was_skipped: true,
      skip_reason: reason,
    });
    const skipMessage =
      "Daily auto-check limit reached for this document. Upload is saved — we'll check it tomorrow, or upgrade for more checks.";
    await admin
      .from("documents")
      .update({
        status: "attention",
        ai_feedback: {
          matches_expected: true,
          issues: [{ severity: "warning", message: skipMessage }],
          extracted: {},
          rate_limited: true,
          tier,
        },
        checked_at: new Date().toISOString(),
      })
      .eq("id", doc.id);
    return NextResponse.json({ ok: true, rateLimited: true, reason });
  }

  // ---------- Generate signed URL for the vision model ----------
  const { data: signed, error: signErr } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(doc.file_path, 120);
  if (signErr || !signed?.signedUrl) {
    await admin
      .from("documents")
      .update({
        status: "attention",
        ai_feedback: {
          matches_expected: true,
          issues: [
            {
              severity: "warning",
              message: "We couldn't check this automatically. Make sure it's clear and complete.",
            },
          ],
          extracted: {},
        },
        checked_at: new Date().toISOString(),
      })
      .eq("id", doc.id);
    return NextResponse.json({ ok: true, aiFailed: true });
  }

  // ---------- Resolve country context for the AI prompt ----------
  // F-1 preservation: default to U.S. F-1 when the user has no selection
  // (or has selected US). Only non-US selections override the persona.
  let countryName: string | undefined;
  let visaType: string | undefined;
  const { data: sel } = await admin
    .from("user_country_selection")
    .select("country_code")
    .eq("user_id", user.id)
    .maybeSingle();
  if (sel?.country_code && sel.country_code !== "US") {
    const { data: c } = await admin
      .from("visa_countries")
      .select("name, visa_type")
      .eq("code", sel.country_code)
      .maybeSingle();
    countryName = c?.name ?? undefined;
    visaType = c?.visa_type ?? undefined;
  }

  // ---------- Run vision check ----------
  // Vision model needs an image. PDFs aren't directly supported by Groq's
  // current vision model, so PDFs land in attention with a friendly fallback.
  const isImage = (doc.mime_type ?? "").startsWith("image/");
  let feedback = null;
  if (isImage) {
    feedback = await checkDocument(item, signed.signedUrl, { countryName, visaType });
  }

  // Record usage (success or attempted-failure both count)
  await admin.from("ai_check_usage").insert({
    user_id: user.id,
    document_id: doc.id,
    document_slug: doc.slug,
    was_skipped: false,
  });

  if (!feedback) {
    await admin
      .from("documents")
      .update({
        status: "attention",
        ai_feedback: {
          matches_expected: true,
          issues: [
            {
              severity: "warning",
              message: isImage
                ? "We couldn't check this automatically. Make sure it's clear and complete."
                : "PDFs can't be auto-checked yet. Open the file and confirm every required field is visible.",
            },
          ],
          extracted: {},
        },
        checked_at: new Date().toISOString(),
      })
      .eq("id", doc.id);
    return NextResponse.json({ ok: true, aiFailed: true });
  }

  const hasBlocker = feedback.issues.some((i) => i.severity === "blocker") || !feedback.matches_expected;
  const hasIssues = feedback.issues.length > 0;
  const status = hasBlocker || hasIssues ? "attention" : "accepted";

  await admin
    .from("documents")
    .update({
      status,
      ai_feedback: feedback,
      checked_at: new Date().toISOString(),
    })
    .eq("id", doc.id);

  return NextResponse.json({ ok: true, status, feedback });
}
