import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getAdminSupabase, BUCKET, buildObjectKey } from "@/lib/documents/admin";
import { getChecklistItem } from "@/lib/documents/checklist";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: "storage not configured" }, { status: 500 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  const slug = String(form.get("slug") ?? "");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }

  const item = getChecklistItem(slug);
  if (!item) return NextResponse.json({ error: "unknown document slug" }, { status: 400 });

  // ---------- server-side constraints ----------
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Limit is 10 MB.` },
      { status: 413 },
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "Only PDF, JPG, PNG, or WEBP files are accepted." },
      { status: 415 },
    );
  }

  // ---------- upload to private bucket ----------
  const key = buildObjectKey(user.id, slug, file.name);
  const arrayBuf = await file.arrayBuffer();

  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(key, arrayBuf, {
      contentType: file.type,
      upsert: false,
    });

  if (upErr) {
    return NextResponse.json({ error: upErr.message || "upload failed" }, { status: 500 });
  }

  // ---------- upsert documents row (status='checking') ----------
  const { data: row, error: dbErr } = await admin
    .from("documents")
    .upsert(
      {
        user_id: user.id,
        slug,
        display_name: item.display_name,
        phase: item.phase,
        status: "checking",
        file_path: key,
        file_size: file.size,
        mime_type: file.type,
        uploaded_at: new Date().toISOString(),
        ai_feedback: null,
        checked_at: null,
        deleted_at: null,
      },
      { onConflict: "user_id,slug" },
    )
    .select("id, slug, status")
    .single();

  if (dbErr || !row) {
    return NextResponse.json({ error: dbErr?.message || "db error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, documentId: row.id, slug: row.slug });
}
