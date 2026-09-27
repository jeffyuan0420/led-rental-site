// 客戶素材：只在瀏覽器本機讀取（URL.createObjectURL），不上傳伺服器
import type { LedType } from "./ledModel";

export const UNIT_PX = { single: { w: 344, h: 1032 }, triple: { w: 688, h: 1032 } } as const;

// 規定解析度：展開＝單台寬 × 台數；折疊一律單台畫布（兩折頭對頭、三折 A右半｜B｜A左半，見素材指南）
export function requiredPx(type: LedType, quantity: number) {
  return { w: UNIT_PX[type].w * quantity, h: UNIT_PX[type].h };
}

export type MediaFit = "exact" | "ratio" | "stretch";

export function checkFit(w: number, h: number, req: { w: number; h: number }): MediaFit {
  if (w === req.w && h === req.h) return "exact";
  if (Math.abs(w / h - req.w / req.h) / (req.w / req.h) < 0.01) return "ratio";
  return "stretch";
}

export type LocalMedia = { kind: "video" | "image"; url: string; name: string; w: number; h: number };

export function loadLocalMedia(file: File): Promise<LocalMedia> {
  const url = URL.createObjectURL(file);
  const isVideo = file.type.startsWith("video/");
  return new Promise((resolve, reject) => {
    if (isVideo) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.muted = true;
      v.onloadedmetadata = () => resolve({ kind: "video", url, name: file.name, w: v.videoWidth, h: v.videoHeight });
      v.onerror = () => { URL.revokeObjectURL(url); reject(new Error("unsupported")); };
      v.src = url;
    } else {
      const img = new Image();
      img.onload = () => resolve({ kind: "image", url, name: file.name, w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("unsupported")); };
      img.src = url;
    }
  });
}
