import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getAdminSupabase, BUCKET } from "@/lib/documents/admin";

export const runtime = "nodejs";

export async function GET(
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
    .select("id, user_id, file_path, mime_type, display_name")
    .eq("id", id)
    .maybeSingle();
  if (!doc || doc.user_id !== user.id || !doc.file_path) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(doc.file_path, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "could not sign" }, { status: 500 });
  }

  return NextResponse.json({
    url: data.signedUrl,
    mimeType: doc.mime_type,
    displayName: doc.display_name,
  });
}
