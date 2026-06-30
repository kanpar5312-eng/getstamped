import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { DocumentsClient, type DocRow } from "@/components/documents/DocumentsClient";
import { CHECKLIST } from "@/lib/documents/checklist";
import { DOCUMENT_CONSENT_VERSION } from "@/lib/documents/consent";

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
  let consentGiven = false;
  const sb = await getServerSupabase();
  const user = await getSessionUser();
  if (sb && user) {
    const [{ data: docsData }, { data: profileRow }] = await Promise.all([
      sb
        .from("documents")
        .select("id, slug, status, file_size, mime_type, ai_feedback, uploaded_at, checked_at")
        .eq("user_id", user.id)
        .is("deleted_at", null),
      sb
        .from("profiles")
        .select("document_consent_version")
        .eq("id", user.id)
        .maybeSingle(),
    ]);
    if (docsData) {
      for (const r of docsData) {
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
    // Modal short-circuits ONLY when the stored version matches the
    // live constant — a future v2 will re-prompt existing users.
    consentGiven = profileRow?.document_consent_version === DOCUMENT_CONSENT_VERSION;
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

  return (
    <DocumentsClient
      plan={profile.plan}
      initialRows={initialRows}
      consentGiven={consentGiven}
    />
  );
}
