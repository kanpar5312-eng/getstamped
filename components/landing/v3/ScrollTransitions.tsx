"use client";

/* ════════════════════════════════════════════════════════════════════════════
   ScrollTransitions — three scroll-driven spatial pivots on the v3 landing.

   ONE rAF-throttled scroll listener. No React state (direct style writes only —
   60fps state updates would be a re-render disaster). Sections are queried by
   id once on mount; if any is missing the relevant transition is skipped.

   1. THE FOLD     Playbook → Document Vault
      Outgoing playbook curls away (shallow rotateX + inset shadow); incoming
      demos arrive with a faint scale + brightness lift.

   2. THE PORTAL   Parent Share → Pricing
      A circle of the pricing section opens from top-center and expands to fill,
      with a barely-there persimmon edge warmth. Outgoing parent-share dims.

   3. THE DESCENT  FAQ → Closer
      FAQ recedes (translateZ back, slight rotateX + 2px blur — depth of field);
      closer rises to meet you. A persimmon cursor pool fades in past 70%.

   Color pivots from the original spec are intentionally dropped: v3 is an
   all-light page, so these are spatial-only. The mechanics (perspective, blur,
   clip-path) carry the feeling.

   prefers-reduced-motion → the effect is a complete no-op: nothing is queried,
   no listeners attach, sections scroll normally.
   ═════════════════════════════════════════════════════════════════════════ */

