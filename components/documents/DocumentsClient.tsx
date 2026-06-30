"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CHECKLIST, PHASES, PHASE_TITLES, getChecklistItem } from "@/lib/documents/checklist";
import { CountUp } from "@/components/dashboard/CountUp";
import { ExampleModal } from "@/components/documents/ExampleModal";
import { DocumentConsentModal } from "@/components/documents/DocumentConsentModal";
import { getDocumentExample } from "@/components/documents/examples";
import { notifyNetworkError } from "@/components/NetworkToast";

type Plan = "free" | "solo" | "family";

export type DocStatus = "missing" | "uploading" | "checking" | "attention" | "accepted";

export type AiIssue = {
  severity: "blocker" | "warning";
  message: string;
  /** Optional actionable correction shown below the message. */
  fix?: string;
};

export type DocRow = {
  id: string | null;
  slug: string;
  status: DocStatus;
  fileSize: number | null;
  mimeType: string | null;
  aiFeedback: {
    matches_expected?: boolean;
    issues?: AiIssue[];
    extracted?: Record<string, string>;
    rate_limited?: boolean;
  } | null;
  uploadedAt: string | null;
  checkedAt: string | null;
};

type Props = {
  plan: Plan;
  initialRows: DocRow[];
  /** True if the user has already confirmed the current document-upload
   *  privacy consent version. When false, the first upload attempt
   *  pops the DocumentConsentModal. DPDP Act compliance. */
  consentGiven: boolean;
};

const ACCEPTED_INPUT = ".pdf,.jpg,.jpeg,.png,.webp";
const MAX_BYTES = 10 * 1024 * 1024;

