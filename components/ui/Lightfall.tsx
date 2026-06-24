"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

/* ════════════════════════════════════════════════════════════════════════
   Lightfall — a fullscreen WebGL canvas of slow-falling light streaks,
   gently warped by the user's cursor. Rendered with OGL on a single
   fullscreen triangle; the streaks are math, not textures.

   Designed as a Hero background: subtle, dark, on-brand persimmon
   accents. If WebGL is unavailable (rare; some iOS Lockdown setups,
   ancient browsers) the canvas mounts but renders nothing — the parent
   should set its own backgroundColor so the page stays on-brand.

   Mobile down-tunes streak count + density automatically.
   ═════════════════════════════════════════════════════════════════════════ */

type Props = {
  /** Base background color the shader uses when no streak is present. */
  backgroundColor?: string;
  /** Vertical fall speed multiplier. */
  speed?: number;
  /** How many streak layers to render. */
  streakCount?: number;
  /** Streak thickness (0–2 reasonable). */
  streakWidth?: number;
  /** Streak length in screen units. */
  streakLength?: number;
  /** Bloom around each streak (0–1.2). */
  glow?: number;
  /** How many streaks per layer. */
  density?: number;
  /** Twinkle modulation depth (0–1). */
  twinkle?: number;
  /** Camera zoom — bigger = denser streaks visible. */
  zoom?: number;
  /** Soft persimmon haze behind the streaks. */
  backgroundGlow?: number;
  /** Master canvas opacity (CSS-level). */
  opacity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  mouseRadius?: number;
  color1?: string;
  color2?: string;
  color3?: string;
};

function hexToRgb(input: string): [number, number, number] {
  // Accepts "#RRGGBB" and "rgba(r,g,b,a)" — we ignore alpha, that's
  // handled by the master opacity prop on the canvas.
  if (input.startsWith("#")) {
    const h = input.slice(1);
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const m = input.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map((v) => parseFloat(v.trim()));
    return [(parts[0] ?? 0) / 255, (parts[1] ?? 0) / 255, (parts[2] ?? 0) / 255];
  }
  return [0, 0, 0];
}

function isWebGLSupported(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      (canvas.getContext as (id: string) => unknown)("experimental-webgl")
    );
  } catch {
    return false;
  }
}

const vertex = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;            // 0..1 in screen space, smoothed
uniform float uMouseStrength;
uniform float uMouseRadius;
uniform float uSpeed;
uniform float uStreakCount;      // layers
uniform float uStreakWidth;
uniform float uStreakLength;
uniform float uGlow;
uniform float uDensity;          // streaks per layer
uniform float uTwinkle;
uniform float uZoom;
uniform float uBackgroundGlow;
uniform vec3  uBg;
uniform vec3  uC1;
uniform vec3  uC2;
uniform vec3  uC3;

float hash(float n) { return fract(sin(n) * 43758.5453); }

// One layer of falling streaks. Layer index seeds RNG.
vec3 layer(vec2 uv, float layerIdx, vec3 tint) {
  float cells = floor(8.0 + uDensity * 24.0);
  vec2 grid = vec2(cells, 1.0);
  vec2 g = uv * grid;
  float col = floor(g.x);

  float seed = hash(col * 13.37 + layerIdx * 7.91);
  float speedJitter = mix(0.55, 1.45, hash(seed + 1.0));
  float xJitter = hash(seed + 3.0) * 0.6 - 0.3;

  // Streak head Y (wraps top→bottom over time)
  float headY = fract(uTime * uSpeed * 0.18 * speedJitter + seed);
  float tail = uStreakLength * mix(0.5, 1.4, hash(seed + 5.0));

  // Local cell coords
  float cellCenter = (col + 0.5) / cells + xJitter / cells;
  float dx = (uv.x - cellCenter);
  float w  = uStreakWidth * 0.0035 * mix(0.6, 1.4, hash(seed + 7.0));

  // Vertical position within the trail (0 = head, 1 = far past tail)
  float dy = (headY - uv.y) / tail;
  float visible = step(0.0, dy) * step(dy, 1.0);

  // Falloffs
  float horiz = exp(-(dx * dx) / (w * w));                 // sharp core
  float vert  = pow(1.0 - dy, 2.0);                         // fade along tail
  float bloom = exp(-(dx * dx) / (w * w * (4.0 + uGlow * 14.0))); // soft glow

  float twink = 1.0 + uTwinkle * (sin(uTime * 2.0 + seed * 30.0) * 0.5);

  float intensity = visible * twink * (horiz * vert + bloom * vert * 0.55 * uGlow);

  return tint * intensity;
}

