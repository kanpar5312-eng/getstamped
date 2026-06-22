"use client";

/* ════════════════════════════════════════════════════════════════════════
   ExampleModal — opens an in-code mockup of a single document plus the
   AI-checks / common-mistakes lists. Mockups live in
   /components/documents/examples; this component is just the chrome
   (overlay, animations, header, lists, close handling).

   Closes on ✕ button, overlay click, or Escape. On <768px the modal
   stretches edge-to-edge with reduced padding.
   ═════════════════════════════════════════════════════════════════════════ */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { getDocumentExample } from "@/components/documents/examples";

type Props = {
  documentKey: string;
  displayName?: string;
  isOpen: boolean;
  onClose: () => void;
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ExampleModal({ documentKey, displayName, isOpen, onClose }: Props) {
  // Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (typeof document === "undefined") return null;

  const example = getDocumentExample(documentKey);
  const title = example?.title ?? displayName ?? "Document example";

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
          aria-label={`Example: ${title}`}
          className="gs-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "max(env(safe-area-inset-top), 16px) 16px max(env(safe-area-inset-bottom), 16px)",
          }}
        >
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="gs-example-modal-card gs-modal-card"
            style={{
              color: "var(--color-ink, #1C1B1A)",
              maxWidth: 640,
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: 40,
              WebkitOverflowScrolling: "touch",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close example"
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

            {/* Header */}
            <div style={{ paddingRight: 32 }}>
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: "var(--color-persimmon, #FF5B2E)",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Example
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-display-stack)",
                  fontSize: 28,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                  marginTop: 8,
                  marginBottom: 12,
                  color: "var(--color-ink, #1C1B1A)",
                  fontWeight: 400,
                }}
              >
                {title}
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-ink-soft, #4A4844)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {example?.subtitle ??
                  "This is what a correct version looks like. Yours doesn’t need to match exactly — it needs to pass these checks."}
              </p>
            </div>

            {/* Body */}
            {example ? (
              <>
                <div style={{ marginTop: 24 }}>{example.mockup}</div>

                <section style={{ marginTop: 32 }}>
                  <h3
                    style={{
                      fontSize: 12,
                      color: "var(--color-ink-soft, #4A4844)",
                      textTransform: "uppercase",
                      letterSpacing: "0.3em",
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    What our AI checks
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0 0" }}>
                    {example.aiChecks.map((c, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          padding: "10px 0",
                          borderBottom: "1px solid rgba(28,27,26,0.06)",
                          fontSize: 13,
                          color: "var(--color-ink, #1C1B1A)",
                          lineHeight: 1.5,
                        }}
                      >
                        <span aria-hidden style={{ color: "#1F7A3A", fontWeight: 700, lineHeight: 1.4 }}>✓</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section style={{ marginTop: 24 }}>
                  <h3
                    style={{
                      fontSize: 12,
                      color: "var(--color-ink-soft, #4A4844)",
                      textTransform: "uppercase",
                      letterSpacing: "0.3em",
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    Common mistakes
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0 0" }}>
                    {example.commonMistakes.map((m, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          padding: "10px 0",
                          borderBottom: "1px solid rgba(28,27,26,0.06)",
                          fontSize: 13,
                          color: "var(--color-ink, #1C1B1A)",
                          lineHeight: 1.5,
                        }}
                      >
                        <span aria-hidden style={{ color: "#C03A1F", fontWeight: 700, lineHeight: 1.4 }}>✗</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <p
                style={{
                  marginTop: 32,
                  padding: 48,
                  fontSize: 14,
                  color: "var(--color-muted, #857F73)",
                  textAlign: "center",
                }}
              >
                Example coming soon for this document.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
