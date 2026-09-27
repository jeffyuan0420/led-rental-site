// LED 摺疊機 3D 模型：移植自 Persona 3D 型錄 ledfold builder
// 兩折機：下片固定，上片鉸鏈在背面，折疊＝往後翻 180° 磁吸貼齊（半高雙面）
// 三折機：中片固定，左右兩片向後折 180° 磁吸貼到中片背面（前後雙面）
// 只有展開時能拼接；多台時整面素材依台數切割 UV
import * as THREE from "three";
import S from "./catalog-scenes";

const { M, box, roundedBox, cyl } = S;

export type LedType = "single" | "triple";

// 公尺；與 products.js 的 dims 一致
export const LED_DIMS = {
  single: { two: true, w: 0.664, sh: 1.92, base: 0.16, d: 0.44 },
  triple: { two: false, w: 1.28, sh: 1.92, base: 0.1458, d: 0.4888 },
} as const;

export interface LedModel {
  group: THREE.Group;
  width: number;
  height: number; // 含底座總高
  setFold(k: number): void; // 0 = 展開, 1 = 折疊
  dispose(): void;
}

function grilleTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#16181b";
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = "#383c42";
  for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) { g.beginPath(); g.arc(4 + a * 8, 4 + b * 8, 2.4, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 8);
  return t;
}

