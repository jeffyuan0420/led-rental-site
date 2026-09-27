"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import S from "@/lib/sim3d/catalog-scenes";
import { buildLed, type LedModel, type LedType } from "@/lib/sim3d/ledModel";

export type SceneKey = "hotel" | "expo" | "retail" | "outdoor";
export type Media = { kind: "video" | "image"; url: string };

export interface Scene3DHandle {
  capture(): string | null; // 目前畫面 PNG dataURL
  flipView(): void; // 鏡頭繞到另一面（看折疊後的背面）
}

interface Props {
  type: LedType;
  quantity: number;
  folded: boolean;
  sceneKey: SceneKey;
  media: Media;
  demo?: boolean; // 示範影片（非頭對頭格式）→ 折疊時每面顯示完整正向畫面
  onUnsupported?: () => void;
}

const WALL_Z = -1.8;
const FOLD_SECONDS = 1.8;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const Scene3D = forwardRef<Scene3DHandle, Props>(function Scene3D({ type, quantity, folded, sceneKey, media, demo = false, onUnsupported }, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const ctx = useRef<{
    renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; controls: OrbitControls;
    screenMat: THREE.MeshBasicMaterial; led: LedModel | null; env: THREE.Object3D | null;
    fold: { from: number; to: number; t0: number; k: number };
    backItems: THREE.Object3D[]; behind: boolean;
    orbit: { from: number; to: number; t0: number } | null;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    capture() {
      const c = ctx.current;
      if (!c) return null;
      c.renderer.render(c.scene, c.camera);
      return c.renderer.domElement.toDataURL("image/png");
    },
    flipView() {
      const c = ctx.current;
      if (!c) return;
      const sp = new THREE.Spherical().setFromVector3(c.camera.position.clone().sub(c.controls.target));
      c.orbit = { from: sp.theta, to: sp.theta + Math.PI, t0: performance.now() };
    },
  }));

  // 初始化 renderer / 場景 / 燈光（只跑一次）
  useEffect(() => {
    const host = hostRef.current!;
    if (!hasWebGL()) { onUnsupported?.(); return; }
    const mobile = matchMedia("(pointer: coarse)").matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#eef1f5");
    scene.fog = new THREE.Fog("#eef1f5", 10, 24);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 80);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = 1.62;

    // 型錄為 r128 舊燈光單位，新版 three 需乘 π 才是同樣亮度
    scene.add(new THREE.HemisphereLight("#ffffff", "#b9c2cc", 0.4 * Math.PI));
    const key = new THREE.DirectionalLight("#fff6ea", 0.75 * Math.PI);
    key.position.set(3, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.setScalar(mobile ? 1024 : 2048);
    Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 });
    key.shadow.bias = -0.0005;
    key.shadow.radius = 5;
    scene.add(key);
    const rim = new THREE.DirectionalLight("#cfe3ff", 0.35 * Math.PI);
    rim.position.set(-3, 3, -3);
    scene.add(rim);

    const screenMat = new THREE.MeshBasicMaterial({ color: "#000", toneMapped: false });
    ctx.current = { renderer, scene, camera, controls, screenMat, led: null, env: null, fold: { from: 0, to: 0, t0: 0, k: 0 }, backItems: [], behind: false, orbit: null };

    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const c = ctx.current!;
      const f = c.fold;
      if (f.k !== f.to) {
        const p = Math.min(1, (now - f.t0) / (FOLD_SECONDS * 1000));
        f.k = p >= 1 ? f.to : f.from + (f.to - f.from) * ease(p);
        c.led?.setFold(f.k);
      }
      // 「轉到另一面」：沿水平方向繞產品轉半圈（不穿過機身）
      if (c.orbit) {
        const p = Math.min(1, (now - c.orbit.t0) / 1400);
        const off = camera.position.clone().sub(controls.target), sp = new THREE.Spherical().setFromVector3(off);
        sp.theta = c.orbit.from + (c.orbit.to - c.orbit.from) * ease(p);
        camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sp));
        if (p >= 1) c.orbit = null;
      }
      controls.update();
      // 鏡頭繞到牆後（看折疊背面）時，隱藏牆面與牆上物件，避免整片被牆擋住
      const behind = camera.position.z < WALL_Z + 0.15;
      if (behind !== c.behind) { c.behind = behind; c.backItems.forEach(o => (o.visible = !behind)); }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      const c = ctx.current;
      if (c?.led) c.led.dispose();
      if (c?.env) S.disposeTree(c.env);
      (screenMat.map as THREE.Texture | null)?.dispose();
      screenMat.dispose();
      pmrem.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
      ctx.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 機型／台數／場景變更 → 重建模型與場景，鏡頭重新取景
  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    if (c.led) { c.scene.remove(c.led.group); c.led.dispose(); }
    if (c.env) { c.scene.remove(c.env); S.disposeTree(c.env); }
    const n = folded ? 1 : quantity;
    const led = buildLed(type, n, c.screenMat, demo);
    c.scene.add(led.group);
    const env: THREE.Object3D = S.ENVS[sceneKey](WALL_Z, led.width / 2);
    c.scene.add(env);
    c.led = led;
    c.env = env;
    env.updateMatrixWorld(true);
    const wp = new THREE.Vector3();
    c.backItems = [];
    c.behind = false;
    env.traverse(o => { if ((o as THREE.Mesh).isMesh && o.getWorldPosition(wp).z <= WALL_Z + 0.12) c.backItems.push(o); });
    // 多台拼接中按折疊 → 先重建成 1 台展開，再接著播折疊動畫
    const to = folded ? 1 : 0, from = c.fold.k;
    c.fold = { from, to, t0: performance.now(), k: from };
    led.setFold(from);

    const W = led.width, cy = led.height / 2;
    c.camera.position.set(W * 0.3 + 0.8, 1.35, W * 0.8 + 3.6);
    c.controls.target.set(0, cy - 0.05, 0);
    const dz = c.camera.position.distanceTo(c.controls.target);
    c.controls.minDistance = 0.8;
    c.controls.maxDistance = dz * 1.6;
    c.controls.update();
    // 折疊切換只在這裡處理初始狀態；動畫由下方 effect 觸發
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, quantity, sceneKey, demo]);

  // 展開 ↔ 折疊：播放開合動畫（多台時已由父層限制為 1 台）
  useEffect(() => {
    const c = ctx.current;
    if (!c || !c.led) return;
    const to = folded ? 1 : 0;
    if (c.fold.to === to) return;
    c.fold = { from: c.fold.k, to, t0: performance.now(), k: c.fold.k };
  }, [folded]);

  // 素材：影片用 VideoTexture，圖片用 Texture；一律填滿整面（解析度不符就會被拉伸，與實機一致）
  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    let tex: THREE.Texture;
    let video: HTMLVideoElement | null = null;
    let cancelled = false;
    if (media.kind === "video") {
      video = document.createElement("video");
      video.src = media.url;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      video.play().catch(() => {});
      tex = new THREE.VideoTexture(video);
    } else {
      tex = new THREE.Texture();
      const img = new Image();
      img.onload = () => { if (cancelled) return; tex.image = img; tex.needsUpdate = true; };
      img.src = media.url;
    }
    tex.colorSpace = THREE.SRGBColorSpace;
    const old = c.screenMat.map;
    c.screenMat.map = tex;
    c.screenMat.color.set("#fff");
    c.screenMat.needsUpdate = true;
    old?.dispose();
    return () => {
      cancelled = true;
      if (video) { video.pause(); video.removeAttribute("src"); video.load(); }
    };
  }, [media]);

  return <div ref={hostRef} className="w-full h-full" />;
});

export default Scene3D;