void main() {
  vec2 uv = vUv;

  // Mouse warp — small, organic.
  float md = distance(uv, uMouse);
  vec2 dir = normalize(uv - uMouse + 0.0001);
  float pull = smoothstep(uMouseRadius, 0.0, md);
  uv += dir * pull * uMouseStrength * 0.05;

  // Apply zoom around screen center
  vec2 c = (uv - 0.5) / (uZoom * 0.5) + 0.5;

  vec3 col = uBg;

  // Background haze (very subtle persimmon vignette toward center)
  float vign = exp(-distance(uv, vec2(0.5, 0.55)) * 2.0);
  col += uC1 * vign * uBackgroundGlow * 0.4;

  // Stacked streak layers
  float layers = floor(max(1.0, uStreakCount));
  for (float i = 0.0; i < 6.0; i += 1.0) {
    if (i >= layers) break;
    vec3 tint = i < 1.0 ? uC1 : (i < 2.0 ? uC2 : uC3);
    // Shift each layer horizontally for parallax feel
    vec2 luv = c + vec2(hash(i * 11.0) * 0.13, 0.0);
    col += layer(luv, i, tint);
  }

  // Soft top/bottom fade so streaks bleed into the section edges
  float edgeTop = smoothstep(0.0, 0.05, uv.y);
  float edgeBot = smoothstep(0.0, 0.05, 1.0 - uv.y);
  col *= edgeTop * edgeBot * 0.85 + 0.15;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function Lightfall({
  backgroundColor = "#1C1917",
  speed = 0.4,
  streakCount = 3,
  streakWidth = 1,
  streakLength = 1.2,
  glow = 0.8,
  density = 0.5,
  twinkle = 0.6,
  zoom = 3,
  backgroundGlow = 0.3,
  opacity = 0.65,
  mouseInteraction = true,
  mouseStrength = 0.4,
  mouseRadius = 1,
  color1 = "#E8622A",
  color2 = "#1C1917",
  color3 = "rgba(250,248,244,0.3)",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!isWebGLSupported()) return; // graceful fallback: nothing renders

    // Reduced-motion users get a static frame so we don't burn battery.
    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const isMobile = window.innerWidth < 768;
    const mStreakCount = isMobile ? 2 : streakCount;
    const mDensity = isMobile ? 0.3 : density;

    const renderer = new Renderer({
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    el.appendChild(canvas);

    const geometry = new Triangle(gl);

    const [c1r, c1g, c1b] = hexToRgb(color1);
    const [c2r, c2g, c2b] = hexToRgb(color2);
    const [c3r, c3g, c3b] = hexToRgb(color3);
    const [bgr, bgg, bgb] = hexToRgb(backgroundColor);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime:            { value: 0 },
        uResolution:      { value: [el.clientWidth, el.clientHeight] },
        uMouse:           { value: [0.5, 0.5] },
        uMouseStrength:   { value: mouseInteraction ? mouseStrength : 0 },
        uMouseRadius:     { value: mouseRadius },
        uSpeed:           { value: speed },
        uStreakCount:     { value: mStreakCount },
        uStreakWidth:     { value: streakWidth },
        uStreakLength:    { value: streakLength },
        uGlow:            { value: glow },
        uDensity:         { value: mDensity },
        uTwinkle:         { value: twinkle },
        uZoom:            { value: zoom },
        uBackgroundGlow:  { value: backgroundGlow },
        uBg:              { value: [bgr, bgg, bgb] },
        uC1:              { value: [c1r, c1g, c1b] },
        uC2:              { value: [c2r, c2g, c2b] },
        uC3:              { value: [c3r, c3g, c3b] },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [w, h];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    window.addEventListener("resize", resize);

    // Smoothed mouse position — keeps the warp fluid even on jittery
    // input events.
    const targetMouse = [0.5, 0.5];
    const currentMouse = [0.5, 0.5];
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseInteraction) return;
      const r = el.getBoundingClientRect();
      targetMouse[0] = (e.clientX - r.left) / r.width;
      targetMouse[1] = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("mousemove", onMouseMove);

    const start = performance.now();
    let raf = 0;
    const tick = () => {
      // Lerp mouse toward target
      currentMouse[0] += (targetMouse[0] - currentMouse[0]) * 0.06;
      currentMouse[1] += (targetMouse[1] - currentMouse[1]) * 0.06;
      program.uniforms.uMouse.value = currentMouse;

      const t = reduced ? 0 : (performance.now() - start) / 1000;
      program.uniforms.uTime.value = t;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      ro.disconnect();
      // Release GL context — important on iOS Safari where the WebGL
      // context limit is low and unmount-on-route-change can leak.
      const loseCtx = gl.getExtension("WEBGL_lose_context");
      loseCtx?.loseContext();
      if (canvas.parentElement === el) el.removeChild(canvas);
    };
  }, [
    backgroundColor, speed, streakCount, streakWidth, streakLength, glow,
    density, twinkle, zoom, backgroundGlow, mouseInteraction, mouseStrength,
    mouseRadius, color1, color2, color3,
  ]);

  // Mobile master opacity step-down
  const effectiveOpacity =
    typeof window !== "undefined" && window.innerWidth < 768
      ? Math.min(opacity, 0.5)
      : opacity;

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: effectiveOpacity,
        pointerEvents: "none",
      }}
    />
  );
}
