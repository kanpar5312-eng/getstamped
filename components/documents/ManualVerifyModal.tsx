"use client";

/* ════════════════════════════════════════════════════════════════════════
   ManualVerifyModal — the "I'll verify manually" alternative to AI
   upload. Shows the same example mockup used by ExampleModal, plus the
   checklist of what to look for (reuses aiChecks — literally the same
   content: "what the AI checks" doubles as "what to check yourself"),
   a visible warning that manual review is formatting-only, and a
   confirm button that self-attests the document matches.

   No file is ever selected, read, or sent from this modal — clicking
   confirm only POSTs { slug } to /api/documents/verify-manual.
   ═════════════════════════════════════════════════════════════════════════ */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { getDocumentExample } from "@/components/documents/examples";

type Props = {
  slug: string;
  displayName: string;
  isOpen: boolean;
  onClose: () => void;
  /** Called after the server confirms the manual verification. */
  onVerified: () => void;
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ManualVerifyModal({ slug, displayName, isOpen, onClose, onVerified }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Reset transient state each time the modal opens for a (possibly
  // different) document.
  useEffect(() => {
    if (isOpen) {
      setSubmitting(false);
      setError(null);
    }
  }, [isOpen, slug]);

  if (typeof document === "undefined") return null;

  const example = getDocumentExample(slug);
  const title = example?.title ?? displayName;

  const confirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/documents/verify-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        setError(data?.error || "Could not save. Try again.");
        setSubmitting(false);
        return;
      }
      onVerified();
    } catch {
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Verify manually: ${title}`}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 55,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "max(env(safe-area-inset-top), 16px) 16px max(env(safe-area-inset-bottom), 16px)",
            background: "rgba(11, 30, 63, 0.42)",
            backdropFilter: "blur(4px)",
          }}
        >
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              background: "var(--color-paper, #FAF8F4)",
              color: "var(--color-ink, #1C1917)",
              borderRadius: 20,
              maxWidth: 620,
              width: "100%",
              maxHeight: "88vh",
              overflowY: "auto",
              padding: 36,
              WebkitOverflowScrolling: "touch",
              boxShadow: "0 40px 100px -30px rgba(11,30,63,0.4)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "transparent",
                border: "none",
                color: "var(--color-muted, #857F73)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="hover:bg-[var(--color-paper-deep)]/40 transition-colors"
            >
              <CloseIcon />
            </button>

            <div style={{ paddingRight: 32 }}>
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: "var(--color-persimmon, #E8622A)",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Verify manually
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-display-stack)",
                  fontSize: 26,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                  marginTop: 8,
                  marginBottom: 4,
                  fontWeight: 400,
                }}
              >
                {title}
              </h2>
              <p style={{ fontSize: 13, color: "var(--color-ink-soft, #2A3F5F)", lineHeight: 1.6, margin: 0 }}>
                Compare your document to the example below. If yours matches every item on the
                checklist, confirm — nothing is uploaded.
              </p>
            </div>

            {example ? (
              <>
                <div style={{ marginTop: 20 }}>{example.mockup}</div>

                <section style={{ marginTop: 28 }}>
                  <h3
                    style={{
                      fontSize: 12,
                      color: "var(--color-ink-soft, #2A3F5F)",
                      textTransform: "uppercase",
                      letterSpacing: "0.3em",
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    Check for these
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0 0" }}>
                    {example.aiChecks.map((c, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          padding: "9px 0",
                          borderBottom: "1px solid rgba(11,30,63,0.08)",
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}
                      >
                        <span aria-hidden style={{ color: "var(--color-persimmon, #E8622A)", fontWeight: 700, lineHeight: 1.4 }}>
                          ✓
                        </span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <p style={{ marginTop: 28, fontSize: 13, color: "var(--color-muted, #857F73)" }}>
                No visual example is available for this document yet — use the checklist below.
              </p>
            )}

            {/* Required warning, per spec, always shown above the confirm button */}
            <div
              role="note"
              style={{
                marginTop: 24,
                padding: "14px 16px",
                borderRadius: 12,
                background: "rgba(232, 98, 42, 0.06)",
                border: "1px solid rgba(232, 98, 42, 0.25)",
                fontSize: 12.5,
                lineHeight: 1.6,
                color: "var(--color-ink-soft, #2A3F5F)",
              }}
            >
              Manual verification checks formatting only. Our AI can catch details manual review
              might miss — like faint signatures or subtle date errors. Upload is recommended for
              the most thorough check.
            </div>

            {error && (
              <p style={{ marginTop: 12, fontSize: 12.5, color: "#C03A1F" }} role="alert">
                {error}
              </p>
            )}

            <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={confirm}
                disabled={submitting}
                style={{
                  flex: "1 1 auto",
                  padding: "12px 20px",
                  borderRadius: 12,
                  border: "none",
                  background: "var(--color-persimmon, #E8622A)",
                  color: "var(--color-paper, #FAF8F4)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: submitting ? "default" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Saving…" : "This matches — mark as verified"}
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: "1px solid var(--color-border, rgba(11,30,63,0.16))",
                  background: "transparent",
                  color: "var(--color-ink-soft, #2A3F5F)",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