import { useEffect } from "react";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const sub = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
/* strong ease-out, matches the rest of the site */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function ScrollTransitions() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const $ = (id: string) => document.getElementById(id) as HTMLElement | null;

    const playbook = $("playbook");
    const documentVault = $("document-vault");
    const parentShare = $("parent-share");
    const pricing = $("pricing");
    const faq = $("faq");
    const closer = $("closer");
    const portalGlow = pricing?.querySelector<HTMLElement>(".v3-portal-glow") ?? null;
    const closerGlow = closer?.querySelector<HTMLElement>(".v3-closer-glow") ?? null;

    /* Track which elements currently hold will-change so we can release it. */
    const willChange = new Set<HTMLElement>();
    const setWC = (el: HTMLElement | null, on: boolean) => {
      if (!el) return;
      if (on && !willChange.has(el)) {
        el.style.willChange = "transform, opacity, filter, clip-path";
        willChange.add(el);
      } else if (!on && willChange.has(el)) {
        el.style.willChange = "auto";
        willChange.delete(el);
      }
    };

    /* Boundary progress: 0 when the incoming section's top sits at the bottom
       of the viewport, 1 when it reaches the top. */
    const boundaryProgress = (incoming: HTMLElement, vh: number) => {
      const top = incoming.getBoundingClientRect().top;
      return clamp01((vh - top) / vh);
    };

    /* ── Closer cursor glow (descent transition only, gated past 70%) ── */
    const glow = { tx: 0, ty: 0, x: 0, y: 0, active: false };
    const onCloserMove = (e: MouseEvent) => {
      if (!closer) return;
      const r = closer.getBoundingClientRect();
      glow.tx = e.clientX - r.left;
      glow.ty = e.clientY - r.top;
    };
    const onCloserLeave = () => {
      if (closerGlow) closerGlow.style.opacity = "0";
    };
    closer?.addEventListener("mousemove", onCloserMove);
    closer?.addEventListener("mouseleave", onCloserLeave);

    let ticking = false;

    const update = () => {
      ticking = false;
      const vh = window.innerHeight;

      /* ── 1. THE FOLD ── Playbook → Document Vault ── */
      if (playbook && documentVault) {
        const p = boundaryProgress(documentVault, vh);
        const active = p > 0.001 && p < 0.999;
        setWC(playbook, active);
        setWC(documentVault, active);

        // Outgoing playbook: fold away over 0.3 → 0.8
        const f = easeOut(sub(p, 0.3, 0.8));
        if (f <= 0) {
          playbook.style.transform = "";
          playbook.style.opacity = "";
          playbook.style.boxShadow = "";
        } else {
          playbook.style.transformOrigin = "center top";
          playbook.style.transform = `perspective(1200px) rotateX(${(-4 * f).toFixed(2)}deg)`;
          playbook.style.opacity = (1 - 0.7 * f).toFixed(3);
          playbook.style.boxShadow = `inset 0 -80px 60px -40px rgba(15,20,25,${(0.4 * f).toFixed(3)})`;
        }

        // Incoming demos: scale 1.015 → 1, brightness 0.85 → 1 over same range
        const g = easeOut(sub(p, 0.3, 0.8));
        if (g <= 0) {
          documentVault.style.transform = "";
          documentVault.style.filter = "";
        } else if (g >= 1) {
          documentVault.style.transform = "";
          documentVault.style.filter = "";
        } else {
          const scale = 1.015 - 0.015 * g;
          const bright = 0.85 + 0.15 * g;
          documentVault.style.transform = `scale(${scale.toFixed(4)})`;
          documentVault.style.filter = `brightness(${bright.toFixed(3)})`;
        }
      }

      /* ── 2. THE PORTAL ── Parent Share → Pricing ── */
      if (parentShare && pricing) {
        const p = boundaryProgress(pricing, vh);
        const active = p > 0.001 && p < 0.82;
        setWC(pricing, active);
        setWC(parentShare, p > 0.001 && p < 0.82);

        // Pricing clip-path circle opens 0.15 → 0.75, then cleared for perf
        if (p < 0.15) {
          pricing.style.clipPath = "circle(0% at 50% 0%)";
          if (portalGlow) portalGlow.style.opacity = "0";
        } else if (p < 0.78) {
          const r = easeOut(sub(p, 0.15, 0.75)) * 130;
          pricing.style.clipPath = `circle(${r.toFixed(1)}% at 50% 0%)`;
          // edge warmth peaks mid-open, fades as it completes
          if (portalGlow) {
            const mid = 1 - Math.abs(sub(p, 0.15, 0.75) - 0.5) * 2;
            portalGlow.style.opacity = (mid * 0.9).toFixed(3);
          }
        } else {
          pricing.style.clipPath = "none";
          if (portalGlow) portalGlow.style.opacity = "0";
        }

        // Outgoing parent-share dims (kept mild — both sections are light)
        const d = easeOut(sub(p, 0.3, 0.8));
        if (d <= 0) {
          parentShare.style.opacity = "";
          parentShare.style.filter = "";
        } else {
          parentShare.style.opacity = (1 - 0.25 * d).toFixed(3);
          parentShare.style.filter = `brightness(${(1 - 0.15 * d).toFixed(3)})`;
        }
      }

      /* ── 3. THE DESCENT ── FAQ → Closer ── */
      if (faq && closer) {
        const p = boundaryProgress(closer, vh);
        const active = p > 0.001 && p < 0.999;
        setWC(faq, active);
        setWC(closer, active);

        // Outgoing FAQ recedes over 0.4 → 0.9.
        // Filter:blur during scroll trashes paint perf — same depth-of-field
        // illusion via a slightly larger translateZ + opacity drop.
        const r = easeOut(sub(p, 0.4, 0.9));
        if (r <= 0) {
          faq.style.transform = "";
          faq.style.opacity = "";
        } else {
          const tz = -140 * r;
          const ty = -30 * r;
          const rx = 2.5 * r;
          faq.style.transformOrigin = "center bottom";
          faq.style.transform = `perspective(1000px) translateY(${ty.toFixed(1)}px) translateZ(${tz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg)`;
          faq.style.opacity = (1 - 0.7 * r).toFixed(3);
        }

        // Incoming closer rises to meet you over 0 → 0.7
        const c = easeOut(sub(p, 0, 0.7));
        if (c >= 1) {
          closer.style.transform = "";
          closer.style.opacity = "";
        } else {
          const tz = 60 * (1 - c);
          const rx = -1.5 * (1 - c);
          closer.style.transform = `perspective(1000px) translateZ(${tz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg)`;
          closer.style.opacity = (0.7 + 0.3 * c).toFixed(3);
        }

        // Cursor glow activates only past 70% of the descent. The continuous
        // glowLoop below handles the actual lerp + paint.
        const nowActive = p > 0.7;
        if (nowActive && !glow.active) startGlowLoop();
        glow.active = nowActive;
        if (closerGlow) closerGlow.style.opacity = glow.active ? "1" : "0";
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    // Cursor-glow lerp loop — runs ONLY while glow.active. When inactive
    // we cancel the rAF entirely instead of looping doing nothing, which
    // saves a 60Hz wake on every scroll frame for everyone whose mouse
    // isn't currently over the closer.
    let glowRaf = 0;
    let glowRunning = false;
    const glowLoop = () => {
      if (closerGlow && glow.active) {
        glow.x += (glow.tx - glow.x) * 0.12;
        glow.y += (glow.ty - glow.y) * 0.12;
        closerGlow.style.background = `radial-gradient(440px circle at ${glow.x.toFixed(0)}px ${glow.y.toFixed(0)}px, rgba(255,91,46,0.14), transparent 60%)`;
        glowRaf = requestAnimationFrame(glowLoop);
      } else {
        glowRunning = false;
      }
    };
    const startGlowLoop = () => {
      if (glowRunning) return;
      glowRunning = true;
      glowRaf = requestAnimationFrame(glowLoop);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update(); // initial paint

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      closer?.removeEventListener("mousemove", onCloserMove);
      closer?.removeEventListener("mouseleave", onCloserLeave);
      cancelAnimationFrame(glowRaf);
      // Release all inline styles we touched
      [playbook, documentVault, parentShare, pricing, faq, closer].forEach((el) => {
        if (!el) return;
        el.style.transform = "";
        el.style.opacity = "";
        el.style.filter = "";
        el.style.boxShadow = "";
        el.style.clipPath = "";
        el.style.willChange = "";
        el.style.transformOrigin = "";
      });
      if (portalGlow) portalGlow.style.opacity = "0";
      if (closerGlow) closerGlow.style.opacity = "0";
    };
  }, []);

  return null;
}
