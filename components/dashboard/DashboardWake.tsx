"use client";

/**
 * DashboardWake — listens for the `gs:system-wake` event dispatched by
 * PersonalizationCurtain just before it begins fading. Adds a brief class
 * to <html> that triggers a staggered fade-up across direct children of the
 * dashboard <main>. The visual effect: the curtain dissolves while the
 * dashboard "wakes" underneath it, both motions overlapping for ~700ms.
 *
 * Self-cleaning: removes the class after the longest stagger finishes.
 * If the event never fires, this component does nothing.
 */

import { useEffect } from "react";

export function DashboardWake() {
  useEffect(() => {
    const onWake = () => {
      const html = document.documentElement;
      html.classList.add("gs-waking");
      const t = window.setTimeout(() => {
        html.classList.remove("gs-waking");
      }, 1800);
      return t;
    };

    let timer = 0;
    const handler = () => {
      window.clearTimeout(timer);
      timer = onWake();
    };

    // Cross-route handoff: if PersonalizationCurtain ran on /onboarding and
    // navigated us here, it left a sessionStorage flag. Consume it once and
    // trigger the wake right after mount, on the next animation frame so the
    // initial render paints first.
    try {
      if (sessionStorage.getItem("gs.systemWake") === "1") {
        sessionStorage.removeItem("gs.systemWake");
        requestAnimationFrame(() => { timer = onWake(); });
      }
    } catch {}

    window.addEventListener("gs:system-wake", handler);
    return () => {
      window.removeEventListener("gs:system-wake", handler);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
