import { NextResponse } from "next/server";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const sb = await getServerSupabase();
  if (!sb) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const { data } = await sb
    .from("documents")
    .select("id, slug, status, file_size, mime_type, ai_feedback, uploaded_at, checked_at, verification_method")
    .eq("user_id", user.id)
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) return NextResponse.json({ row: null });

  return NextResponse.json({
    row: {
      id: data.id,
      slug: data.slug,
      status: data.status,
      fileSize: data.file_size,
      mimeType: data.mime_type,
      aiFeedback: data.ai_feedback,
      uploadedAt: data.uploaded_at,
      checkedAt: data.checked_at,
      verificationMethod: data.verification_method ?? (data.status === "accepted" ? "ai" : null),
    },
  });
}
