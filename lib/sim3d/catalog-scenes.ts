/* eslint-disable */
// @ts-nocheck
// 場景與共用建模工具：移植自 Persona 3D 型錄（persona-catalog/index.html）
// 原檔為 three r128；此處改用 npm three，貼圖加上 sRGB 色彩空間以維持原本色調
import * as THREE from "three";

const matCache = {};
function M(color, o = {}) {
  const k = color + JSON.stringify(o);
  return matCache[k] || (matCache[k] = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.55, metalness: 0.1 }, o)));
}
function mesh(geo, mat) { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m; }
function box(w, h, d, color, x, y, z, parent, o) { const b = mesh(new THREE.BoxGeometry(w, h, d), typeof color === 'string' ? M(color, o) : color); b.position.set(x, y, z); if (parent) parent.add(b); return b; }
function roundedBox(w, h, d, r, mat) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 0.01, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 2, curveSegments: 8 });
  g.translate(0, 0, -(d - 0.01) / 2);
  return mesh(g, mat);
}
const texCache = {};
function labelTexture(txt, { w = 512, h = 128, font = '700 64px "Segoe UI",Arial,sans-serif', color = '#fff', bg = null } = {}) {
  const k = [txt, w, h, font, color, bg].join('|'); if (texCache[k]) return texCache[k];
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  g.fillStyle = color; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return (texCache[k] = t);
}
function disposeTree(o) { o.traverse(m => { if (m.geometry) m.geometry.dispose(); }); }
function plant(parent, x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
  const pot = mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.34, 16), M('#e9e4dc')); pot.position.y = 0.17; g.add(pot);
  for (let i = 0; i < 7; i++) { const l = mesh(new THREE.IcosahedronGeometry(0.16, 0), M('#5f8f5a', { flatShading: true })); l.position.set(Math.sin(i * 2.4) * 0.12, 0.45 + i * 0.07, Math.cos(i * 2.4) * 0.12); g.add(l); }
}
function floorPatch(parent, w, d, color, x, z) { const m = mesh(new THREE.PlaneGeometry(w, d), M(color, { roughness: 1 })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.003, z); m.castShadow = false; parent.add(m); return m; }
/* ---- 程式繪製材質（不用外部圖片，離線可用）---- */
const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function canvasTex(key, w, h, draw, rx = 1, ry = 1) {
  const k = key + '|' + rx + '|' + ry; if (texCache[k]) return texCache[k];
  let src = texCache[key + '|src'];
  if (!src) { src = document.createElement('canvas'); src.width = w; src.height = h; draw(src.getContext('2d'), w, h); texCache[key + '|src'] = src; }
  const t = new THREE.CanvasTexture(src); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8;
  return (texCache[k] = t);
}
const TEX = {
  // 木地板：1024px ＝ 2.4m，8 列木條
  planks: (rx, ry) => canvasTex('planks', 1024, 1024, (g, w, h) => {
    const r = rng(7), rows = 8, ph = h / rows;
    for (let i = 0; i < rows; i++) {
      let x = -r() * w * 0.5;
      while (x < w) {
        const L = w * (0.3 + r() * 0.4);
        g.fillStyle = `hsl(${28 + r() * 6},${36 + r() * 12}%,${58 + r() * 10}%)`; g.fillRect(x, i * ph, L, ph);
        g.lineWidth = 1.2;
        for (let k = 0; k < 9; k++) {
          const y = i * ph + 4 + r() * (ph - 8); g.strokeStyle = `rgba(95,58,28,${0.06 + r() * 0.1})`;
          g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + L * 0.3, y + (r() - 0.5) * 7, x + L * 0.7, y + (r() - 0.5) * 7, x + L, y + (r() - 0.5) * 4); g.stroke();
        }
        g.fillStyle = 'rgba(55,32,14,0.45)'; g.fillRect(x, i * ph, 2, ph);
        x += L;
      }
      g.fillStyle = 'rgba(55,32,14,0.4)'; g.fillRect(0, i * ph, w, 2);
    }
  }, rx, ry),
  // 乳膠漆牆面：細微顆粒
  paint: (base, rx, ry) => canvasTex('paint' + base, 256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); const r = rng(3);
    for (let i = 0; i < 2600; i++) { g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.035)'; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
  }, rx, ry),
  // 木質護牆板：直向溝槽
  wainscot: rx => canvasTex('wainscot', 512, 256, (g, w, h) => {
    const r = rng(11); g.fillStyle = '#cfa97c'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 64) {
      g.fillStyle = `hsla(30,40%,${55 + r() * 8}%,0.5)`; g.fillRect(x + 3, 0, 58, h);
      g.fillStyle = 'rgba(70,40,15,0.45)'; g.fillRect(x, 0, 3, h);
      g.fillStyle = 'rgba(255,240,220,0.25)'; g.fillRect(x + 3, 0, 2, h);
    }
  }, rx, 1),
  // 軟木公布欄＋釘上的通知單
  cork: () => canvasTex('cork', 768, 512, (g, w, h) => {
    const r = rng(5); g.fillStyle = '#c0915f'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${r() > 0.5 ? '90,55,25' : '235,200,150'},${0.15 + r() * 0.25})`; g.fillRect(r() * w, r() * h, 2, 2); }
    const notes = [[40, 40, 190, 240, '#ffffff'], [260, 60, 170, 130, '#fff3a8'], [460, 30, 260, 180, '#ffffff'], [270, 230, 160, 180, '#bfe3ff'], [470, 250, 120, 120, '#ffd0d8'], [610, 260, 120, 200, '#ffffff'], [60, 320, 170, 150, '#c9f0cf']];
    notes.forEach(([x, y, nw, nh, c], i) => {
      g.save(); g.translate(x + nw / 2, y + nh / 2); g.rotate((r() - 0.5) * 0.08);
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(-nw / 2 + 4, -nh / 2 + 5, nw, nh);
      g.fillStyle = c; g.fillRect(-nw / 2, -nh / 2, nw, nh);
      g.fillStyle = ['#0b6bcb', '#e0572c', '#1f9d6a'][i % 3]; g.fillRect(-nw / 2 + 14, -nh / 2 + 18, nw * 0.55, 10);
      g.fillStyle = 'rgba(40,50,60,0.35)'; for (let l = 0; l < Math.floor((nh - 50) / 16); l++) g.fillRect(-nw / 2 + 14, -nh / 2 + 42 + l * 16, (nw - 28) * (0.6 + r() * 0.4), 4);
      g.fillStyle = ['#e0572c', '#0b6bcb', '#f2b233'][i % 3]; g.beginPath(); g.arc(0, -nh / 2 + 6, 7, 0, 7); g.fill();
      g.restore();
    });
  }),
  // 窗外天空（帶一點雲與遠樹）
  sky: () => canvasTex('sky', 256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8cc4f2'); gr.addColorStop(0.7, '#d7ecfb'); gr.addColorStop(1, '#eaf5fd');
    g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = rng(9);
    for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(r() * w, 30 + r() * 70, 20 + r() * 30, 8 + r() * 8, 0, 0, 7); g.fill(); }
    for (let i = 0; i < 40; i++) { g.fillStyle = `hsl(${100 + r() * 30},35%,${38 + r() * 14}%)`; g.beginPath(); g.arc(r() * w, h - 20 + r() * 10, 14 + r() * 16, 0, 7); g.fill(); }
  }),
  // 時鐘面板（10:10）
  clock: () => canvasTex('clock', 256, 256, (g, w) => {
    const c = w / 2; g.fillStyle = '#fbfbf8'; g.beginPath(); g.arc(c, c, c, 0, 7); g.fill();
    g.strokeStyle = '#222'; for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, l = i % 5 ? 8 : 22; g.lineWidth = i % 5 ? 2 : 6; g.beginPath(); g.moveTo(c + Math.sin(a) * (c - 10), c - Math.cos(a) * (c - 10)); g.lineTo(c + Math.sin(a) * (c - 10 - l), c - Math.cos(a) * (c - 10 - l)); g.stroke(); }
    const hand = (a, l, lw, col) => { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.sin(a) * l, c - Math.cos(a) * l); g.stroke(); };
    hand(Math.PI * 2 * (10 + 10 / 60) / 12, c * 0.5, 9, '#222'); hand(Math.PI * 2 * (10 / 60), c * 0.75, 6, '#222'); hand(Math.PI * 0.9, c * 0.8, 2, '#e0572c');
    g.fillStyle = '#222'; g.beginPath(); g.arc(c, c, 8, 0, 7); g.fill();
  }),
  // 筆記本內頁
  notebook: () => canvasTex('notebook', 256, 192, (g, w, h) => {
    g.fillStyle = '#fdfdfb'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(11,107,203,0.25)'; for (let y = 24; y < h; y += 16) g.fillRect(0, y, w, 2);
    g.fillStyle = '#c9ced4'; g.fillRect(w / 2 - 2, 0, 4, h); const r = rng(13);
    g.fillStyle = 'rgba(40,50,70,0.55)'; for (let l = 0; l < 7; l++) g.fillRect(12, 30 + l * 16, (w / 2 - 30) * (0.5 + r() * 0.5), 3);
  })
};
Object.assign(TEX, {
  // 方塊地毯：細顆粒＋接縫（1 張 ＝ 一塊地毯）
  carpet: (base, rx, ry) => canvasTex('carpet' + base, 256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); const r = rng(21);
    for (let i = 0; i < 9000; i++) { g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
    g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h);
  }, rx, ry),
  // 拋光磁磚：512px ＝ 2 × 2 塊 60cm
  tiles: (rx, ry) => canvasTex('tiles', 512, 512, (g, w, h) => {
    const r = rng(17);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      g.fillStyle = `hsl(40,8%,${89 + r() * 4}%)`; g.fillRect(i * 256, j * 256, 256, 256);
      for (let k = 0; k < 400; k++) { g.fillStyle = 'rgba(0,0,0,0.03)'; g.fillRect(i * 256 + r() * 256, j * 256 + r() * 256, 2, 2); }
    }
    g.fillStyle = '#cfcac2'; for (let i = 0; i <= 2; i++) { g.fillRect(i * 256 - 2, 0, 4, h); g.fillRect(0, i * 256 - 2, w, 4); }
  }, rx, ry),
  // 大理石：白底灰紋，1024px ＝ 2 × 2 塊
  marble: (rx, ry) => canvasTex('marble', 1024, 1024, (g, w, h) => {
    g.fillStyle = '#f1eee9'; g.fillRect(0, 0, w, h); const r = rng(29);
    for (let v = 0; v < 18; v++) {
      let x = r() * w, y = 0; g.strokeStyle = `rgba(${120 + r() * 40},${115 + r() * 30},${110 + r() * 30},${0.15 + r() * 0.25})`; g.lineWidth = 0.8 + r() * 2.5;
      g.beginPath(); g.moveTo(x, y); while (y < h) { x += (r() - 0.5) * 60; y += 20 + r() * 40; g.lineTo(x, y); } g.stroke();
    }
    g.fillStyle = 'rgba(160,150,140,0.5)'; for (let i = 0; i <= 2; i++) { g.fillRect(i * 512 - 1, 0, 2, h); g.fillRect(0, i * 512 - 1, w, 2); }
  }, rx, ry),
  // 木格柵：深色底＋直條木料（512px ＝ 1.6m）
  slats: (dark, light, rx) => canvasTex('slats' + dark + light, 512, 64, (g, w, h) => {
    g.fillStyle = dark; g.fillRect(0, 0, w, h); const r = rng(33);
    for (let x = 0; x < w; x += 32) { g.fillStyle = `hsl(30,38%,${light + r() * 8}%)`; g.fillRect(x + 6, 0, 20, h); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(x + 6, 0, 3, h); }
  }, rx, 1),
  // 落地窗外的城市天際線
  skyline: () => canvasTex('skyline', 512, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9cc9ee'); gr.addColorStop(1, '#e4f1fb'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = rng(41);
    for (let layer = 0; layer < 2; layer++) {
      let x = 0;
      while (x < w) {
        const bw = 20 + r() * 45, bh = (layer ? 60 : 100) + r() * (layer ? 70 : 120);
        g.fillStyle = layer ? `hsl(210,15%,${55 + r() * 10}%)` : `hsl(210,12%,${72 + r() * 8}%)`; g.fillRect(x, h - bh, bw, bh);
        if (layer) { g.fillStyle = 'rgba(255,255,255,0.35)'; for (let wy = h - bh + 8; wy < h - 6; wy += 10) for (let wx = x + 4; wx < x + bw - 4; wx += 8) if (r() > 0.4) g.fillRect(wx, wy, 4, 5); }
        x += bw + 2;
      }
    }
  }),
  // 零售商品包裝
  pack: i => canvasTex('pack' + (i % 6), 128, 160, (g, w, h) => {
    const c = ['#0b6bcb', '#e0572c', '#1f9d6a', '#f2b233', '#7a5af8', '#15202b'][i % 6];
    g.fillStyle = c; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.92)'; g.fillRect(0, h * 0.55, w, h * 0.2);
    g.fillStyle = c; g.font = '800 22px "Segoe UI",Arial,sans-serif'; g.textAlign = 'center'; g.fillText(['PRO', 'MAX', 'GO', 'AIR', 'ONE', 'PLUS'][i % 6], w / 2, h * 0.69);
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.arc(w / 2, h * 0.3, 22, 0, 7); g.fill();
  }),
  // 燈箱海報（漸層＋圓形＋標題）
  poster: (title, sub, c1, c2, w = 512, h = 720) => canvasTex('poster' + title + w, w, h, g => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.16)'; g.beginPath(); g.arc(w * 0.75, h * 0.3, h * 0.24, 0, 7); g.fill(); g.beginPath(); g.arc(w * 0.2, h * 0.62, h * 0.15, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = '800 64px "Segoe UI",Arial,sans-serif';
    title.split('\n').forEach((t, i) => g.fillText(t, 40, h - 190 + i * 70)); g.font = '500 28px "Segoe UI",Arial,sans-serif'; g.fillText(sub, 40, h - 50);
  }),
  // 展館水泥地
  concrete: (rx, ry) => canvasTex('concrete', 256, 256, (g, w, h) => {
    g.fillStyle = '#b9bcbf'; g.fillRect(0, 0, w, h); const r = rng(51);
    for (let i = 0; i < 5000; i++) { g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'; g.fillRect(r() * w, r() * h, 2, 2); }
  }, rx, ry),
  // 飯店掛畫（抽象色塊）
  art: () => canvasTex('art', 400, 300, (g, w, h) => {
    g.fillStyle = '#efe6d8'; g.fillRect(0, 0, w, h); const cols = ['#c9774f', '#2f5d62', '#d9a441', '#8a9a8c'], r = rng(61);
    for (let i = 0; i < 7; i++) { g.fillStyle = cols[i % 4]; g.globalAlpha = 0.8; g.beginPath(); g.arc(r() * w, r() * h, 30 + r() * 80, 0, 7); g.fill(); }
    g.globalAlpha = 1;
  }),
  // 小螢幕畫面（筆電、收銀機）
  ui: () => canvasTex('lapscr', 128, 80, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#0b6bcb'); gr.addColorStop(1, '#36b3a8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(10, 12, 60, 8); g.fillRect(10, 28, 90, 5); g.fillRect(10, 38, 80, 5);
  })
});
function texMat(map, o = {}) { return new THREE.MeshStandardMaterial(Object.assign({ map, roughness: 0.6, metalness: 0 }, o)); }
const glow = color => new THREE.MeshBasicMaterial({ color });
function flat(parent, w, h, mat, x, y, z, rx = 0, ry = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; parent.add(m); return m; }
function cyl(parent, rt, rb, h, color, x, y, z, seg = 16, o) { const m = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof color === 'string' ? M(color, o) : color); m.position.set(x, y, z); parent.add(m); return m; }
// 精緻盆栽：葉片為壓扁的橢球，深淺綠交錯
function leafyPlant(parent, x, z, s = 1, potColor = '#f1ede6') {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
  cyl(g, 0.17, 0.13, 0.36, potColor, 0, 0.18, 0, 24, { roughness: 0.35 });
  cyl(g, 0.155, 0.155, 0.02, '#4a3526', 0, 0.35, 0, 24);
  const r = rng(Math.round(x * 100 + z * 10) + 99);
  for (let i = 0; i < 16; i++) {
    const a = i * 2.39996, t = i / 16, h = 0.45 + t * 0.55, rad = 0.05 + (1 - t) * 0.16;
    const leaf = mesh(new THREE.SphereGeometry(0.11, 10, 6), M(['#4f8a4b', '#63a05a', '#3f7640'][i % 3], { roughness: 0.6 }));
    leaf.scale.set(0.55, 0.16, 1.25); leaf.position.set(Math.sin(a) * rad, h, Math.cos(a) * rad);
    leaf.rotation.set(-0.5 - r() * 0.4, a, 0, 'YXZ'); g.add(leaf);
    const stem = cyl(g, 0.005, 0.006, h - 0.34, '#4d6b35', Math.sin(a) * rad * 0.5, 0.34 + (h - 0.34) / 2, Math.cos(a) * rad * 0.5, 5); stem.castShadow = false;
  }
  return g;
}
// 沙發：底座、坐墊、靠墊、扶手、木腳
function sofa(parent, x, z, ry, w = 2.0, color = '#8a9a8c') {
  const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = ry; parent.add(s);
  const fab = M(color, { roughness: 0.9 }), n = Math.max(2, Math.round(w / 0.7)), cw = (w - 0.3) / n;
  box(w, 0.2, 0.85, fab, 0, 0.2, 0, s);
  for (let i = 0; i < n; i++) {
    const cx = -w / 2 + 0.15 + cw * (i + 0.5);
    const cu = roundedBox(cw - 0.02, 0.68, 0.14, 0.05, fab); cu.rotation.x = -Math.PI / 2; cu.position.set(cx, 0.37, 0.06); s.add(cu);
    const bk = roundedBox(cw - 0.02, 0.42, 0.16, 0.06, fab); bk.position.set(cx, 0.64, -0.28); bk.rotation.x = -0.12; s.add(bk);
  }
  [-1, 1].forEach(k => box(0.15, 0.55, 0.85, fab, k * (w / 2 - 0.075), 0.375, 0, s));
  box(w, 0.32, 0.14, fab, 0, 0.56, -0.36, s);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => cyl(s, 0.02, 0.015, 0.1, '#3a2a1c', a * (w / 2 - 0.1), 0.05, b * 0.35, 8));
  return s;
}
// 吊燈：吊線＋燈罩＋發光燈泡
function pendant(parent, x, y, z, color = '#2b3036', r = 0.18, cordTop = 4.2) {
  cyl(parent, 0.004, 0.004, cordTop - y, '#222', x, (cordTop + y) / 2, z, 4).castShadow = false;
  const sh = mesh(new THREE.CylinderGeometry(r * 0.35, r, r * 0.9, 24, 1, true), M(color, { side: THREE.DoubleSide, roughness: 0.4, metalness: 0.4 })); sh.position.set(x, y, z); parent.add(sh);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(r * 0.3, 12, 8), glow('#fff4dc')); bulb.position.set(x, y - r * 0.3, z); parent.add(bulb);
}
// 軌道投射燈＋淡淡光錐
function trackLight(parent, x, y, z) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  cyl(g, 0.05, 0.07, 0.18, '#2b3036', 0, -0.1, 0.04, 14).rotation.x = 0.55;
  const len = y - 0.3, cone = new THREE.Mesh(new THREE.ConeGeometry(0.6, len, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#fff6e0', transparent: true, opacity: 0.03, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  cone.position.set(0, -len / 2 - 0.15, -len * 0.25); cone.rotation.x = -0.5; g.add(cone);
  return g;
}
// 桁架（兩根主管＋斜撐）
function truss(parent, w, y, z) {
  const t = M('#c9ced4', { metalness: 0.85, roughness: 0.3 });
  [[y, -0.12], [y, 0.12], [y - 0.24, 0]].forEach(([yy, zz]) => cyl(parent, 0.025, 0.025, w, t, 0, yy, z + zz, 8).rotation.z = Math.PI / 2);
  for (let x = -w / 2 + 0.15; x < w / 2; x += 0.3) [-0.12, 0.12].forEach(zz => { const d = cyl(parent, 0.008, 0.008, 0.33, t, x, y - 0.12, z + zz / 2, 4); d.rotation.set(zz > 0 ? 0.46 : -0.46, 0, 0.6); d.castShadow = false; });
}
// 教室選配（尺寸照型錄）：userData.acc 對應 ACCESSORIES 的 id，場景上會出現可點的規格標籤
const ENVS = {
  retail(wz, half) {
    const r = new THREE.Group(), W = Math.max(11, half * 2 + 7), WH = 4.2, sx = half + 1.3;
    // 拋光磁磚地板、白牆、黑色踢腳板、品牌色帶與招牌
    flat(r, W, 10, texMat(TEX.tiles(W / 1.2, 10 / 1.2), { roughness: 0.22, metalness: 0.05 }), 0, 0.002, wz + 5, -Math.PI / 2).castShadow = false;
    box(W, WH, 0.1, texMat(TEX.paint('#f6f3ee', W / 2, WH / 2), { roughness: 0.9 }), 0, WH / 2, wz, r);
    box(W, 0.12, 0.03, '#2b3036', 0, 0.06, wz + 0.065, r);
    box(W, 0.5, 0.04, '#0b6bcb', 0, 3.45, wz + 0.07, r);
    flat(r, 2.4, 0.33, new THREE.MeshBasicMaterial({ map: labelTexture('NEW ARRIVALS', { w: 1024, font: '800 84px "Segoe UI",Arial,sans-serif' }), transparent: true }), 0, 3.45, wz + 0.095);
    // 兩側陳列架：白色層板、藍色價格條、有包裝的商品、層板下燈
    [-sx, sx].forEach((x, side) => {
      box(1.6, 2.2, 0.04, '#ffffff', x, 1.1, wz + 0.08, r, { roughness: 0.4 });
      [-0.8, 0.8].forEach(dx => box(0.04, 2.2, 0.42, '#ffffff', x + dx, 1.1, wz + 0.27, r, { roughness: 0.4 }));
      box(1.64, 0.04, 0.44, '#ffffff', x, 2.22, wz + 0.27, r, { roughness: 0.4 });
      for (let s = 0; s < 4; s++) {
        const y = 0.35 + s * 0.5;
        box(1.56, 0.025, 0.4, '#f1f1f1', x, y, wz + 0.28, r, { roughness: 0.3 });
        box(1.56, 0.03, 0.006, '#0b6bcb', x, y - 0.003, wz + 0.483, r);
        for (let k = 0; k < 6; k++) box(0.17, 0.22, 0.14, texMat(TEX.pack(k + s + side * 2), { roughness: 0.4 }), x - 0.62 + k * 0.25, y + 0.125, wz + 0.31, r);
        for (let k = 0; k < 3; k++) box(0.08, 0.035, 0.004, '#ffffff', x - 0.5 + k * 0.5, y - 0.003, wz + 0.488, r);
      }
      flat(r, 1.5, 0.03, glow('#fff8ea'), x, 2.198, wz + 0.3, Math.PI / 2);
    });
    // 燈箱海報
    const px = sx + 1.55;
    box(0.92, 1.32, 0.06, '#2b3036', px, 1.75, wz + 0.08, r);
    flat(r, 0.84, 1.24, new THREE.MeshBasicMaterial({ map: TEX.poster('SMART\nDISPLAY', 'Touch · Play · Discover', '#0b6bcb', '#7a5af8') }), px, 1.75, wz + 0.115);
    // 結帳櫃台：木紋櫃身、白色檯面、收銀機、購物袋
    const cx = sx + 0.9, cz = wz + 1.9;
    box(1.5, 0.95, 0.6, texMat(TEX.planks(0.8, 0.4), { roughness: 0.45 }), cx, 0.475, cz, r);
    box(1.56, 0.04, 0.66, '#f4f4f2', cx, 0.97, cz, r, { roughness: 0.25 });
    const pos = new THREE.Group(); pos.position.set(cx - 0.3, 0.99, cz); pos.rotation.y = 0.5; r.add(pos);
    box(0.12, 0.2, 0.08, '#2b3036', 0, 0.1, 0, pos);
    const lid = new THREE.Group(); lid.position.set(0, 0.3, 0.02); lid.rotation.x = -0.25; pos.add(lid);
    box(0.34, 0.24, 0.03, '#15171a', 0, 0, 0, lid); flat(lid, 0.31, 0.2, new THREE.MeshBasicMaterial({ map: TEX.ui() }), 0, 0, 0.017);
    box(0.3, 0.36, 0.14, '#e0572c', cx + 0.4, 1.17, cz, r, { roughness: 0.8 });
    [-0.07, 0.07].forEach(d => { const hd = mesh(new THREE.TorusGeometry(0.05, 0.006, 6, 16, Math.PI), M('#2b3036')); hd.position.set(cx + 0.4 + d, 1.35, cz); r.add(hd); });
    // 前方圓形展示台＋商品、角落盆栽
    const dx = -(sx + 0.3), dz = wz + 2.2;
    cyl(r, 0.45, 0.45, 0.75, '#ffffff', dx, 0.375, dz, 40, { roughness: 0.3 });
    cyl(r, 0.47, 0.47, 0.03, '#0b6bcb', dx, 0.765, dz, 40);
    [0, 1, 2].forEach(i => box(0.2, 0.26, 0.15, texMat(TEX.pack(i + 3), { roughness: 0.4 }), dx - 0.2 + i * 0.2, 0.91, dz + (i % 2) * 0.1, r).rotation.y = (i - 1) * 0.3);
    leafyPlant(r, -(sx + 1.5), wz + 0.5, 1.3);
    // 天花軌道燈
    box(W * 0.6, 0.04, 0.04, '#2b3036', 0, 3.95, wz + 1.8, r);
    [-sx, sx].forEach(x => trackLight(r, x, 3.9, wz + 1.8));
    return r;
  },
  hotel(wz, half) {
    const h = new THREE.Group(), W = Math.max(12, half * 2 + 8), WH = 4.2, fw = Math.max(3.2, half * 2 + 1.6);
    // 大理石地板、米色牆、產品後方木格柵主牆＋頂部間接光
    flat(h, W, 10, texMat(TEX.marble(W / 2.4, 10 / 2.4), { roughness: 0.15, metalness: 0.05 }), 0, 0.002, wz + 5, -Math.PI / 2).castShadow = false;
    box(W, WH, 0.1, texMat(TEX.paint('#ece5da', W / 2, WH / 2), { roughness: 0.9 }), 0, WH / 2, wz, h);
    box(W, 0.1, 0.03, '#3b2a1e', 0, 0.05, wz + 0.065, h);
    box(fw, 3.4, 0.04, '#3b2a1e', 0, 1.7, wz + 0.07, h);
    flat(h, fw - 0.04, 3.36, texMat(TEX.slats('#3b2a1e', 42, fw / 1.6), { roughness: 0.55 }), 0, 1.7, wz + 0.092);
    flat(h, fw, 0.05, glow('#ffe2b0'), 0, 3.43, wz + 0.1);
    // 左：接待櫃台（木格柵櫃身、大理石檯面、底部燈條、RECEPTION 字樣、檯燈、花瓶）
    const rx = -(half + 2.2), rz = wz + 1.2;
    const desk = new THREE.Group(); desk.position.set(rx, 0, rz); h.add(desk);
    box(2.4, 1.05, 0.6, texMat(TEX.slats('#3b2a1e', 42, 1.5), { roughness: 0.5 }), 0, 0.525, 0, desk);
    box(2.5, 0.05, 0.7, texMat(TEX.marble(1, 0.3), { roughness: 0.15 }), 0, 1.075, 0, desk);
    flat(desk, 2.3, 0.03, glow('#ffe2b0'), 0, 0.05, 0.302);
    flat(desk, 1.2, 0.15, new THREE.MeshBasicMaterial({ map: labelTexture('RECEPTION', { w: 1024, font: '600 80px "Segoe UI",Arial,sans-serif', color: '#e9d2a8' }), transparent: true }), 0, 0.8, 0.303);
    const brass = M('#c9a24b', { metalness: 0.8, roughness: 0.3 });
    cyl(desk, 0.05, 0.07, 0.03, brass, 0.8, 1.115, 0, 16); cyl(desk, 0.008, 0.008, 0.35, brass, 0.8, 1.28, 0, 6);
    cyl(desk, 0.08, 0.12, 0.14, '#f4ead8', 0.8, 1.48, 0, 20, { roughness: 0.8 });
    cyl(desk, 0.05, 0.07, 0.25, '#2f5d62', -0.8, 1.225, 0, 20, { roughness: 0.2 });
    for (let i = 0; i < 5; i++) {
      cyl(desk, 0.004, 0.004, 0.3, '#4d6b35', -0.8 + (i - 2) * 0.02, 1.48, 0, 4).rotation.z = (i - 2) * 0.12;
      const fl = mesh(new THREE.SphereGeometry(0.035, 8, 6), M(['#f3f0ea', '#e8b4b8'][i % 2])); fl.position.set(-0.8 + (i - 2) * 0.045, 1.64, (i % 2) * 0.03); desk.add(fl);
    }
    [-0.7, 0, 0.7].forEach(dx => pendant(h, rx + dx, 2.35, rz, '#c9a24b', 0.16));
    // 右：休憩區（地毯、沙發、大理石茶几、書本）＋金框掛畫
    const lx = half + 2.2, lz = wz + 2.2;
    flat(h, 2.8, 2.0, texMat(TEX.carpet('#b9a58a', 2, 2), { roughness: 1 }), lx, 0.004, lz, -Math.PI / 2).castShadow = false;
    sofa(h, lx, lz - 0.55, 0, 2.0, '#6f7f73');
    cyl(h, 0.45, 0.45, 0.04, texMat(TEX.marble(0.5, 0.5), { roughness: 0.15 }), lx, 0.42, lz + 0.35, 40);
    cyl(h, 0.05, 0.05, 0.4, brass, lx, 0.2, lz + 0.35, 12);
    [0, 1].forEach(i => box(0.26, 0.03, 0.2, ['#2f5d62', '#c9774f'][i], lx - 0.1 + i * 0.05, 0.455 + i * 0.03, lz + 0.3, h).rotation.y = i * 0.3);
    box(1.3, 0.95, 0.04, brass, lx, 2.0, wz + 0.07, h);
    flat(h, 1.2, 0.85, texMat(TEX.art(), { roughness: 0.8 }), lx, 2.0, wz + 0.093);
    leafyPlant(h, fw / 2 + 0.35, wz + 0.45, 1.4, '#2b3036'); leafyPlant(h, -fw / 2 - 0.35, wz + 0.45, 1.4, '#2b3036');
    return h;
  },
  expo(wz, half) {
    const e = new THREE.Group(), bw = Math.max(4.6, half * 2 + 2.6), bd = 3.0, WH = 3.7;
    // 展館水泥地＋攤位地毯（四周鋁條收邊）
    flat(e, 30, 20, texMat(TEX.concrete(10, 7), { roughness: 0.7 }), 0, 0.001, wz + 6, -Math.PI / 2).castShadow = false;
    flat(e, bw, bd, texMat(TEX.carpet('#34495e', bw / 0.5, bd / 0.5), { roughness: 1 }), 0, 0.004, wz + bd / 2, -Math.PI / 2).castShadow = false;
    box(bw, 0.012, 0.03, '#c9ced4', 0, 0.006, wz + bd, e, { metalness: 0.8, roughness: 0.3 });
    // 背板：白牆＋藍色頂楣＋ PERSONA TAIWAN 招牌
    box(bw, WH, 0.08, '#ffffff', 0, WH / 2, wz, e, { roughness: 0.5 });
    box(bw, 0.5, 0.1, '#0b6bcb', 0, WH - 0.25, wz + 0.02, e);
    flat(e, 1.9, 0.3, new THREE.MeshBasicMaterial({ map: labelTexture('PERSONA TAIWAN', { w: 1024, font: '800 88px "Segoe UI",Arial,sans-serif' }), transparent: true }), 0, WH - 0.25, wz + 0.075);
    // 兩側隔板＋燈箱主視覺
    [-1, 1].forEach(s => {
      const x = s * bw / 2;
      box(0.08, WH, bd, '#f2f4f7', x, WH / 2, wz + bd / 2, e);
      box(0.03, 1.7, bd * 0.62, '#d5d9de', x - s * 0.055, 1.9, wz + bd * 0.55, e, { metalness: 0.5, roughness: 0.3 });
      const tex = s < 0 ? TEX.poster('INTERACTIVE\nDISPLAYS', 'Education · Business · Retail', '#0b6bcb', '#36b3a8', 800, 720) : TEX.poster('SEE IT.\nTOUCH IT.', 'Persona Taiwan', '#15202b', '#0b6bcb', 800, 720);
      flat(e, bd * 0.6, 1.62, new THREE.MeshBasicMaterial({ map: tex }), x - s * 0.072, 1.9, wz + bd * 0.55, 0, -s * Math.PI / 2);
    });
    // 接待桌：白色圓角桌身、藍色底光、LOGO、型錄
    const cx = bw / 2 - 0.85, cz = wz + bd - 0.55;
    const ct = roundedBox(1.0, 1.0, 0.5, 0.08, M('#ffffff', { roughness: 0.3 })); ct.position.set(cx, 0.5, cz); e.add(ct);
    flat(e, 0.9, 0.06, glow('#3b9cff'), cx, 0.07, cz + 0.252);
    flat(e, 0.7, 0.12, new THREE.MeshBasicMaterial({ map: labelTexture('PERSONA', { font: '800 80px "Segoe UI",Arial,sans-serif', color: '#0b6bcb' }), transparent: true }), cx, 0.68, cz + 0.253);
    box(1.04, 0.03, 0.54, '#15202b', cx, 1.015, cz, e, { roughness: 0.3 });
    [0, 1].forEach(i => box(0.21, 0.006, 0.297, i ? '#0b6bcb' : '#ffffff', cx - 0.25 + i * 0.06, 1.035 + i * 0.006, cz, e).rotation.y = i * 0.25);
    // 吧台椅
    [-0.3, 0.3].forEach(dx => {
      cyl(e, 0.18, 0.2, 0.02, '#2b3036', cx + dx, 0.01, cz + 0.6, 24, { metalness: 0.6, roughness: 0.3 });
      cyl(e, 0.02, 0.02, 0.68, '#c9ced4', cx + dx, 0.35, cz + 0.6, 10, { metalness: 0.9, roughness: 0.25 });
      cyl(e, 0.18, 0.16, 0.06, '#0b6bcb', cx + dx, 0.71, cz + 0.6, 24, { roughness: 0.5 });
    });
    // 型錄架
    const rx = -(bw / 2 - 0.45), rz = wz + bd - 0.5;
    box(0.36, 1.3, 0.24, '#d5d9de', rx, 0.65, rz, e, { metalness: 0.5, roughness: 0.3 });
    for (let i = 0; i < 3; i++) {
      const pz = flat(e, 0.28, 0.36, new THREE.MeshBasicMaterial({ map: TEX.pack(i * 2) }), rx, 0.4 + i * 0.4, rz + 0.13, -0.15);
      pz.material.toneMapped = false;
    }
    leafyPlant(e, -(bw / 2 - 0.5), wz + 0.5, 1.2, '#ffffff');
    // 頂部桁架＋投射燈（打在產品上）
    truss(e, bw + 0.2, 3.85, wz + 2.4);
    [-1.2, 0, 1.2].forEach(x => trackLight(e, x, 3.6, wz + 2.4));
    return e;
  },
};
ENVS.outdoor = (wz, half) => {
  const o = new THREE.Group(), fw = Math.max(10, half * 2 + 6);
  box(fw, 7, 0.1, '#cfc6ba', 0, 3.5, wz, o);
  for (let x = -fw / 2 + 1; x < fw / 2; x += 1.4) for (let y = 4.4; y < 6.8; y += 1.2) if (Math.abs(x) > half + 0.6 || y > 4.3) box(0.8, 0.8, 0.04, '#6f8fa8', x, y, wz + 0.06, o, { metalness: 0.4, roughness: 0.2 });
  floorPatch(o, fw, 4, '#9aa1a9', 0, wz + 2);
  [-(half + 1.5), half + 1.5].forEach(x => { box(0.08, 3.2, 0.08, '#2b3036', x, 1.6, wz + 2.8, o); box(0.5, 0.08, 0.2, '#2b3036', x + 0.2, 3.2, wz + 2.8, o); });
  plant(o, -(half + 0.8), wz + 0.6, 1.2); plant(o, half + 0.8, wz + 0.6, 1.2);
  return o;
};

// 原檔為無型別 JS，統一以 any 對外輸出
const api: any = { M, mesh, box, roundedBox, cyl, disposeTree, ENVS };
export default api;
