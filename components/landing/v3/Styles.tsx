/* ────────────────────────────────────────────────────────────────────────
   v3 landing styles — single shared <style> block. Class-scoped (v3-*).
   ──────────────────────────────────────────────────────────────────────── */

export function Styles() {
  return (
    <style>{`
      .v3-root {
        color: var(--color-ink);
        background: var(--color-paper);
        font-family: var(--font-sans-stack);
        font-feature-settings: "ss01", "ss02";
        font-kerning: normal;
        text-rendering: optimizeLegibility;
      }
      /* Off-screen sections opt out of layout + paint work — biggest single
         scroll-perf win on a long landing. contain-intrinsic-size keeps the
         scrollbar honest so the page height doesn't jiggle as sections enter
         the rendering window. */
      .v3-root main > section,
      .v3-root main > .v3-section {
        content-visibility: auto;
        contain-intrinsic-size: 1px 800px;
      }
      /* Hero is the first paint + has a video; never skip it. */
      .v3-root main > .v3-hero { content-visibility: visible; }
      .v3-root :where(h1,h2,h3,h4,p,ul,ol,li,figure,blockquote,hr){ margin:0; }
      .v3-root ul, .v3-root ol { list-style: none; padding: 0; }
      .v3-root a { color: inherit; text-decoration: none; }
      .v3-root :focus-visible {
        outline: 2px solid var(--color-persimmon);
        outline-offset: 3px;
        border-radius: 6px;
      }

      .v3-mono { font-family: var(--font-mono-stack); font-variant-numeric: tabular-nums; }
      .v3-italic { font-family: var(--font-display-stack); font-style: italic; font-weight: 400; }
      .v3-persimmon { color: var(--color-persimmon); }
      .v3-link {
        color: var(--color-persimmon-deep);
        text-decoration: underline; text-decoration-thickness: 1.5px;
        text-underline-offset: 4px;
        transition: color 200ms var(--ease-soft);
      }
      .v3-link:hover { color: var(--color-persimmon); }

      .v3-text-center { text-align: center; }
      .v3-mx-auto { margin-left: auto; margin-right: auto; }
      .v3-mt-6 { margin-top: 24px; }
      .v3-mt-10 { margin-top: 48px; }
      .v3-max-reading { max-width: 64ch; }

      /* Type ramp */
      .v3-h2 {
        font-family: var(--font-display-stack);
        font-weight: 400;
        font-size: clamp(36px, 5.2vw, 72px);
        line-height: 1.0;
        letter-spacing: -0.020em;
        color: var(--color-ink);
        max-width: 22ch;
        hanging-punctuation: first last;
      }
      .v3-lead {
        font-size: clamp(17px, 1.4vw, 21px);
        line-height: 1.55;
        color: var(--color-ink-soft);
        max-width: 56ch;
      }

      /* Buttons (raw — primary anchors / closer use these; CTA component used elsewhere) */
      .v3-pill, .v3-ghost {
        display: inline-flex; align-items: center; justify-content: center;
        font-family: var(--font-sans-stack);
        font-weight: 600; letter-spacing: -0.005em; font-size: 14.5px;
        height: 44px; padding: 0 24px; border-radius: 999px;
        transition: transform 200ms var(--ease-soft),
          background-color 200ms var(--ease-soft),
          color 200ms var(--ease-soft),
          border-color 200ms var(--ease-soft);
        user-select: none; white-space: nowrap;
      }
      .v3-pill { background: var(--color-persimmon); color: #fff; }
      .v3-ghost {
        background: transparent; color: var(--color-ink);
        border: 1px solid var(--color-border);
      }
      .v3-pill-full, .v3-ghost-full { width: 100%; margin-top: 28px; }
      @media (hover: hover) and (pointer: fine) {
        .v3-pill:hover { background: var(--color-persimmon-deep); }
        .v3-ghost:hover { border-color: var(--color-ink); }
      }
      .v3-pill:active, .v3-ghost:active { transform: scale(0.97); }

      /* ── Header ─────────────────────────────────────────────────────── */
      .v3-header {
        position: sticky; top: 0; z-index: 50;
        /* Heavier opaque tint + lighter blur — same premium look at a fraction
           of the per-frame paint cost. backdrop-filter is one of the most
           expensive properties in the browser. */
        background: rgba(247, 243, 236, 0.92);
        backdrop-filter: saturate(180%) blur(10px);
        -webkit-backdrop-filter: saturate(180%) blur(10px);
        border-bottom: 1px solid rgba(227, 221, 208, 0.6);
        transition: border-color 200ms var(--ease-soft), background-color 200ms var(--ease-soft);
        will-change: background-color;
      }
      .v3-header.is-scrolled {
        background: rgba(247, 243, 236, 0.92);
        border-bottom-color: var(--color-border);
      }
      .v3-header-inner {
        height: 64px; max-width: 1240px; margin: 0 auto;
        padding: 0 24px; display: grid; align-items: center;
        grid-template-columns: 1fr auto 1fr;
      }
      @media (min-width: 768px) { .v3-header-inner { padding: 0 48px; } }
      .v3-brand { display: inline-flex; align-items: center; gap: 10px; }
      .v3-wordmark {
        font-family: var(--font-display-stack); font-size: 18px; letter-spacing: -0.01em;
      }
      .v3-nav { display: flex; gap: 28px; justify-content: center; }
      .v3-nav-link {
        position: relative; font-size: 14.5px; font-weight: 500;
        color: var(--color-ink-soft);
        transition: color 200ms var(--ease-soft);
      }
      .v3-nav-link span { position: relative; display: inline-block; padding: 6px 0; }
      .v3-nav-link span::after {
        content: ""; position: absolute; left: 0; right: 0; bottom: 2px;
        height: 1px; background: currentColor;
        clip-path: inset(0 100% 0 0);
        transition: clip-path 200ms var(--ease-out);
      }
      @media (hover: hover) and (pointer: fine) {
        .v3-nav-link:hover { color: var(--color-ink); }
        .v3-nav-link:hover span::after { clip-path: inset(0 0 0 0); }
      }
      .v3-header-cta { display: inline-flex; gap: 14px; justify-content: flex-end; align-items: center; }
      .v3-signin {
        font-size: 14px; font-weight: 500; color: var(--color-ink);
        padding: 6px 6px; transition: color 200ms var(--ease-soft);
      }
      @media (hover: hover) and (pointer: fine) {
        .v3-signin:hover { color: var(--color-persimmon); }
      }
      @media (max-width: 720px) {
        .v3-header-inner { grid-template-columns: 1fr auto; }
        .v3-nav { display: none; }
      }

      /* ── Hero ───────────────────────────────────────────────────────── */
      .v3-hero {
        position: relative;
        padding: clamp(24px, 4vw, 56px) clamp(16px, 3vw, 40px) clamp(64px, 7vw, 96px);
        isolation: isolate;
      }
      /* macOS-window-style screen frame around the video */
      .v3-hero-screen {
        position: relative;
        max-width: 1320px;
        margin: 0 auto;
        border-radius: clamp(14px, 1.4vw, 22px);
        overflow: hidden;
        background: #0A0D11;
        border: 1px solid rgba(28, 27, 26, 0.08);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.06) inset,
          0 30px 60px -30px rgba(28, 27, 26, 0.28),
          0 12px 28px -14px rgba(28, 27, 26, 0.18);
      }
      .v3-hero-chrome {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 16px;
        height: 36px;
        padding: 0 14px;
        background: linear-gradient(180deg, #F2EBDC 0%, #EDE6D5 100%);
        border-bottom: 1px solid var(--color-border);
        font-family: var(--font-mono-stack);
        font-size: 11.5px;
        color: var(--color-ink-soft);
      }
      .v3-hero-lights { display: inline-flex; gap: 7px; align-items: center; }
      .v3-hero-light {
        width: 12px; height: 12px; border-radius: 50%;
        box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.18);
      }
      .v3-hero-light-r { background: #FF5F57; }
      .v3-hero-light-y { background: #FEBC2E; }
      .v3-hero-light-g { background: #28C840; }
      .v3-hero-title {
        justify-self: center;
        white-space: nowrap;
        font-weight: 500;
      }
      .v3-hero-actions {
        display: inline-flex; gap: 5px; justify-self: end;
        opacity: 0.4;
      }
      .v3-hero-action {
        width: 14px; height: 14px;
        border: 1px solid currentColor;
        border-radius: 3px;
      }
      .v3-hero-stage {
        position: relative;
        aspect-ratio: 16 / 9;
        min-height: 460px;
        max-height: 78vh;
        overflow: hidden;
      }
      /* Mobile: drop the 16:9 aspect (it forces a tall blank video band
         on phones) and let content set the height. Keep the stage at a
         comfortable readable size, not a billboard. */
      @media (max-width: 640px) {
        .v3-hero-stage {
          aspect-ratio: auto;
          min-height: 0;
          max-height: none;
        }
      }
      .v3-hero-video {
        position: absolute; inset: 0; z-index: 0;
        width: 100%; height: 100%; object-fit: cover;
      }
      .v3-hero-vignette {
        position: absolute; inset: 0; z-index: 1; pointer-events: none;
        background:
          linear-gradient(180deg,
            rgba(0,0,0,0.62) 0%,
            rgba(0,0,0,0.18) 22%,
            rgba(0,0,0,0.18) 62%,
            rgba(0,0,0,0.72) 100%);
      }
      .v3-hero-inner {
        position: relative; z-index: 2;
        max-width: 1180px; margin: 0 auto;
        padding: clamp(40px, 10vw, 120px) 20px clamp(48px, 8vw, 96px);
        color: #fff;
        text-align: left;
      }
      @media (min-width: 768px) { .v3-hero-inner { padding-left: 48px; padding-right: 48px; } }

      .v3-hero-eyebrow {
        display: inline-flex; flex-direction: column; align-items: flex-start; gap: 12px;
        font-family: var(--font-mono-stack);
        font-size: 11px; font-weight: 600; letter-spacing: 0.18em;
        text-transform: uppercase; color: var(--color-persimmon);
      }
      .v3-hero-eyebrow-text {
        opacity: 1; animation: v3-fade-in 500ms var(--ease-out) 0ms backwards;
      }
      .v3-hero-eyebrow-rule {
        display: block; height: 1px; background: var(--color-persimmon);
        width: 64px; clip-path: inset(0 0 0 0);
        animation: v3-rule-in 600ms var(--ease-out) 300ms backwards;
      }

      .v3-hero-h1 {
        margin-top: 24px;
        font-family: var(--font-display-stack); font-weight: 400;
        font-size: clamp(40px, 10vw, 96px);
        line-height: 0.98; letter-spacing: -0.022em;
        color: #fff; max-width: 14ch;
        text-wrap: balance;
      }
      .v3-hero-line { display: flex; flex-wrap: wrap; gap: 0 0.26em; }
      .v3-hero-word {
        display: inline-block; opacity: 1; transform: translateY(0);
        animation: v3-word-in 700ms var(--ease-out) backwards;
      }
      .v3-hero-italic { font-style: italic; color: var(--color-persimmon); }
      @keyframes v3-word-in {
        0%   { opacity: 0; transform: translateY(16px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes v3-fade-in {
        0%   { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes v3-rule-in {
        0%   { clip-path: inset(0 100% 0 0); }
        100% { clip-path: inset(0 0    0 0); }
      }

      .v3-hero-sub {
        margin-top: 28px; max-width: 520px;
        font-size: clamp(16px, 4vw, 21px); line-height: 1.55;
        color: rgba(255,255,255,0.88);
        opacity: 1; animation: v3-fade-in 500ms var(--ease-out) 600ms backwards;
      }
      .v3-hero-ctas {
        margin-top: 32px; display: flex; gap: 18px; flex-wrap: wrap;
        opacity: 1; animation: v3-fade-in 500ms var(--ease-out) 850ms backwards;
      }
      .v3-hero-ghost {
        display: inline-flex; align-items: center; gap: 10px;
        height: 44px; padding: 0 4px; color: #fff;
        font-size: 14.5px; font-weight: 500;
        position: relative;
        transition: color 200ms var(--ease-soft);
      }
      .v3-hero-ghost svg { color: var(--color-persimmon); transition: transform 200ms var(--ease-soft); }
      .v3-hero-ghost::after {
        content: ""; position: absolute; left: 24px; right: 4px; bottom: 8px;
        height: 1px; background: rgba(255,255,255,0.4);
      }
      @media (hover: hover) and (pointer: fine) {
        .v3-hero-ghost:hover { color: var(--color-persimmon-tint); }
      }
      .v3-hero-ghost:active { transform: scale(0.97); }

      .v3-hero-trust {
        margin-top: 44px;
        display: inline-flex; flex-wrap: wrap; align-items: center; gap: 18px;
        font-family: var(--font-mono-stack);
        font-size: 11.5px; font-weight: 500; letter-spacing: 0.14em;
        text-transform: uppercase; color: rgba(255,255,255,0.74);
        opacity: 1; animation: v3-fade-in 500ms var(--ease-out) 1100ms backwards;
      }
      .v3-hero-trust li[aria-hidden] {
        width: 1px; height: 12px; background: rgba(255,255,255,0.3);
      }
      @media (max-width: 560px) {
        .v3-hero-trust { flex-direction: column; align-items: flex-start; gap: 8px; }
        .v3-hero-trust li[aria-hidden] { display: none; }
      }

      .v3-scroll-cue {
        position: absolute; left: 50%; bottom: 32px; transform: translateX(-50%);
        width: 1px; height: 44px;
        background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%);
        animation: v3-cue 2.4s var(--ease-in-out) infinite;
      }
      @keyframes v3-cue {
        0%, 100% { transform: translate(-50%, 0); opacity: 0.7; }
        50% { transform: translate(-50%, 6px); opacity: 1; }
      }

      /* ── Section base ───────────────────────────────────────────────── */
      .v3-section {
        max-width: 1240px; margin: 0 auto;
        padding: 80px 24px;
      }
      @media (min-width: 768px) {
        .v3-section { padding: 128px 48px; }
      }

      /* ── Playbook ───────────────────────────────────────────────────── */
      .v3-playbook { position: relative; }
      .v3-playbook-grid {
        display: grid; gap: clamp(48px, 6vw, 96px);
        grid-template-columns: 1fr;
      }
      @media (min-width: 880px) {
        .v3-playbook-grid {
          grid-template-columns: 5fr 7fr; align-items: start;
        }
      }
      .v3-phase-list {
        display: flex; flex-direction: column;
        border-top: 1px solid var(--color-border);
      }
      .v3-phase-row {
        padding: 28px 0; border-bottom: 1px solid var(--color-border);
        opacity: 0; transform: translateY(10px);
        animation: v3-row-in 700ms var(--ease-out) forwards;
        position: relative;
      }
      @keyframes v3-row-in { to { opacity: 1; transform: translateY(0); } }
      .v3-phase-meta-row {
        display: flex; justify-content: space-between; gap: 16px;
        font-size: 11.5px; letter-spacing: 0.14em; text-transform: uppercase;
      }
      .v3-phase-num { color: var(--color-persimmon); }
      .v3-phase-time { color: var(--color-muted); }
      .v3-phase-name {
        margin-top: 12px;
        font-family: var(--font-display-stack); font-weight: 400;
        font-size: clamp(28px, 3.2vw, 40px); line-height: 1.1;
        letter-spacing: -0.015em;
      }
      .v3-phase-rule {
        position: absolute; left: 0; bottom: -1px; height: 1px;
        background: var(--color-persimmon); width: 100%;
        clip-path: inset(0 100% 0 0);
        animation: v3-rule-in 700ms var(--ease-out) 400ms forwards;
      }
      @supports (animation-timeline: view()) {
        .v3-phase-rule {
          animation: v3-rule-in linear forwards;
          animation-timeline: view();
          animation-range: entry 10% cover 30%;
        }
      }

      .v3-playbook-anno {
        position: relative; margin-top: 96px;
        display: flex; align-items: center; gap: 18px;
        max-width: 380px; color: var(--color-ink-soft);
      }
      .v3-anno-label {
        font-family: var(--font-display-stack); font-style: italic;
        font-size: 22px; line-height: 1.2;
      }
      @media (min-width: 880px) {
        .v3-playbook-anno {
          position: absolute; left: 24px; bottom: 56px;
        }
      }

      /* ── Moments (Features) ─────────────────────────────────────────── */
      .v3-moment {
        display: grid; gap: clamp(48px, 6vw, 96px);
        grid-template-columns: 1fr;
        align-items: center;
      }
      @media (min-width: 880px) {
        .v3-moment { grid-template-columns: 1fr 1fr; }
        .v3-moment-left  .v3-moment-copy   { order: 2; }
        .v3-moment-left  .v3-moment-visual { order: 1; }
        .v3-moment-right .v3-moment-copy   { order: 1; }
        .v3-moment-right .v3-moment-visual { order: 2; }
      }
      .v3-bullets {
        display: flex; flex-direction: column; gap: 12px;
        font-size: 15.5px; color: var(--color-ink);
      }
      .v3-bullets li { display: flex; align-items: center; gap: 14px; }
      .v3-check {
        width: 14px; height: 14px; border-radius: 999px;
        border: 1.5px solid var(--color-persimmon);
        position: relative; flex: 0 0 auto;
      }
      .v3-check::after {
        content: ""; position: absolute; left: 3px; top: 5px;
        width: 4px; height: 7px;
        border-right: 1.5px solid var(--color-persimmon);
        border-bottom: 1.5px solid var(--color-persimmon);
        transform: rotate(45deg);
      }

      /* Shared mock surface */
      .v3-mock {
        background: var(--color-paper-soft);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 22px 24px;
        box-shadow: 0 1px 0 var(--color-border);
      }

      /* Document Vault mock */
      .v3-mock-docs { display: flex; flex-direction: column; gap: 18px; }
      .v3-mock-head {
        display: flex; justify-content: space-between; align-items: baseline;
        font-size: 13px; color: var(--color-ink-soft);
      }
      .v3-doc-rows { display: flex; flex-direction: column; gap: 8px; }
      .v3-doc-rows li {
        position: relative; overflow: hidden;
        display: flex; justify-content: space-between; align-items: center;
        padding: 14px 16px; border-radius: 10px;
        background: var(--color-paper-deep);
        font-size: 14px;
      }
      .v3-doc-pill {
        font-family: var(--font-mono-stack); font-size: 11.5px;
        padding: 4px 10px; border-radius: 999px;
        display: inline-flex; align-items: center; gap: 6px;
      }
      .v3-doc-pill-ok { background: #DFF1E5; color: #1E6B41; }
      .v3-doc-pill-busy { background: #F1ECDD; color: var(--color-ink-soft); }
      .v3-doc-pill-warn { background: var(--color-persimmon-tint); color: var(--color-persimmon-deep); }
      .v3-doc-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--color-persimmon); }
      .v3-doc-scan {
        position: absolute; inset: 0;
        background: linear-gradient(90deg,
          transparent 0%, rgba(255,91,46,0.18) 50%, transparent 100%);
        clip-path: inset(0 100% 0 0);
        animation: v3-scan 2.4s var(--ease-in-out) infinite;
      }
      @keyframes v3-scan {
        0% { clip-path: inset(0 100% 0 0); }
        50% { clip-path: inset(0 0 0 0); }
        100% { clip-path: inset(0 0 0 100%); }
      }
      .v3-progress {
        height: 4px; background: var(--color-paper-deep);
        border-radius: 999px; overflow: hidden;
      }
      .v3-progress > span {
        display: block; height: 100%; width: 0; background: var(--color-persimmon);
        animation: v3-progress 6s var(--ease-out) infinite;
      }
      @keyframes v3-progress {
        0%   { width: 0; }
        55%  { width: 66.6%; }
        90%  { width: 66.6%; }
        100% { width: 0; }
      }
      .v3-mock-foot { font-size: 11.5px; color: var(--color-muted); }

      /* Mock Interview stage (3 stacked cards) */
      .v3-mock-stage {
        display: grid; gap: 14px;
        grid-template-columns: 1fr;
      }
      .v3-mock-q-card .v3-mock-q {
        margin-top: 12px;
        font-family: var(--font-display-stack); font-size: 26px; line-height: 1.25;
      }
      .v3-typewriter {
        display: inline-block; position: relative;
        clip-path: inset(0 100% 0 0);
        animation: v3-type 6.5s steps(53, end) infinite;
      }
      .v3-caret {
        display: inline-block; width: 2px; height: 0.95em; margin-left: 2px;
        vertical-align: -2px; background: var(--color-persimmon);
        animation: v3-blink 0.9s steps(1, end) infinite;
      }
      @keyframes v3-type {
        0%   { clip-path: inset(0 100% 0 0); }
        40%  { clip-path: inset(0 0    0 0); }
        85%  { clip-path: inset(0 0    0 0); }
        100% { clip-path: inset(0 100% 0 0); }
      }
      @keyframes v3-blink {
        0%, 50% { opacity: 1; }
        50.01%, 100% { opacity: 0; }
      }
      .v3-mock-meta {
        font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
        color: var(--color-muted);
      }
      .v3-mic { display: flex; gap: 4px; align-items: end; height: 32px; margin-top: 18px; }
      .v3-mic span {
        display: block; width: 4px; background: var(--color-persimmon); border-radius: 2px;
        height: 6px; animation: v3-mic 1.1s var(--ease-in-out) infinite;
      }
      @keyframes v3-mic { 0%,100% { height: 6px; } 50% { height: 26px; } }
      .v3-scores {
        margin-top: 12px;
        display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
      }
      .v3-score {
        display: flex; justify-content: space-between; align-items: baseline;
        padding: 12px 14px; background: var(--color-paper-deep); border-radius: 10px;
      }
      .v3-score-label { font-size: 12.5px; color: var(--color-ink-soft); }
      .v3-score-num { font-size: 18px; font-weight: 600; }
      .v3-transcript {
        margin-top: 10px; font-size: 13.5px; line-height: 1.55;
        color: var(--color-ink-soft); max-width: 38ch;
      }

      /* Parent share mock */
      .v3-parent-stage { display: flex; justify-content: center; }
      .v3-phone {
        width: 280px; aspect-ratio: 9 / 18.5;
        background: var(--color-ink); border-radius: 36px;
        padding: 10px; position: relative;
        box-shadow: 0 24px 64px -32px rgba(28,27,26,0.45);
      }
      .v3-phone-notch {
        position: absolute; left: 50%; top: 10px; transform: translateX(-50%);
        width: 92px; height: 22px; background: var(--color-ink);
        border-radius: 0 0 14px 14px; z-index: 2;
      }
      .v3-phone-screen {
        width: 100%; height: 100%; background: var(--color-paper);
        border-radius: 26px;
        padding: 48px 18px 18px;
        display: flex; flex-direction: column; gap: 12px;
      }
      .v3-phone-eyebrow { font-size: 10.5px; color: var(--color-muted); letter-spacing: 0.14em; text-transform: uppercase; }
      .v3-phone-h {
        font-family: var(--font-display-stack); font-size: 19px; line-height: 1.2;
      }
      .v3-phone-progress {
        height: 4px; background: var(--color-paper-deep);
        border-radius: 999px; overflow: hidden;
      }
      .v3-phone-progress > span {
        display: block; height: 100%; width: 0; background: var(--color-persimmon);
        animation: v3-parent-prog 6s var(--ease-out) infinite;
      }
      @keyframes v3-parent-prog {
        0%   { width: 0; }
        55%  { width: 63%; }
        90%  { width: 63%; }
        100% { width: 0; }
      }
      .v3-phone-meta { font-size: 10.5px; color: var(--color-muted); }
      .v3-phone-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
      .v3-phone-chips li {
        font-family: var(--font-mono-stack); font-size: 10.5px;
        background: var(--color-paper-soft); border: 1px solid var(--color-border);
        padding: 5px 9px; border-radius: 999px;
        opacity: 0; animation: v3-fade-in 400ms var(--ease-out) forwards;
      }
      .v3-phone-foot {
        margin-top: auto; display: flex; align-items: center; gap: 8px;
        font-size: 11px; color: var(--color-ink-soft);
      }
      .v3-dot-pulse {
        width: 8px; height: 8px; border-radius: 999px; background: var(--color-persimmon);
        box-shadow: 0 0 0 0 var(--color-persimmon);
        animation: v3-pulse 1.8s var(--ease-out) infinite;
      }
      @keyframes v3-pulse {
        0% { box-shadow: 0 0 0 0 rgba(255,91,46,0.55); }
        100% { box-shadow: 0 0 0 10px rgba(255,91,46,0); }
      }

      /* ── Pricing ────────────────────────────────────────────────────── */
      .v3-pricing-head { text-align: center; max-width: 720px; margin: 0 auto 64px; }
      .v3-pricing-head .v3-h2 { margin-left: auto; margin-right: auto; }
      .v3-pricing-head .v3-lead { margin-left: auto; margin-right: auto; }
      .v3-price-grid {
        display: grid; gap: 24px;
        grid-template-columns: 1fr;
      }
      @media (min-width: 880px) {
        .v3-price-grid { grid-template-columns: repeat(3, 1fr); align-items: stretch; }
      }
      /* Apple-style: 28px radius, soft outer shadow, 1px lit top edge.
         Free + Family use a frosted white surface; Solo gets the dark
         "most chosen" treatment with a persimmon halo and an inset
         highlight that catches the eye without screaming. */
      .v3-price-card {
        position: relative; display: flex; flex-direction: column;
        background: rgba(255, 255, 255, 0.85);
        border: 0.5px solid rgba(28,27,26,0.08);
        border-radius: 28px; padding: 32px 28px;
        box-shadow: var(--gs-shadow-md);
        overflow: hidden;
        transform: translateZ(0);
        transition: transform 240ms var(--ease-soft),
          box-shadow 240ms var(--ease-soft);
      }
      .v3-price-card::before {
        content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 20%, rgba(255,255,255,0.85) 80%, transparent 100%);
        pointer-events: none;
      }
      .v3-price-solo {
        background: var(--color-ink);
        border: 0.5px solid rgba(255,255,255,0.10);
        box-shadow: var(--gs-shadow-lg), 0 0 0 1px rgba(232,98,42,0.3);
        color: var(--color-paper);
        overflow: visible;
      }
      .v3-price-solo::before {
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 20%, rgba(255,255,255,0.10) 80%, transparent 100%);
      }
      /* Solo lives on an ink background — re-tint every child that
         otherwise inherits ink/muted colors so the card is readable. */
      .v3-price-solo .v3-price-name { color: rgba(250,248,244,0.65); }
      .v3-price-solo .v3-price-caption { color: var(--color-paper); }
      .v3-price-solo .v3-price-amt { color: var(--color-paper); }
      .v3-price-solo .v3-price-symbol { color: rgba(250,248,244,0.60); }
      .v3-price-solo .v3-price-per { color: rgba(250,248,244,0.55); }
      .v3-price-solo .v3-price-strike { color: rgba(250,248,244,0.45); }
      .v3-price-solo .v3-price-bullets,
      .v3-price-solo .v3-price-bullets li { color: rgba(250,248,244,0.85); }
      .v3-price-solo .v3-check {
        background: rgba(232,98,42,0.18);
        border-color: rgba(232,98,42,0.55);
      }
      @media (hover: hover) and (pointer: fine) {
        .v3-price-card:not(.v3-price-solo):hover {
          transform: translateY(-2px) translateZ(0);
          box-shadow: var(--gs-shadow-lg);
        }
        .v3-price-solo:hover {
          transform: translateY(-2px) translateZ(0);
        }
      }
      .v3-price-chip {
        position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
        background: var(--color-persimmon); color: var(--color-ink);
        font-family: var(--font-sans-stack);
        font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
        text-transform: uppercase; padding: 5px 14px; border-radius: 999px;
        box-shadow: 0 4px 12px rgba(255, 200, 1, 0.35);
        white-space: nowrap;
      }
      .v3-price-name {
        font-family: var(--font-sans-stack);
        font-size: 13px; font-weight: 600; letter-spacing: 0.06em;
        text-transform: uppercase; color: var(--color-ink-soft);
      }
      .v3-price-caption {
        margin-top: 8px;
        font-family: var(--font-display-stack); font-style: italic;
        font-size: 18px; line-height: 1.3; color: var(--color-ink);
      }
      .v3-price-row {
        display: flex; align-items: baseline; gap: 14px;
        margin-top: 20px; flex-wrap: wrap;
      }
      /* Refined pricing display:
         - Currency symbol smaller, lighter, with a baseline lift
         - Number in display serif (Instrument Serif) for editorial confidence
         - Tabular numerics so the digits align across the 3 columns
      */
      .v3-price-amt {
        display: inline-flex;
        align-items: baseline;
        gap: 4px;
        font-family: var(--font-display-stack);
        font-weight: 400;
        font-size: clamp(44px, 4.6vw, 60px);
        letter-spacing: -0.018em;
        line-height: 1;
        color: var(--color-ink);
      }
      .v3-price-symbol {
        font-family: var(--font-mono-stack);
        font-size: 0.5em;
        font-weight: 500;
        color: var(--color-ink-soft);
        align-self: flex-start;
        margin-top: 0.18em;
        letter-spacing: 0;
      }
      .v3-price-num {
        font-variant-numeric: tabular-nums;
      }
      .v3-price-strike {
        display: inline-flex; gap: 8px; align-items: baseline;
        color: var(--color-muted); font-size: 15px;
      }
      .v3-price-pct {
        color: var(--color-persimmon-deep); background: var(--color-persimmon-tint);
        font-size: 11px; padding: 2px 7px; border-radius: 999px;
      }
      .v3-price-per {
        margin-top: 8px; font-size: 11.5px; color: var(--color-muted);
        letter-spacing: 0.04em;
      }
      .v3-price-bullets { margin-top: 28px; flex: 1; font-size: 14.5px; }
      .v3-refund {
        margin-top: 32px; text-align: center;
        font-size: 13.5px; color: var(--color-ink-soft);
      }

      /* ── Reviews — horizontal marquee, persimmon glow ──────────────── */
      .v3-reviews-head { margin-bottom: 56px; max-width: 720px; }
      .v3-review-marquee {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 22px;
        --mask: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
        -webkit-mask-image: var(--mask);
        mask-image: var(--mask);
      }
      .v3-review-row { overflow: hidden; width: 100%; }
      .v3-review-track {
        display: flex;
        gap: 20px;
        width: max-content;
        will-change: transform;
      }
      .v3-review-track-ltr {
        animation: v3-review-marquee-ltr 90s linear infinite;
      }
      .v3-review-track-rtl {
        animation: v3-review-marquee-rtl 100s linear infinite;
      }
      .v3-review-marquee:hover .v3-review-track {
        animation-play-state: paused;
      }
      @keyframes v3-review-marquee-ltr {
        from { transform: translate3d(0, 0, 0); }
        to   { transform: translate3d(-50%, 0, 0); }
      }
      @keyframes v3-review-marquee-rtl {
        from { transform: translate3d(-50%, 0, 0); }
        to   { transform: translate3d(0, 0, 0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .v3-review-track { animation: none !important; }
        .v3-review-row { overflow-x: auto; }
      }

      .v3-review-card {
        position: relative;
        flex: 0 0 auto;
        width: 308px;
        /* Warm peach card — picks up the persimmon family quietly so the
           running rail at the bottom feels intentional, not alien. */
        background: color-mix(in srgb, var(--color-persimmon-tint) 28%, var(--color-paper-soft));
        border: 1px solid color-mix(in srgb, var(--color-persimmon) 14%, var(--color-border));
        border-radius: 14px;
        padding: 20px 18px;
        overflow: hidden;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.55) inset,
          0 8px 20px -12px rgba(217, 70, 30, 0.18);
        transition:
          border-color 240ms var(--ease-soft),
          background-color 240ms var(--ease-soft),
          transform 240ms var(--ease-soft);
      }
      /* Running persimmon line — animated rail along the bottom edge of
         every review card. Two layers: a faint track + a bright traveler
         that loops left-to-right indefinitely. */
      .v3-review-card::before,
      .v3-review-card::after {
        content: "";
        position: absolute;
        left: 0; right: 0; bottom: 0;
        height: 2px;
        pointer-events: none;
      }
      .v3-review-card::before {
        background: color-mix(in srgb, var(--color-persimmon) 18%, transparent);
      }
      .v3-review-card::after {
        width: 45%;
        background: linear-gradient(
          90deg,
          transparent 0%,
          var(--color-persimmon) 50%,
          transparent 100%
        );
        animation: v3-review-rail 3.2s linear infinite;
      }
      @keyframes v3-review-rail {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(220%); }
      }
      /* Stagger each card's rail so the rows don't pulse in lockstep. */
      .v3-review-card:nth-child(3n)::after   { animation-delay: -0.9s; }
      .v3-review-card:nth-child(3n + 1)::after { animation-delay: -1.8s; }
      .v3-review-card:nth-child(3n + 2)::after { animation-delay: -2.4s; }
      @media (hover: hover) and (pointer: fine) {
        .v3-review-card:hover {
          background: color-mix(in srgb, var(--color-persimmon-tint) 42%, var(--color-paper-soft));
          border-color: color-mix(in srgb, var(--color-persimmon) 38%, var(--color-border));
          transform: translateY(-2px);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .v3-review-card::after { animation: none; transform: translateX(28%); }
      }
      @media (max-width: 640px) {
        .v3-review-card { width: 268px; padding: 18px 16px; }
        .v3-review-q { font-size: 15px; }
        .v3-review-track-ltr { animation-duration: 64s; }
        .v3-review-track-rtl { animation-duration: 72s; }
      }
      .v3-review-weight { padding-top: 22px; }
      .v3-review-stars {
        display: inline-flex; gap: 3px; color: var(--color-persimmon);
        margin-bottom: 12px;
      }
      .v3-review-q {
        font-family: var(--font-display-stack);
        font-size: 16px; line-height: 1.45; color: var(--color-ink);
        hanging-punctuation: first;
        margin: 0;
      }
      .v3-review-rule {
        margin: 22px 0 18px; border: 0; height: 1px; background: var(--color-border);
      }
      .v3-review-foot { display: flex; gap: 12px; align-items: center; }
      .v3-review-avatar {
        width: 34px; height: 34px; border-radius: 999px;
        background: var(--color-persimmon-tint); color: var(--color-persimmon-deep);
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 600;
      }
      .v3-review-name { display: block; font-size: 14px; font-weight: 600; }
      .v3-review-meta { display: block; font-size: 12.5px; color: var(--color-muted); }

      /* ── FAQ ────────────────────────────────────────────────────────── */
      .v3-faq-head {
        max-width: 720px;
        margin: 0 auto 48px;
        text-align: center;
      }
      .v3-faq-head .v3-h2,
      .v3-faq-head .v3-lead { margin-left: auto; margin-right: auto; }
      .v3-faq-list {
        display: flex; flex-direction: column; gap: 12px;
        max-width: 920px;
        margin: 0 auto;
      }
      .v3-faq-item {
        position: relative;
        background: var(--color-paper-soft);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 1px 0 rgba(28,25,23,0.02);
        transition: transform 280ms var(--ease-soft),
          box-shadow 280ms var(--ease-soft),
          border-color 240ms var(--ease-soft);
      }
      /* Left persimmon rail — thickens on hover/open. Pseudo-element so it
         layers under content but above the card background. */
      .v3-faq-item::before {
        content: "";
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 3px;
        background: var(--color-persimmon);
        transition: width 240ms var(--ease-out),
          background-color 240ms var(--ease-soft);
        z-index: 1;
        pointer-events: none;
      }
      @media (hover: hover) and (pointer: fine) {
        .v3-faq-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px -16px rgba(28,25,23,0.18),
            0 2px 6px rgba(28,25,23,0.06);
          border-color: color-mix(in srgb, var(--color-persimmon) 22%, var(--color-border));
        }
        .v3-faq-item:hover::before { width: 6px; }
      }
      .v3-faq-item.is-open {
        border-color: color-mix(in srgb, var(--color-persimmon) 30%, var(--color-border));
      }
      .v3-faq-item.is-open::before { width: 6px; }

      .v3-faq-btn {
        all: unset; cursor: pointer; width: 100%; box-sizing: border-box;
        display: grid; grid-template-columns: 1fr;
        gap: 12px;
        padding: 26px 72px 26px 34px;
        position: relative;
      }
      /* Number as a faded watermark behind the body copy. Big, bold,
         low-contrast ink — sets the editorial register without competing
         with the question. */
      .v3-faq-num {
        position: absolute;
        top: 18px;
        right: 76px;
        font-family: var(--font-display-stack);
        font-size: 56px;
        font-weight: 500;
        line-height: 1;
        letter-spacing: -0.04em;
        color: rgba(28,25,23,0.06);
        padding: 0;
        pointer-events: none;
        transition: color 240ms var(--ease-soft);
      }
      .v3-faq-item.is-open .v3-faq-num {
        color: color-mix(in srgb, var(--color-persimmon) 18%, transparent);
      }

      .v3-faq-body { display: flex; flex-direction: column; gap: 14px; }
      /* Category tag — solid persimmon pill, white text, larger. */
      .v3-faq-cat {
        align-self: flex-start;
        font-family: var(--font-mono-stack);
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        background: var(--color-persimmon);
        color: #fff;
        padding: 6px 12px;
        border-radius: 999px;
        box-shadow: 0 2px 6px rgba(232,98,42,0.18);
      }
      .v3-faq-q {
        font-family: var(--font-display-stack);
        font-size: 26px;
        font-weight: 500;
        line-height: 1.2;
        letter-spacing: -0.01em;
        color: var(--color-ink);
      }
      .v3-faq-toggle {
        position: absolute; top: 24px; right: 24px;
        width: 34px; height: 34px; border-radius: 999px;
        background: var(--color-paper-deep); color: var(--color-ink-soft);
        display: inline-flex; align-items: center; justify-content: center;
        transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1),
          background-color 280ms var(--ease-out),
          color 280ms var(--ease-out);
        pointer-events: none;
      }
      .v3-faq-item.is-open .v3-faq-toggle {
        transform: rotate(180deg); background: var(--color-persimmon); color: #fff;
      }
      .v3-faq-panel {
        display: grid; grid-template-rows: 0fr;
        transition: grid-template-rows 380ms var(--ease-out);
      }
      .v3-faq-item.is-open .v3-faq-panel { grid-template-rows: 1fr; }
      .v3-faq-panel-inner {
        overflow: hidden;
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity 360ms var(--ease-out) 60ms,
          transform 360ms var(--ease-out) 60ms;
      }
      .v3-faq-item.is-open .v3-faq-panel-inner {
        opacity: 1;
        transform: translateY(0);
      }
      .v3-faq-panel-inner p {
        padding: 0 34px 26px 34px;
        font-size: 17px;
        line-height: 1.7;
        color: color-mix(in srgb, var(--color-ink-soft) 82%, transparent);
        max-width: 64ch;
      }
      @media (max-width: 640px) {
        .v3-faq-btn { padding: 22px 60px 22px 22px; }
        .v3-faq-num { font-size: 38px; top: 14px; right: 64px; }
        .v3-faq-q { font-size: 19px; }
        .v3-faq-cat { font-size: 10.5px; padding: 5px 10px; }
        .v3-faq-toggle { top: 18px; right: 18px; width: 30px; height: 30px; }
        .v3-faq-panel-inner p { padding: 0 22px 20px 22px; font-size: 15.5px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .v3-faq-item,
        .v3-faq-item::before,
        .v3-faq-toggle,
        .v3-faq-panel-inner { transition: none !important; }
      }

      /* ── Scroll-transition support layers ───────────────────────────── */
      /* Portal: persimmon edge-warmth that blooms while the pricing circle
         opens. Sits behind pricing content, never intercepts clicks. */
      .v3-pricing { position: relative; }
      .v3-portal-glow {
        position: absolute; inset: 0; z-index: 0; pointer-events: none;
        opacity: 0;
        border-radius: 50%;
        box-shadow: inset 0 0 90px 50px rgba(255, 91, 46, 0.06);
        transition: opacity 200ms var(--ease-soft);
      }
      .v3-pricing > *:not(.v3-portal-glow) { position: relative; z-index: 1; }

      /* Descent: cursor-following warm pool on the closer, JS-driven. */
      .v3-closer-glow {
        position: absolute; inset: 0; z-index: 0; pointer-events: none;
        opacity: 0;
        transition: opacity 400ms var(--ease-soft);
      }

      /* ── Closer ─────────────────────────────────────────────────────── */
      .v3-closer { position: relative; text-align: center; overflow: hidden; }
      .v3-closer > *:not(.v3-closer-glow) { position: relative; z-index: 1; }
      .v3-closer-rule {
        display: block; width: 64px; height: 1px; margin: 0 auto 22px;
        background: var(--color-persimmon);
        clip-path: inset(0 100% 0 0);
        animation: v3-rule-in 700ms var(--ease-out) forwards;
      }
      .v3-h1-closer {
        margin-top: 18px;
        font-family: var(--font-display-stack); font-weight: 400;
        font-size: clamp(56px, 9vw, 96px); line-height: 0.98;
        letter-spacing: -0.022em;
        max-width: 18ch; margin-left: auto; margin-right: auto;
      }
      .v3-closer-image {
        margin: 64px auto 48px; max-width: 980px;
        animation: v3-float 8s var(--ease-in-out) infinite;
      }
      .v3-closer-image img { width: 100%; height: auto; display: block; }
      @keyframes v3-float {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      .v3-closer-ctas {
        display: inline-flex; gap: 14px; flex-wrap: wrap; justify-content: center;
      }

      /* ── Reduced motion ─────────────────────────────────────────────── */
      @media (prefers-reduced-motion: reduce) {
        .v3-hero-word, .v3-hero-eyebrow-text, .v3-hero-eyebrow-rule,
        .v3-hero-sub, .v3-hero-ctas, .v3-hero-trust, .v3-phase-row,
        .v3-phase-rule, .v3-phone-chips li, .v3-closer-rule {
          opacity: 1 !important; transform: none !important;
          clip-path: inset(0 0 0 0) !important; animation: none !important;
        }
        .v3-scroll-cue, .v3-mic span, .v3-dot-pulse, .v3-doc-scan,
        .v3-closer-image, .v3-progress > span, .v3-phone-progress > span,
        .v3-typewriter, .v3-caret {
          animation: none !important;
        }
        .v3-typewriter { clip-path: inset(0 0 0 0) !important; }
        .v3-caret { display: none !important; }
        .v3-progress > span { width: 66.6%; }
        .v3-phone-progress > span { width: 63%; }
      }
    `}</style>
  );
}
