import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { DocumentsClient, type DocRow } from "@/components/documents/DocumentsClient";
import { CHECKLIST } from "@/lib/documents/checklist";

export const metadata: Metadata = {
  title: "Documents — GetStamped",
};

type SearchParams = Promise<{ state?: string }>;

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { profile } = await getCurrentUser(sp.state);

  // Load existing document rows; merge with the checklist so missing items
  // still appear.
  const docMap: Record<string, DocRow> = {};
  const sb = await getServerSupabase();
  const user = await getSessionUser();
  if (sb && user) {
    const { data } = await sb
      .from("documents")
      .select("id, slug, status, file_size, mime_type, ai_feedback, uploaded_at, checked_at")
      .eq("user_id", user.id)
      .is("deleted_at", null);
    if (data) {
      for (const r of data) {
        docMap[r.slug] = {
          id: r.id,
          slug: r.slug,
          status: r.status,
          fileSize: r.file_size,
          mimeType: r.mime_type,
          aiFeedback: r.ai_feedback,
          uploadedAt: r.uploaded_at,
          checkedAt: r.checked_at,
        };
      }
    }
  }

  const initialRows: DocRow[] = CHECKLIST.map(
    (c) =>
      docMap[c.slug] ?? {
        id: null,
        slug: c.slug,
        status: "missing",
        fileSize: null,
        mimeType: null,
        aiFeedback: null,
        uploadedAt: null,
        checkedAt: null,
      },
  );

  return <DocumentsClient plan={profile.plan} initialRows={initialRows} />;
}
