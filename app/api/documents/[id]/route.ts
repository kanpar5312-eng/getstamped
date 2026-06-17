import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getAdminSupabase, BUCKET } from "@/lib/documents/admin";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: "storage not configured" }, { status: 500 });

  const { id } = await params;
  const { data: doc } = await admin
    .from("documents")
    .select("id, user_id, file_path, slug")
    .eq("id", id)
    .maybeSingle();
  if (!doc || doc.user_id !== user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (doc.file_path) {
    await admin.storage.from(BUCKET).remove([doc.file_path]);
  }
  // Reset the row to 'missing' so the checklist item stays visible
  await admin
    .from("documents")
    .update({
      status: "missing",
      file_path: null,
      file_size: null,
      mime_type: null,
      ai_feedback: null,
      uploaded_at: null,
      checked_at: null,
    })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
