"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Props = {
  consulate?: string;
  onComplete: () => void;
};

export default function FirstPersonEntry({
  consulate = "U.S. CONSULATE · MUMBAI",
  onComplete,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [phaseLabel, setPhaseLabel] = useState<"title" | "walk" | "knock" | "enter" | "done">("title");
  const [knockRings, setKnockRings] = useState<number[]>([]);
  const doneRef = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const t = setTimeout(() => { doneRef.current = true; onComplete(); }, 1200);
      return () => clearTimeout(t);
    }

    const mount = mountRef.current!;
    const W = mount.clientWidth, H = mount.clientHeight;

    /* ---------------- renderer / scene / camera ---------------- */
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d1116, 0.045);

    const camera = new THREE.PerspectiveCamera(68, W / H, 0.05, 100);
    const EYE = 1.62;
    camera.position.set(0, EYE, 14);
    camera.lookAt(0, EYE, 0);

    /* ---------------- materials ---------------- */
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x39434f, roughness: 0.85 });
    const wallDark = new THREE.MeshStandardMaterial({ color: 0x2b333d, roughness: 0.9 });
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1c232b, roughness: 0.25, metalness: 0.15,
    });
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x222a33, roughness: 0.95 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x2e3e52, roughness: 0.6 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x4a5a6e, roughness: 0.5 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xc9a961, roughness: 0.3, metalness: 0.8 });

    /* ---------------- corridor geometry ---------------- */
    const CORRIDOR_LEN = 18;
    const CORRIDOR_W = 3.2;
    const CORRIDOR_H = 3.4;
    const DOOR_Z = -3.9;

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(CORRIDOR_W, CORRIDOR_LEN + 6), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 5);
    floor.receiveShadow = true;
    scene.add(floor);

    const sheen = new THREE.Mesh(
      new THREE.PlaneGeometry(CORRIDOR_W, CORRIDOR_LEN + 6),
      new THREE.MeshBasicMaterial({ color: 0xf3dca4, transparent: true, opacity: 0.04 })
    );
    sheen.rotation.x = -Math.PI / 2;
    sheen.position.set(0, 0.005, 5);
    scene.add(sheen);

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(CORRIDOR_W, CORRIDOR_LEN + 6), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, CORRIDOR_H, 5);
    scene.add(ceil);

    const wallGeo = new THREE.PlaneGeometry(CORRIDOR_LEN + 6, CORRIDOR_H);
    const wallL = new THREE.Mesh(wallGeo, wallMat);
    wallL.rotation.y = Math.PI / 2;
    wallL.position.set(-CORRIDOR_W / 2, CORRIDOR_H / 2, 5);
    scene.add(wallL);
    const wallR = new THREE.Mesh(wallGeo, wallDark);
    wallR.rotation.y = -Math.PI / 2;
    wallR.position.set(CORRIDOR_W / 2, CORRIDOR_H / 2, 5);
    scene.add(wallR);

    const endWall = new THREE.Mesh(new THREE.PlaneGeometry(CORRIDOR_W, CORRIDOR_H), wallMat);
    endWall.position.set(0, CORRIDOR_H / 2, DOOR_Z - 0.06);
    scene.add(endWall);

    for (const side of [-1, 1]) {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.14, CORRIDOR_LEN + 6), trimMat);
      base.position.set(side * (CORRIDOR_W / 2 - 0.02), 0.07, 5);
      scene.add(base);
    }

    /* ---------------- windows + light shafts ---------------- */
    const shaftMat = new THREE.MeshBasicMaterial({
      color: 0xf3dca4, transparent: true, opacity: 0.10,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const winGlowMat = new THREE.MeshBasicMaterial({ color: 0xf7e8c2 });

    for (let i = 0; i < 4; i++) {
      const z = 10.5 - i * 4.2;
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.5), winGlowMat);
      pane.rotation.y = Math.PI / 2;
      pane.position.set(-CORRIDOR_W / 2 + 0.01, 2.0, z);
      scene.add(pane);
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(1.14, 1.64),
        new THREE.MeshStandardMaterial({ color: 0x222a33 }));
      frame.rotation.y = Math.PI / 2;
      frame.position.set(-CORRIDOR_W / 2 + 0.005, 2.0, z);
      scene.add(frame);
      const shaft = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.5), shaftMat);
      shaft.position.set(-CORRIDOR_W / 2 + 1.15, 1.25, z);
      shaft.rotation.set(0, Math.PI / 2.6, -Math.PI / 5);
      scene.add(shaft);
      const pl = new THREE.PointLight(0xf3dca4, 5.5, 5.5, 2);
      pl.position.set(-CORRIDOR_W / 2 + 0.5, 2.0, z);
      scene.add(pl);
      const pool = new THREE.Mesh(new THREE.CircleGeometry(0.85, 24),
        new THREE.MeshBasicMaterial({
          color: 0xf3dca4, transparent: true, opacity: 0.08,
          blending: THREE.AdditiveBlending, depthWrite: false,
        }));
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(-CORRIDOR_W / 2 + 1.0, 0.01, z);
      pool.scale.set(1.6, 1, 1);
      scene.add(pool);
    }

    /* ---------------- side doors ---------------- */
    for (let i = 0; i < 3; i++) {
      const z = 9 - i * 4.5;
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.2, 1.0), doorMat);
      d.position.set(CORRIDOR_W / 2 - 0.03, 1.1, z);
      scene.add(d);
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.32, 1.12), trimMat);
      f.position.set(CORRIDOR_W / 2 - 0.02, 1.16, z);
      scene.add(f);
    }

    /* ---------------- target door ---------------- */
    const doorGroup = new THREE.Group();
    doorGroup.position.set(-0.55, 0, DOOR_Z);
    scene.add(doorGroup);

    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.4, 0.07), doorMat);
    doorLeaf.position.set(0.55, 1.2, 0);
    doorLeaf.castShadow = true;
    doorGroup.add(doorLeaf);

    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.12, 0.16), trimMat);
    frameTop.position.set(0, 2.46, DOOR_Z);
    scene.add(frameTop);
    for (const x of [-0.67, 0.67]) {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.52, 0.16), trimMat);
      jamb.position.set(x, 1.26, DOOR_Z);
      scene.add(jamb);
    }

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), brassMat);
    knob.position.set(0.95, 1.15, 0.06);
    doorGroup.add(knob);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.02), brassMat);
    plate.position.set(0.55, 1.9, 0.045);
    doorGroup.add(plate);

    const roomGlow = new THREE.PointLight(0xfff1cf, 0, 8, 2);
    roomGlow.position.set(0, 1.6, DOOR_Z - 1.2);
    scene.add(roomGlow);
    const glowPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.4),
      new THREE.MeshBasicMaterial({
        color: 0xfff1cf, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
    glowPlane.position.set(0, 1.2, DOOR_Z - 0.4);
    scene.add(glowPlane);

    /* ---------------- ambient + fill lights ---------------- */
    scene.add(new THREE.AmbientLight(0x404a58, 0.7));
    const fill = new THREE.DirectionalLight(0xc8d4e4, 0.35);
    fill.position.set(2, 6, 8);
    scene.add(fill);

    /* ---------------- dust motes ---------------- */
    const FULL_MOTE_COUNT = 160;
    let activeMoteCount = FULL_MOTE_COUNT;
    const motePos = new Float32Array(FULL_MOTE_COUNT * 3);
    for (let i = 0; i < FULL_MOTE_COUNT; i++) {
      motePos[i * 3] = (Math.random() - 0.5) * CORRIDOR_W;
      motePos[i * 3 + 1] = Math.random() * CORRIDOR_H;
      motePos[i * 3 + 2] = 14 - Math.random() * CORRIDOR_LEN;
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
    moteGeo.setDrawRange(0, FULL_MOTE_COUNT);
    const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
      color: 0xf3dca4, size: 0.015, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(motes);

    /* ---------------- timeline ---------------- */
    const T = {
      titleEnd: 1.6,
      walkEnd: 7.2,
      stopEnd: 8.0,
      knockEnd: 9.6,
      openEnd: 11.2,
      throughEnd: 12.8,
      whiteEnd: 13.6,
    };
    const START_Z = 14, STOP_Z = DOOR_Z + 1.35;

    const clock = new THREE.Clock();
    let knocked1 = false, knocked2 = false, labelWalk = false, labelKnock = false, labelEnter = false;
    let raf = 0;

    // FPS perf-adaptation: sample frame times; if avg <45 fps for 60 frames, downgrade once.
    let fpsSampleStart = performance.now();
    let fpsSampleFrames = 0;
    let adapted = false;
    const tryAdapt = () => {
      if (adapted) return;
      const now = performance.now();
      const elapsedMs = now - fpsSampleStart;
      fpsSampleFrames += 1;
      if (fpsSampleFrames >= 60) {
        const fps = (fpsSampleFrames / elapsedMs) * 1000;
        if (fps < 45) {
          adapted = true;
          activeMoteCount = Math.floor(FULL_MOTE_COUNT / 2);
          moteGeo.setDrawRange(0, activeMoteCount);
          renderer.setPixelRatio(1);
          renderer.setSize(mount.clientWidth, mount.clientHeight);
        }
        fpsSampleStart = now;
        fpsSampleFrames = 0;
      }
    };

    const ease = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const animate = () => {
      const t = clock.getElapsedTime();

      const p = moteGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < activeMoteCount; i++) {
        p.setY(i, p.getY(i) - 0.0012);
        if (p.getY(i) < 0) p.setY(i, CORRIDOR_H);
      }
      p.needsUpdate = true;

      let camZ = camera.position.z;
      let bobY = 0, swayX = 0, lookYaw = 0;

      if (t < T.titleEnd) {
        bobY = Math.sin(t * 1.4) * 0.012;
      } else if (t < T.walkEnd) {
        if (!labelWalk) { labelWalk = true; setPhaseLabel("walk"); }
        const k = (t - T.titleEnd) / (T.walkEnd - T.titleEnd);
        camZ = THREE.MathUtils.lerp(START_Z, STOP_Z + 0.5, ease(k));
        const stride = t * 5.6;
        bobY = Math.abs(Math.sin(stride)) * 0.055;
        swayX = Math.sin(stride * 0.5) * 0.045;
        lookYaw = Math.sin(t * 0.7) * 0.02;
      } else if (t < T.stopEnd) {
        const k = (t - T.walkEnd) / (T.stopEnd - T.walkEnd);
        camZ = THREE.MathUtils.lerp(STOP_Z + 0.5, STOP_Z, ease(k));
        bobY = (1 - k) * 0.02 * Math.sin(t * 5.6);
      } else if (t < T.knockEnd) {
        if (!labelKnock) { labelKnock = true; setPhaseLabel("knock"); }
        camZ = STOP_Z;
        const kt = t - T.stopEnd;
        if (kt > 0.25 && !knocked1) { knocked1 = true; setKnockRings(r => [...r, Date.now()]); }
        if (kt > 0.85 && !knocked2) { knocked2 = true; setKnockRings(r => [...r, Date.now() + 1]); }
        const pulse = (knocked1 && kt < 0.45) || (knocked2 && kt > 0.85 && kt < 1.05);
        bobY = pulse ? Math.sin(kt * 40) * 0.008 : 0;
      } else if (t < T.openEnd) {
        camZ = STOP_Z;
        const k = ease((t - T.knockEnd) / (T.openEnd - T.knockEnd));
        doorGroup.rotation.y = -k * Math.PI * 0.52;
        roomGlow.intensity = k * 14;
        (glowPlane.material as THREE.MeshBasicMaterial).opacity = k * 0.55;
      } else if (t < T.throughEnd) {
        if (!labelEnter) { labelEnter = true; setPhaseLabel("enter"); }
        const k = ease((t - T.openEnd) / (T.throughEnd - T.openEnd));
        camZ = THREE.MathUtils.lerp(STOP_Z, DOOR_Z - 0.8, k);
        const stride = t * 5.0;
        bobY = Math.abs(Math.sin(stride)) * 0.04 * (1 - k * 0.5);
        roomGlow.intensity = 14 + k * 30;
        (glowPlane.material as THREE.MeshBasicMaterial).opacity = 0.55 + k * 0.45;
        renderer.toneMappingExposure = 1.05 + k * 1.6;
      } else if (t < T.whiteEnd) {
        renderer.toneMappingExposure = 2.65 + (t - T.throughEnd) * 6;
      } else {
        if (!doneRef.current) {
          doneRef.current = true;
          setPhaseLabel("done");
          onComplete();
        }
        return;
      }

      camera.position.set(swayX, EYE + bobY, camZ);
      camera.rotation.set(0, lookYaw, swayX * -0.25);
      renderer.render(scene, camera);
      tryAdapt();
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      scene.traverse(o => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(m)) m.forEach(x => x.dispose());
        else m?.dispose?.();
      });
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [onComplete]);

  return (
    <div className="fp-root">
      <div ref={mountRef} className="fp-canvas" />

      <div className={`fp-title ${phaseLabel !== "title" ? "fp-title--out" : ""}`}>
        <span className="fp-line" />
        <p>{consulate}</p>
        <p className="fp-sub">F-1 VISA INTERVIEW</p>
        <span className="fp-line" />
      </div>

      {knockRings.map(id => (
        <span key={id} className="fp-ring" onAnimationEnd={() =>
          setKnockRings(r => r.filter(x => x !== id))} />
      ))}

      <p className={`fp-caption ${phaseLabel === "knock" ? "fp-caption--in" : ""}`}>
        You knock twice.
      </p>

      <div className={`fp-white ${phaseLabel === "done" ? "fp-white--on" : ""}`} />

      <button className="fp-skip" onClick={() => {
        if (!doneRef.current) { doneRef.current = true; onComplete(); }
      }}>
        Skip intro →
      </button>

      <style jsx>{`
        .fp-root { position: fixed; inset: 0; z-index: 90; background: #07090c; }
        .fp-canvas { position: absolute; inset: 0; }
        .fp-title {
          position: absolute; inset: 0; z-index: 5;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 14px; color: #f5f1e8;
          background: rgba(5, 6, 7, 0.55);
          opacity: 1; transition: opacity 0.8s ease;
          pointer-events: none;
        }
        .fp-title--out { opacity: 0; }
        .fp-title p { margin: 0; font-size: 13px; letter-spacing: 0.3em; }
        .fp-sub { font-size: 10px !important; opacity: 0.55; }
        .fp-line { width: 42px; height: 1px; background: #f5f1e8; opacity: 0.35; }
        .fp-ring {
          position: absolute; top: 46%; left: 50%; z-index: 6;
          width: 26px; height: 26px; border-radius: 50%;
          border: 2px solid rgba(245, 241, 232, 0.85);
          transform: translate(-50%, -50%);
          animation: fpRing 0.6s ease-out forwards;
          pointer-events: none;
        }
        @keyframes fpRing {
          from { transform: translate(-50%,-50%) scale(0.4); opacity: 1; }
          to { transform: translate(-50%,-50%) scale(3.2); opacity: 0; }
        }
        .fp-caption {
          position: absolute; bottom: 12%; left: 50%; z-index: 6;
          transform: translateX(-50%) translateY(8px);
          color: rgba(245,241,232,0.75); font-size: 13px;
          font-style: italic; letter-spacing: 0.06em;
          opacity: 0; transition: all 0.6s ease; pointer-events: none;
          margin: 0;
        }
        .fp-caption--in { opacity: 1; transform: translateX(-50%) translateY(0); }
        .fp-white {
          position: absolute; inset: 0; z-index: 8; background: #f5f1e8;
          opacity: 0; pointer-events: none; transition: opacity 0.5s ease;
        }
        .fp-white--on { opacity: 1; }
        .fp-skip {
          position: absolute; bottom: 22px; right: 22px; z-index: 10;
          background: rgba(245,241,232,0.08);
          border: 1px solid rgba(245,241,232,0.25);
          color: rgba(245,241,232,0.85); font-size: 12px;
          padding: 8px 14px; border-radius: 8px; cursor: pointer;
          backdrop-filter: blur(8px);
        }
        .fp-skip:hover { background: rgba(245,241,232,0.16); }
      `}</style>
    </div>
  );
}
