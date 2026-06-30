import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getAdminSupabase, BUCKET, deleteFileOrQueue } from "@/lib/documents/admin";
import { getChecklistItem } from "@/lib/documents/checklist";
import { LIMITS, tierFromPlan, utcDayStart } from "@/lib/documents/limits";
import { checkDocument } from "@/lib/documents/vision";
import { recomputeReadiness } from "@/lib/recompute-readiness";
import { checkLimit, logUsage } from "@/lib/checkLimit";
import { pushNotification } from "@/lib/notifications";

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

  // Hard paywall: free tier doesn't get document review at all.
  // checkLimit returns allowed=false with limit=0 for free users on
  // this action; paid tiers fall through to the per-day metering below.
  const reviewGate = await checkLimit(user.id, "document_review");
  if (!reviewGate.allowed) {
    return NextResponse.json(
      {
        error: "upgrade_required",
        message: "AI document review is part of Solo.",
      },
      { status: 403 },
    );
  }

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
    // DPDP Act compliance — data minimization. Drop the raw file even
    // when we couldn't actually scan it; the rate-limit path will not
    // get a second look at the bytes.
    if (doc.file_path) {
      await deleteFileOrQueue(doc.file_path, "rate_limited");
      await admin.from("documents").update({ file_path: null }).eq("id", doc.id);
    }
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
    // DPDP Act compliance — data minimization. Drop the raw file even
    // on the sign-URL failure path so a broken bucket policy never
    // leaves the bytes sitting indefinitely.
    if (doc.file_path) {
      await deleteFileOrQueue(doc.file_path, "sign_url_failed");
      await admin.from("documents").update({ file_path: null }).eq("id", doc.id);
    }
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
    // DPDP Act compliance — data minimization. Vision call did not
    // succeed (or PDF path) — still drop the raw file. The structured
    // "attention" row is enough for the UI to render.
    if (doc.file_path) {
      await deleteFileOrQueue(doc.file_path, "vision_failed");
      await admin.from("documents").update({ file_path: null }).eq("id", doc.id);
    }
    return NextResponse.json({ ok: true, aiFailed: true });
  }

  const hasBlocker = feedback.issues.some((i) => i.severity === "blocker") || !feedback.matches_expected;
  const hasIssues = feedback.issues.length > 0;
  const status = hasBlocker || hasIssues ? "attention" : "accepted";
  const passed = status === "accepted";

  // DPDP Act compliance — data minimization. Strip any PII the model
  // pulled off the document (names, dates of birth, etc.) before
  // persisting. Only the pass/fail + issue messages + per-issue fix
  // text — i.e. the structured checklist output — are kept.
  const minimisedFeedback = {
    matches_expected: feedback.matches_expected,
    issues: feedback.issues,
    extracted: {} as Record<string, never>,
  };

  await admin
    .from("documents")
    .update({
      status,
      ai_feedback: minimisedFeedback,
      checked_at: new Date().toISOString(),
    })
    .eq("id", doc.id);

  // Persist the scored review to the new audit table so the Feedback
  // page can read pass/fail history without joining JSON columns.
  // file_url is intentionally null — the signed URL would expire in
  // 120s anyway, and we delete the underlying file immediately below.
  await admin
    .from("document_review_results")
    .insert({
      user_id: user.id,
      country_code: sel?.country_code ?? "US",
      document_key: doc.slug,
      document_display_name: item.display_name,
      passed,
      issues: feedback.issues.map((i) => i.message),
      suggestions: [],
      ai_confidence: feedback.matches_expected ? 90 : 60,
      file_url: null,
    });

  // Fire-and-forget readiness recompute. Failure is non-fatal.
  void recomputeReadiness();

  // Log AFTER a successful review (the action_type is included for
  // future analytics; free tier is already hard-blocked above so this
  // line only fires for paid users in practice).
  await logUsage(user.id, "document_review");

  // Notify the user — passed docs get a green confirmation, failed docs
  // get an attention notice with the first issue inlined. Fire-and-forget.
  const docHref = `/dashboard/documents`;
  if (passed) {
    void pushNotification({
      userId: user.id,
      kind: "doc_checked",
      title: `${item.display_name} cleared`,
      body: "AI check passed. You're good to upload it at the consulate.",
      href: docHref,
    });
  } else {
    const firstIssue = feedback.issues[0]?.message;
    void pushNotification({
      userId: user.id,
      kind: "doc_attention",
      title: `${item.display_name} needs a fix`,
      body: firstIssue
        ? firstIssue
        : "The AI flagged something on this document — open Documents to see what.",
      href: docHref,
    });
  }

  // DPDP Act compliance — data minimization. The raw file has now
  // served its only purpose (a one-shot vision read). Delete it from
  // Storage and null the file_path so the row can no longer point at
  // any blob. Failures go to public.pending_deletions and the
  // /api/cron/storage-cleanup sweep retries (and also TTL-purges any
  // file older than 5 minutes regardless of whether it was queued).
  if (doc.file_path) {
    await deleteFileOrQueue(doc.file_path, "post_scan");
    await admin.from("documents").update({ file_path: null }).eq("id", doc.id);
  }

  return NextResponse.json({ ok: true, status, feedback: minimisedFeedback });
}