export function DocumentsClient({ plan, initialRows, consentGiven }: Props) {
  const [rows, setRows] = useState<DocRow[]>(initialRows);
  const [openPhase, setOpenPhase] = useState<number>(1);
  const [detailDocId, setDetailDocId] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  // DPDP Act compliance — affirmative consent gate. Tracks whether the
  // current session has agreed to the active consent version. Initialised
  // from the server-rendered profile flag and flipped true after the
  // user confirms inside the modal.
  const [hasConsent, setHasConsent] = useState<boolean>(consentGiven);
  const [consentOpen, setConsentOpen] = useState(false);
  const pendingUploadRef = useRef<{ slug: string; file: File } | null>(null);

  const isLocked = useCallback((phase: number) => plan === "free" && phase > 1, [plan]);

  const acceptedCount = rows.filter((r) => r.status === "accepted").length;
  const totalCount = rows.length;
  const pct = Math.round((acceptedCount / Math.max(1, totalCount)) * 100);

  const updateRow = useCallback((slug: string, patch: Partial<DocRow>) => {
    setRows((prev) => prev.map((r) => (r.slug === slug ? { ...r, ...patch } : r)));
  }, []);

  const refreshRow = useCallback(
    async (slug: string) => {
      try {
        const r = await fetch(
          `/api/documents/state?slug=${encodeURIComponent(slug)}`,
          { cache: "no-store" },
        );
        if (!r.ok) return;
        const data = await r.json();
        if (data?.row) updateRow(slug, data.row);
      } catch {
        /* ignore */
      }
    },
    [updateRow],
  );

  const handleUpload = useCallback(
    async (slug: string, file: File) => {
      const item = getChecklistItem(slug);
      if (!item) return;
      if (isLocked(item.phase)) {
        setPaywallOpen(true);
        return;
      }
      // DPDP Act compliance — affirmative consent gate. First-time
      // uploaders see the privacy modal; the actual upload runs after
      // they confirm.
      if (!hasConsent) {
        pendingUploadRef.current = { slug, file };
        setConsentOpen(true);
        return;
      }
      if (file.size > MAX_BYTES) {
        updateRow(slug, {
          status: "attention",
          aiFeedback: {
            issues: [
              {
                severity: "blocker",
                message: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Limit is 10 MB.`,
                fix: "Compress the PDF or export the photo at a lower resolution, then upload again.",
              },
            ],
          },
        });
        return;
      }
      if (
        !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type)
      ) {
        updateRow(slug, {
          status: "attention",
          aiFeedback: {
            issues: [
              {
                severity: "blocker",
                message: "Only PDF, JPG, PNG, or WEBP files are accepted.",
                fix: "Re-save the file as PDF, JPG, PNG, or WEBP — most phones can export from Photos directly.",
              },
            ],
          },
        });
        return;
      }

      updateRow(slug, { status: "uploading" });
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      try {
        const r = await fetch("/api/documents/upload", { method: "POST", body: form });
        const data = await r.json();
        if (!r.ok || !data.ok) {
          updateRow(slug, {
            status: "attention",
            aiFeedback: {
              issues: [
                {
                  severity: "blocker",
                  message: data.error ?? "Upload failed.",
                  fix: "Check your connection and try uploading the same file again.",
                },
              ],
            },
          });
          return;
        }
        const docId: string = data.documentId;
        updateRow(slug, {
          id: docId,
          status: "checking",
          uploadedAt: new Date().toISOString(),
          fileSize: file.size,
          mimeType: file.type,
        });
        const c = await fetch("/api/documents/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: docId }),
        });
        const cdata = await c.json().catch(() => ({}));
        if (c.ok) {
          await refreshRow(slug);
        } else {
          updateRow(slug, {
            status: "attention",
            aiFeedback: {
              issues: [
                {
                  severity: "warning",
                  message:
                    cdata.error ??
                    "We couldn't check this automatically.",
                  fix: "Re-scan on a flat surface in bright, even light and re-upload — that fixes most check failures.",
                },
              ],
            },
          });
        }
      } catch {
        notifyNetworkError();
        updateRow(slug, {
          status: "attention",
          aiFeedback: {
            issues: [
              {
                severity: "blocker",
                message: "Network error during upload.",
                fix: "Check your internet connection and tap Upload again.",
              },
            ],
          },
        });
      }
    },
    [isLocked, updateRow, refreshRow, hasConsent],
  );

  // DPDP Act compliance — fired by DocumentConsentModal once the server
  // has recorded the consent log row. Flip local state so subsequent
  // uploads skip the modal, then drain the pending upload.
  const onConsentConfirmed = useCallback(() => {
    setHasConsent(true);
    setConsentOpen(false);
    const pending = pendingUploadRef.current;
    pendingUploadRef.current = null;
    if (pending) {
      void handleUpload(pending.slug, pending.file);
    }
  }, [handleUpload]);

  const onConsentCancelled = useCallback(() => {
    setConsentOpen(false);
    pendingUploadRef.current = null;
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1140px] py-8">
      {/* Header */}
      <header className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p data-eyebrow="">Your file vault</p>
          <h1 className="mt-4 font-display text-[36px] sm:text-[44px] tracking-tight text-[var(--ink)] leading-[1.05]">
            Your documents.
          </h1>
          <p className="mt-2 text-[14px] text-[var(--ink-soft)]">
            We auto-check what you upload. Final judgment rests with the consulate.
          </p>
        </div>
        <div className="min-w-[260px]">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[28px] tracking-tight text-[var(--ink)] leading-none">
              <CountUp value={acceptedCount} duration={900} /> of {totalCount} ready
            </span>
            <span className="text-[12px] text-[var(--stone)] tabular-nums">{pct}%</span>
          </div>
          <div className="mt-3 h-1 w-full rounded-full bg-[var(--surface-sunken)] overflow-hidden">
            <div className="progress-ember h-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </header>

      {/* Phase groups */}
      <div className="mt-10 space-y-3">
        {PHASES.map((phase) => {
          const items = CHECKLIST.filter((c) => c.phase === phase);
          const phaseRows = items.map((c) => rows.find((r) => r.slug === c.slug)!);
          const accepted = phaseRows.filter((r) => r.status === "accepted").length;
          const open = openPhase === phase;
          const locked = isLocked(phase);
          return (
            <section
              key={phase}
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenPhase(open ? -1 : phase)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={open}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span data-eyebrow="">Phase {phase}</span>
                  <span className="font-display text-[18px] text-[var(--ink)] tracking-tight truncate">
                    {PHASE_TITLES[phase]}
                  </span>
                  {locked && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[var(--stone)] uppercase tracking-[0.12em]">
                      <LockGlyph /> Locked
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[var(--stone)] tabular-nums">
                    {accepted}/{items.length} ready
                  </span>
                  <Chevron open={open} />
                </div>
              </button>
              {/* Smooth height transition via grid-template-rows trick.
                  Closed: 0fr (collapsed). Open: 1fr (natural content height).
                  No JS measurement needed; transitions both height + opacity. */}
              <div
                className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                style={{
                  gridTemplateRows: open ? "1fr" : "0fr",
                  opacity: open ? 1 : 0,
                }}
                aria-hidden={!open}
              >
                <div className="overflow-hidden min-h-0">
                  <ul className="border-t border-[var(--line)] divide-y divide-[var(--line)]">
                    {items.map((c) => {
                      const row = rows.find((r) => r.slug === c.slug)!;
                      return (
                        <DocumentRowView
                          key={c.slug}
                          displayName={c.display_name}
                          why={c.why}
                          acceptedFormats={c.acceptedFormats}
                          row={row}
                          locked={locked}
                          onUpload={(f) => handleUpload(c.slug, f)}
                          onLocked={() => setPaywallOpen(true)}
                          onOpenDetail={() => row.id && setDetailDocId(row.id)}
                        />
                      );
                    })}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}

        {/* Phase 5 — always locked */}
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 flex items-center justify-between gap-3 opacity-60">
          <div className="flex items-center gap-3">
            <span data-eyebrow="">Phase 5</span>
            <span className="font-display text-[18px] text-[var(--ink)] tracking-tight">
              {PHASE_TITLES[5]}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--stone)] uppercase tracking-[0.12em]">
            <LockGlyph /> Unlocks after approval
          </span>
        </section>
      </div>

      {/* Detail panel */}
      {detailDocId && (
        <DetailPanel
          docId={detailDocId}
          row={rows.find((r) => r.id === detailDocId)}
          onClose={() => setDetailDocId(null)}
          onDeleted={(slug) => {
            updateRow(slug, {
              id: null,
              status: "missing",
              fileSize: null,
              mimeType: null,
              aiFeedback: null,
              uploadedAt: null,
              checkedAt: null,
            });
            setDetailDocId(null);
          }}
        />
      )}

      {/* Paywall modal */}
      {paywallOpen && <PaywallModal onClose={() => setPaywallOpen(false)} />}

      {/* DPDP Act compliance — first-upload privacy consent. */}
      <DocumentConsentModal
        open={consentOpen}
        onCancel={onConsentCancelled}
        onConfirmed={onConsentConfirmed}
      />
    </div>
  );
}

// =============================================================================
// Row
// =============================================================================

function DocumentRowView({
  displayName,
  why,
  acceptedFormats,
  row,
  locked,
  onUpload,
  onLocked,
  onOpenDetail,
}: {
  displayName: string;
  why: string;
  acceptedFormats: ("pdf" | "jpg" | "png")[];
  row: DocRow;
  locked: boolean;
  onUpload: (f: File) => void;
  onLocked: () => void;
  onOpenDetail: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [expand, setExpand] = useState(false);
  const [exampleOpen, setExampleOpen] = useState(false);

  useEffect(() => {
    if (row.status === "attention") setExpand(true);
  }, [row.status]);

  const onFileChosen = (f: File | undefined) => {
    if (!f) return;
    if (locked) {
      onLocked();
      return;
    }
    onUpload(f);
  };

  const trigger = () => {
    if (locked) return onLocked();
    inputRef.current?.click();
  };

  const dashedBorder = dragOver
    ? "outline outline-2 outline-dashed outline-[var(--ember)] -outline-offset-2"
    : "";

  const fmtList = acceptedFormats.map((f) => f.toUpperCase()).join(" · ");

  return (
    <li
      className={`relative px-5 py-4 transition-colors ${locked ? "opacity-60" : ""} ${dashedBorder}`}
      onDragOver={(e) => {
        if (locked) return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        onFileChosen(f);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_INPUT}
        className="sr-only"
        onChange={(e) => onFileChosen(e.target.files?.[0])}
      />
      <div className="flex items-start gap-4">
        <StatusIcon status={row.status} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-medium text-[var(--ink)]">{displayName}</span>
            <span className="text-[11px] text-[var(--stone)] uppercase tracking-[0.08em]">
              {fmtList}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[var(--ink-soft)] leading-snug">{why}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusChip status={row.status} />
          {/* Example trigger — only render when we actually have a mockup
              for this slug; otherwise the button would just be a dead-end
              "Example coming soon" pop-up. */}
          {getDocumentExample(row.slug) && (
            <button
              type="button"
              onClick={() => setExampleOpen(true)}
              className="inline-flex items-center rounded-md border border-[rgba(28,27,26,0.2)] bg-transparent px-3 py-1 text-[12px] text-[var(--stone)] hover:border-[var(--ember)] hover:text-[var(--ember)] transition-colors"
              aria-label={`See an example of ${displayName}`}
            >
              Example
            </button>
          )}
          {row.status === "missing" || row.status === "attention" ? (
            <button
              type="button"
              onClick={trigger}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-[6px] text-[12px] font-medium text-[var(--ink)] hover:border-[var(--line-hover)] transition-colors"
            >
              {row.status === "attention" ? "Replace" : "Upload"}
            </button>
          ) : row.id ? (
            <button
              type="button"
              onClick={onOpenDetail}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-[6px] text-[12px] font-medium text-[var(--ink)] hover:border-[var(--line-hover)] transition-colors"
            >
              View
            </button>
          ) : null}
        </div>
      </div>

      {expand &&
        row.status === "attention" &&
        row.aiFeedback?.issues &&
        row.aiFeedback.issues.length > 0 && (
          <div className="mt-3 ml-8 rounded-lg bg-[var(--surface-sunken)] p-3">
            <ul className="space-y-1.5">
              {row.aiFeedback.issues.map((i, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[13px]">
                  <span
                    className={
                      i.severity === "blocker"
                        ? "mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-[var(--ember)]"
                        : "mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-[var(--stone)]"
                    }
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[var(--ink-soft)]">{i.message}</span>
                    {i.fix && (
                      <span className="text-[12px] text-[var(--ink-soft)] opacity-80">
                        <span className="font-semibold text-[var(--ink)]">
                          Fix:
                        </span>{" "}
                        {i.fix}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {row.aiFeedback?.rate_limited && (
              <Link
                href="/dashboard/upgrade"
                className="mt-3 inline-block text-[12px] font-medium text-[var(--ember-hover)] hover:text-[var(--ember)]"
              >
                Upgrade for more checks →
              </Link>
            )}
          </div>
        )}

      {row.status === "accepted" && (
        <p className="mt-2 ml-8 text-[11px] text-[var(--stone)] leading-relaxed">
          Checked by AI — final judgment rests with the consulate.
        </p>
      )}

      {row.status === "uploading" && (
        <span
          aria-hidden
          className="absolute left-0 bottom-0 h-[2px] bg-[var(--ember)]"
          style={{ animation: "upload-fill 1.2s ease-out forwards" }}
        />
      )}
      <ExampleModal
        documentKey={row.slug}
        displayName={displayName}
        isOpen={exampleOpen}
        onClose={() => setExampleOpen(false)}
      />
    </li>
  );
}

// =============================================================================
// Detail Panel
// =============================================================================

function DetailPanel({
  docId,
  row,
  onClose,
  onDeleted,
}: {
  docId: string;
  row: DocRow | undefined;
  onClose: () => void;
  onDeleted: (slug: string) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/documents/${docId}/signed-url`, { cache: "no-store" });
        if (!r.ok) return;
        const data = await r.json();
        if (!cancelled) {
          setUrl(data.url);
          setMimeType(data.mimeType);
          setDisplayName(data.displayName);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [docId]);

  const onDelete = async () => {
    if (!row) return;
    await fetch(`/api/documents/${docId}`, { method: "DELETE" });
    onDeleted(row.slug);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(28,27,26,0.35)" }}
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        className="relative h-full w-full max-w-[480px] bg-[var(--surface)] border-l border-[var(--line)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
          <p className="text-[14px] font-medium text-[var(--ink)]">
            {displayName || "Document"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--stone)] hover:text-[var(--ink)] text-[18px] leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {url && mimeType?.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={displayName} className="w-full" />
          ) : url ? (
            <iframe src={url} className="w-full h-[480px]" title={displayName} />
          ) : (
            <div className="px-5 py-10 text-[13px] text-[var(--stone)]">
              Loading preview…
            </div>
          )}

          <div className="px-5 py-4 space-y-4 border-t border-[var(--line)]">
            {row?.aiFeedback?.issues && row.aiFeedback.issues.length > 0 && (
              <section>
                <p data-eyebrow="">AI feedback</p>
                <ul className="mt-3 space-y-2">
                  {row.aiFeedback.issues.map((i, idx) => (
                    <li
                      key={idx}
                      className="text-[13px] text-[var(--ink-soft)] leading-snug"
                    >
                      <span className="block">{i.message}</span>
                      {i.fix && (
                        <span className="mt-1 block text-[12px] opacity-80">
                          <span className="font-semibold text-[var(--ink)]">
                            Fix:
                          </span>{" "}
                          {i.fix}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {row?.status === "accepted" && (
              <p className="text-[12px] text-[var(--stone)]">
                Checked by AI — final judgment rests with the consulate.
              </p>
            )}

            <section className="text-[12px] text-[var(--stone)] space-y-1">
              {row?.fileSize && <p>Size: {(row.fileSize / 1024 / 1024).toFixed(2)} MB</p>}
              {row?.uploadedAt && (
                <p>Uploaded: {new Date(row.uploadedAt).toLocaleString()}</p>
              )}
            </section>
          </div>
        </div>

        <div className="border-t border-[var(--line)] px-5 py-4 flex items-center gap-2 flex-wrap">
          {url && (
            <a
              href={url}
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-[8px] text-[12px] font-medium text-[var(--ink)] hover:border-[var(--line-hover)] transition-colors"
            >
              Download
            </a>
          )}
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-[8px] text-[12px] font-medium text-[var(--ember-hover)] hover:border-[var(--ember)] transition-colors"
          >
            Delete
          </button>
        </div>

        {confirmDelete && (
          <div className="absolute inset-0 bg-[rgba(28,27,26,0.6)] flex items-center justify-center px-6">
            <div className="bg-[var(--surface)] rounded-2xl p-5 max-w-sm border border-[var(--line)]">
              <p className="font-display text-[18px] text-[var(--ink)]">
                Delete this file?
              </p>
              <p className="mt-2 text-[13px] text-[var(--ink-soft)]">
                The document slot stays in your checklist — you can re-upload anytime.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-[8px] text-[13px] text-[var(--ink-soft)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="btn-ember rounded-lg px-3 py-[8px] text-[13px] font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

// =============================================================================
// Bits
// =============================================================================

function PaywallModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(28,27,26,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface)] rounded-2xl p-6 max-w-md border border-[var(--line)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p data-eyebrow="">Locked</p>
        <h2 className="mt-3 font-display text-[24px] text-[var(--ink)] tracking-tight leading-snug">
          Phase 2 and beyond are on paid plans.
        </h2>
        <p className="mt-2 text-[13px] text-[var(--ink-soft)] leading-relaxed">
          Phase 1 is fully free. Upgrade once for $19 and unlock every phase + unlimited AI checks.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-[10px] text-[13px] text-[var(--ink-soft)]"
          >
            Maybe later
          </button>
          <Link
            href="/dashboard/upgrade"
            className="btn-ember rounded-lg px-4 py-[10px] text-[13px] font-semibold"
          >
            Upgrade for $19 →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: DocStatus }) {
  const base = "mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full";
  if (status === "accepted")
    return (
      <span
        className={`${base} bg-[var(--ember-soft)] text-[var(--ember-hover)]`}
        aria-hidden
      >
        <CheckGlyph />
      </span>
    );
  if (status === "attention")
    return (
      <span
        className={`${base} bg-[var(--ember-soft)] text-[var(--ember-hover)] text-[12px] font-bold`}
        aria-hidden
      >
        !
      </span>
    );
  if (status === "checking" || status === "uploading")
    return (
      <span className={`${base} border border-[var(--ember)]`} aria-hidden>
        <span
          className="block h-1.5 w-1.5 rounded-full bg-[var(--ember)]"
          style={{ animation: "pulse-dot 1.2s ease-in-out infinite" }}
        />
      </span>
    );
  return <span className={`${base} border border-[var(--line-hover)]`} aria-hidden />;
}

function StatusChip({ status }: { status: DocStatus }) {
  const cls =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-[0.06em]";
  if (status === "accepted")
    return (
      <span className={`${cls} bg-[var(--ember-soft)] text-[var(--ember-hover)]`}>
        Checked by AI
      </span>
    );
  if (status === "attention")
    return (
      <span className={`${cls} border border-[var(--ember)] text-[var(--ember-hover)]`}>
        Needs attention
      </span>
    );
  if (status === "checking")
    return (
      <span className={`${cls} border border-[var(--line)] text-[var(--stone)]`}>
        <span
          className="h-1.5 w-1.5 rounded-full bg-[var(--ember)]"
          style={{ animation: "pulse-dot 1.2s ease-in-out infinite" }}
        />
        Checking
      </span>
    );
  if (status === "uploading")
    return (
      <span className={`${cls} border border-[var(--line)] text-[var(--stone)]`}>Uploading</span>
    );
  return (
    <span className={`${cls} border border-[var(--line)] text-[var(--stone)]`}>Missing</span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[var(--stone)] transition-transform duration-200"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function LockGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={12}
      height={12}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={12}
      height={12}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
