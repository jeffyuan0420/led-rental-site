"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { compositeWarp, solveHomography, toCssMatrix3d, type Pt } from "@/lib/sim3d/homography";

interface Props {
  media: { kind: "video" | "image"; url: string };
  contentW: number; // 素材像素（整面 LED 解析度）
  contentH: number;
}

type Photo = { url: string; w: number; h: number; img: HTMLImageElement };

// 預設四角：照片中央、依 LED 比例、佔照片高度 45%
function defaultCorners(photo: Photo, cw: number, ch: number): Pt[] {
  const h = 0.45, w = (h * photo.h * (cw / ch)) / photo.w;
  const x0 = 0.5 - w / 2, y0 = 0.5 - h / 2;
  return [{ x: x0, y: y0 }, { x: x0 + w, y: y0 }, { x: x0 + w, y: y0 + h }, { x: x0, y: y0 + h }];
}

export default function PhotoComposite({ media, contentW, contentH }: Props) {
  const t = useTranslations("simulator");
  const [photo, setPhoto] = useState<Photo | null>(null);
  // 四角以照片寬高為 1 的比例座標；換照片或台數（素材比例）改變就回到預設位置
  const cornerKey = photo ? `${photo.url}|${contentW}|${contentH}` : "";
  const [cornerState, setCornerState] = useState<{ key: string; pts: Pt[] }>({ key: "", pts: [] });
  const corners = useMemo(
    () => (!photo ? [] : cornerState.key === cornerKey ? cornerState.pts : defaultCorners(photo, contentW, contentH)),
    [photo, cornerState, cornerKey, contentW, contentH],
  );
  const setCorners = (pts: Pt[]) => setCornerState({ key: cornerKey, pts });
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [busy, setBusy] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement | null>(null);
  const drag = useRef<number | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [photo]);

  const onPhoto = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (photo) URL.revokeObjectURL(photo.url);
      setPhoto({ url, w: img.naturalWidth, h: img.naturalHeight, img });
    };
    img.src = url;
  };

  const transform = useMemo(() => {
    if (!corners.length || !box.w) return "";
    const dst = corners.map(p => ({ x: p.x * box.w, y: p.y * box.h }));
    return toCssMatrix3d(solveHomography([{ x: 0, y: 0 }, { x: contentW, y: 0 }, { x: contentW, y: contentH }, { x: 0, y: contentH }], dst));
  }, [corners, box, contentW, contentH]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (drag.current === null || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    const i = drag.current;
    setCorners(corners.map((p, k) => (k === i ? { x, y } : p)));
  };

  const download = async () => {
    if (!photo || !mediaRef.current) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 30)); // 讓「產生中」先畫出來
    // 素材一律拉伸到 LED 解析度（與實機一致），再透視貼上
    const content = document.createElement("canvas");
    content.width = contentW;
    content.height = contentH;
    content.getContext("2d")!.drawImage(mediaRef.current, 0, 0, contentW, contentH);
    const quad = corners.map(p => ({ x: p.x * photo.w, y: p.y * photo.h }));
    const out = compositeWarp(photo.img, photo.w, photo.h, content, quad);
    out.toBlob(b => {
      setBusy(false);
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = "persona-led-mockup.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, "image/png");
  };

  const mediaStyle: React.CSSProperties = {
    position: "absolute", left: 0, top: 0, width: contentW, height: contentH,
    transformOrigin: "0 0", transform, objectFit: "fill", pointerEvents: "none", background: "#000",
  };

  return (
    <div>
      {!photo ? (
        <label className="flex flex-col items-center justify-center gap-2 min-h-[420px] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-gray-500 text-gray-500 text-sm p-6 text-center">
          <span className="text-3xl">📷</span>
          <span className="font-semibold text-gray-700">{t("photo_upload")}</span>
          <span>{t("photo_upload_hint")}</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => onPhoto(e.target.files?.[0])} />
        </label>
      ) : (
        <>
          <div
            ref={stageRef}
            className="relative w-full overflow-hidden rounded-xl bg-black select-none touch-none"
            style={{ aspectRatio: `${photo.w} / ${photo.h}` }}
            onPointerMove={onPointerMove}
            onPointerUp={() => (drag.current = null)}
            onPointerLeave={() => (drag.current = null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="" className="absolute inset-0 w-full h-full" draggable={false} />
            {transform && (media.kind === "video" ? (
              <video ref={el => { mediaRef.current = el; }} src={media.url} autoPlay loop muted playsInline style={mediaStyle} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img ref={el => { mediaRef.current = el; }} src={media.url} alt="" style={mediaStyle} draggable={false} />
            ))}
            {transform && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polygon points={corners.map(p => `${p.x * box.w},${p.y * box.h}`).join(" ")} fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="6 4" />
              </svg>
            )}
            {corners.map((p, i) => (
              <div
                key={i}
                onPointerDown={e => { drag.current = i; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
                onPointerMove={onPointerMove}
                onPointerUp={() => (drag.current = null)}
                className="absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full bg-yellow-400 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing"
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                aria-label={`corner ${i + 1}`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">{t("photo_drag_hint")}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={download} disabled={busy} className="flex-1 min-w-[140px] bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm">
              {busy ? t("photo_generating") : t("photo_download")}
            </button>
            <button onClick={() => setCorners(defaultCorners(photo, contentW, contentH))} className="px-4 border-2 border-gray-300 hover:border-gray-500 text-gray-700 font-semibold py-2 rounded-lg text-sm">
              {t("photo_reset")}
            </button>
            <label className="px-4 border-2 border-gray-300 hover:border-gray-500 text-gray-700 font-semibold py-2 rounded-lg text-sm cursor-pointer">
              {t("photo_change")}
              <input type="file" accept="image/*" className="hidden" onChange={e => onPhoto(e.target.files?.[0])} />
            </label>
          </div>
        </>
      )}
    </div>
  );
}
