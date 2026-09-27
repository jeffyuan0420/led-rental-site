// 四點透視變形（homography）：把矩形素材貼到照片上任意四邊形
export type Pt = { x: number; y: number };
export type Mat3 = number[]; // row-major 3×3，h8 固定為 1

// 解 src[i] → dst[i] 的 homography（8×8 高斯消去）
export function solveHomography(src: Pt[], dst: Pt[]): Mat3 {
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i], { x: u, y: v } = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  for (let c = 0; c < 8; c++) {
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    const d = A[c][c] || 1e-12;
    for (let k = c; k < 9; k++) A[c][k] /= d;
    for (let r = 0; r < 8; r++) {
      if (r === c) continue;
      const f = A[r][c];
      for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k];
    }
  }
  return [...A.map(r => r[8]), 1];
}

export function invert3(m: Mat3): Mat3 {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C || 1e-12;
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map(v => v / det);
}

// 給 transform-origin: 0 0 的元素用
export function toCssMatrix3d(h: Mat3): string {
  const [h0, h1, h2, h3, h4, h5, h6, h7, h8] = h;
  return `matrix3d(${[h0, h3, 0, h6, h1, h4, 0, h7, 0, 0, 1, 0, h2, h5, 0, h8].join(",")})`;
}

// 把素材畫到照片上（逐像素反向取樣，雙線性內插），回傳新的 canvas
export function compositeWarp(photo: CanvasImageSource, pw: number, ph: number, content: HTMLCanvasElement, quad: Pt[]): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = pw;
  out.height = ph;
  const g = out.getContext("2d")!;
  g.drawImage(photo, 0, 0, pw, ph);
  const cw = content.width, ch = content.height;
  const src = content.getContext("2d")!.getImageData(0, 0, cw, ch).data;
  const Hinv = invert3(solveHomography([{ x: 0, y: 0 }, { x: cw, y: 0 }, { x: cw, y: ch }, { x: 0, y: ch }], quad));
  const x0 = Math.max(0, Math.floor(Math.min(...quad.map(p => p.x)))), x1 = Math.min(pw, Math.ceil(Math.max(...quad.map(p => p.x))));
  const y0 = Math.max(0, Math.floor(Math.min(...quad.map(p => p.y)))), y1 = Math.min(ph, Math.ceil(Math.max(...quad.map(p => p.y))));
  if (x1 <= x0 || y1 <= y0) return out;
  const img = g.getImageData(x0, y0, x1 - x0, y1 - y0), dst = img.data, bw = x1 - x0;
  const [a, b, c, d, e, f, gg, h, i] = Hinv;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const px = x + 0.5, py = y + 0.5, w = gg * px + h * py + i;
      const u = (a * px + b * py + c) / w - 0.5, v = (d * px + e * py + f) / w - 0.5;
      if (u < -0.5 || v < -0.5 || u > cw - 0.5 || v > ch - 0.5) continue;
      const ux = Math.min(cw - 1, Math.max(0, u)), vy = Math.min(ch - 1, Math.max(0, v));
      const ix = Math.floor(ux), iy = Math.floor(vy), fx = ux - ix, fy = vy - iy;
      const ix1 = Math.min(cw - 1, ix + 1), iy1 = Math.min(ch - 1, iy + 1);
      const o = ((y - y0) * bw + (x - x0)) * 4;
      for (let k = 0; k < 3; k++) {
        const p00 = src[(iy * cw + ix) * 4 + k], p10 = src[(iy * cw + ix1) * 4 + k];
        const p01 = src[(iy1 * cw + ix) * 4 + k], p11 = src[(iy1 * cw + ix1) * 4 + k];
        dst[o + k] = (p00 * (1 - fx) + p10 * fx) * (1 - fy) + (p01 * (1 - fx) + p11 * fx) * fy;
      }
      dst[o + 3] = 255;
    }
  }
  g.putImageData(img, x0, y0);
  return out;
}