// wholeFrame：折疊時每一面都顯示完整、正向的畫面（示範影片用，因為它不是頭對頭格式）
// 否則照素材指南的畫布排法（兩折頭對頭；三折 A右半｜B｜A左半）
export function buildLed(type: LedType, count: number, screen: THREE.Material, wholeFrame = false): LedModel {
  const d = LED_DIMS[type], two = d.two, g = new THREE.Group();
  const n = count, gap = 0.004, uw = d.w, W = n * uw + (n - 1) * gap, H = d.sh, base = d.base;
  const frameM = M("#15171a", { roughness: 0.45, metalness: 0.3 }), baseM = M("#1f2226", { roughness: 0.5, metalness: 0.3 }), chrome = M("#c9ced4", { metalness: 0.85, roughness: 0.25 });
  const face = (w: number, h: number, u0: number, u1: number, v0: number, v1: number) => {
    const geo = new THREE.PlaneGeometry(w, h), uv = geo.attributes.uv;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, u0 + uv.getX(k) * (u1 - u0), v0 + uv.getY(k) * (v1 - v0));
    return new THREE.Mesh(geo, screen);
  };
  const casters = (parent: THREE.Object3D, xs: number[], zs: number[], r: number) => xs.forEach(x => zs.forEach(z => {
    cyl(parent, 0.012, 0.012, 0.03, chrome, x, r * 2 + 0.012, z, 8);
    cyl(parent, r, r, 0.022, "#15171a", x, r, z, 16).rotation.z = Math.PI / 2;
    cyl(parent, r * 0.45, r * 0.45, 0.024, chrome, x, r, z, 12).rotation.z = Math.PI / 2;
  }));
  const grille = two ? new THREE.MeshStandardMaterial({ map: grilleTexture(), roughness: 0.8 }) : null;

  type Unit = { Up?: THREE.Group; P1?: THREE.Group; P3?: THREE.Group };
  const units: Unit[] = [];
  // 折疊後要換 UV 的螢幕面：open＝展開時，fold＝折疊時（map 對每個 u、v 分別轉換）
  const swaps: { attr: THREE.BufferAttribute; open: Float32Array; fold: Float32Array }[] = [];
  const addSwap = (m: THREE.Mesh, fu: (u: number) => number, fv: (v: number) => number) => {
    const attr = m.geometry.attributes.uv as THREE.BufferAttribute, open = Float32Array.from(attr.array as Float32Array);
    swaps.push({ attr, open, fold: open.map((v, k) => (k % 2 === 0 ? fu(v) : fv(v))) });
  };
  for (let i = 0; i < n; i++) {
    const x = -W / 2 + uw / 2 + i * (uw + gap), U = new THREE.Group(); U.position.x = x; g.add(U);
    const ua = (x - uw / 2 + W / 2) / W, ub = (x + uw / 2 + W / 2) / W;
    if (two) {
      // 底座：4 輪 → 弧形底板 → 喇叭座（兩側喇叭網）
      const r = 0.02, plateY = r * 2 + 0.012;
      casters(U, [-(uw / 2 - 0.04), uw / 2 - 0.04], [-(d.d / 2 - 0.05), d.d / 2 - 0.05], r);
      const plate = roundedBox(uw + 0.03, 0.04, d.d, 0.03, baseM); plate.position.set(0, plateY + 0.02, 0); U.add(plate);
      const hy = plateY + 0.04, hh0 = base - hy;
      box(uw, hh0, 0.09, baseM, 0, hy + hh0 / 2, 0, U);
      [-1, 1].forEach(s => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.12, hh0 * 0.5), grille!); m.position.set(s * uw * 0.28, hy + hh0 / 2, 0.0455); U.add(m); });
      const hh = H / 2, L = new THREE.Group(); L.position.y = base; U.add(L);
      box(uw, hh, 0.035, frameM, 0, hh / 2, 0, L);
      const fl = face(uw - 0.012, hh - 0.004, ua, ub, 0, 0.5); fl.position.set(0, hh / 2, 0.0181); L.add(fl);
      const Up = new THREE.Group(); Up.position.set(0, hh, -0.0175); L.add(Up);
      box(uw, hh, 0.035, frameM, 0, hh / 2, 0.0175, Up);
      const fu = face(uw - 0.012, hh - 0.004, ua, ub, 0.5, 1); fu.position.set(0, hh / 2, 0.0356); Up.add(fu);
      // 上片往後翻 180° 後，從背面看畫面會轉 180°，UV 反轉抵銷，兩面都呈現正向
      if (wholeFrame) {
        addSwap(fl, u => u, v => v * 2); // 正面：整張
        addSwap(fu, u => ua + ub - u, v => 2 - 2 * v); // 背面：整張，轉正
      } else {
        // 素材指南「頭對頭」畫布：上半＝面 1 正向，下半＝面 2 旋轉 180°
        addSwap(fl, u => ua + ub - u, v => 0.5 - v);
        addSwap(fu, u => ua + ub - u, v => 1.5 - v);
      }
      units.push({ Up });
    } else {
      // 底座：平板＋4 輪；螢幕 640＋左右各 320（像素 344＋172×2）
      const pw = uw / 4, cw = uw / 2, r = 0.035, plateW = uw * 0.75;
      casters(U, [-(plateW / 2 - 0.05), plateW / 2 - 0.05], [-(d.d / 2 - 0.06), d.d / 2 - 0.06], r);
      box(plateW, base - (r * 2 + 0.03), d.d, baseM, 0, (base + r * 2 + 0.03) / 2, 0, U);
      const C = new THREE.Group(); C.position.y = base; U.add(C);
      box(cw, H, 0.035, frameM, 0, H / 2, 0, C);
      const fc = face(cw - 0.008, H - 0.004, ua + (ub - ua) * 0.25, ua + (ub - ua) * 0.75, 0, 1); fc.position.set(0, H / 2, 0.0181); C.add(fc);
      if (wholeFrame) addSwap(fc, u => (u - ua - (ub - ua) * 0.25) * 2, v => v);
      const side = (s: number) => {
        const hinge = new THREE.Group(); hinge.position.set(s * cw / 2, 0, -0.018); C.add(hinge);
        box(pw, H, 0.035, frameM, s * pw / 2, H / 2, 0.018, hinge);
        const f = face(pw - 0.008, H - 0.004, s < 0 ? ua : ua + (ub - ua) * 0.75, s < 0 ? ua + (ub - ua) * 0.25 : ub, 0, 1); f.position.set(s * pw / 2, H / 2, 0.0361); hinge.add(f);
        // 折到背面後，左片在觀眾右手邊：左片顯示右半、右片顯示左半，合成完整背面
        if (wholeFrame) addSwap(f, s < 0 ? u => 0.5 + (u - ua) * 2 : u => (u - ua - (ub - ua) * 0.75) * 2, v => v);
        return hinge;
      };
      units.push({ P1: side(-1), P3: side(1) });
    }
  }

  let folded = false;
  const setFold = (k: number) => units.forEach(u => {
    if (u.Up) {
      u.Up.rotation.x = -Math.PI * k;
    } else {
      u.P1!.rotation.y = -Math.PI * k;
      u.P3!.rotation.y = Math.PI * k;
    }
  });
  const setFoldTracked = (k: number) => {
    setFold(k);
    const want = k > 0.5;
    if (want !== folded) swaps.forEach(w => { (w.attr.array as Float32Array).set(want ? w.fold : w.open); w.attr.needsUpdate = true; });
    folded = want;
  };
  setFoldTracked(0);

  return {
    group: g, width: W, height: base + H,
    setFold: setFoldTracked,
    dispose() { g.traverse(o => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); }); grille?.map?.dispose(); grille?.dispose(); },
  };
}
