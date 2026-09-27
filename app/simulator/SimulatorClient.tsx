"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import PhotoComposite from "@/components/sim3d/PhotoComposite";
import type { Scene3DHandle, SceneKey } from "@/components/sim3d/Scene3D";
import { RATES, getSetupFee, getSetupPersons, type SetupOption } from "@/lib/pricing";
import { checkFit, loadLocalMedia, requiredPx, type LocalMedia } from "@/lib/sim3d/media";

// three.js 只在瀏覽器載入
const Scene3D = dynamic(() => import("@/components/sim3d/Scene3D"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Loading 3D…</div>,
});

const MACHINE_CONFIG = {
  // mmH = 顯示面板高度（用於 scaleRatio + 顯示尺寸）
  // physH / physD = 整機外觀尺寸（含底座，W×H×D）
  single: { panelW: 160, panelH: 480, mmW: 664, displayMmW: 640, mmH: 1920, physH: 2080, physD: 440, pxW: 344, pxH: 1032, maxQty: 5, maxTotalQty: 6, maxPowerW: 600, labelKey: "single_name", demoVideo: "/videos/demo-robot.mp4" },
  triple: { panelW: 320, panelH: 480, mmW: 1280, displayMmW: 1280, mmH: 1920, physH: 2065.8, physD: 488.8, pxW: 688, pxH: 1032, maxQty: 3, maxTotalQty: 3, maxPowerW: 1200, labelKey: "triple_name", demoVideo: "/videos/demo-triple-car.mp4" },
};

type MachineType = keyof typeof MACHINE_CONFIG;
type Tab = "3d" | "photo" | "flat";
const SCENES: SceneKey[] = ["hotel", "expo", "retail", "outdoor"];

export default function SimulatorClient() {
  const t = useTranslations("simulator");
  const tProduct = useTranslations("product");
  const tHero = useTranslations("hero");
  const tNav = useTranslations("nav");
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") === "triple" ? "triple" : "single") as MachineType;
  const [machineType, setMachineType] = useState<MachineType>(initialType);
  const config = MACHINE_CONFIG[machineType];

  const [tab, setTab] = useState<Tab>("3d");
  const [no3d, setNo3d] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [folded, setFolded] = useState(false);
  const [sceneKey, setSceneKey] = useState<SceneKey>("hotel");
  const [upload, setUpload] = useState<LocalMedia | null>(null);
  const [uploadError, setUploadError] = useState(false);
  const [setupOption, setSetupOption] = useState<SetupOption>("none");
  const [stock, setStock] = useState({ single: 20, triple: 2 });
  const sceneRef = useRef<Scene3DHandle>(null);

  useEffect(() => {
    fetch("/api/inventory").then(r => r.json()).then(setStock).catch(() => {});
  }, []);

  // 可選台數：拼接上限與庫存取小者；折疊時只能 1 台
  const maxQty = Math.max(1, Math.min(config.maxQty, stock[machineType] ?? config.maxQty));
  const effectiveQty = folded ? 1 : Math.min(quantity, maxQty);
  const req = requiredPx(machineType, effectiveQty);
  const fit = upload ? checkFit(upload.w, upload.h, req) : null;
  const media = useMemo(
    () => (upload ? { kind: upload.kind, url: upload.url } : { kind: "video" as const, url: config.demoVideo }),
    [upload, config.demoVideo],
  );

  const onFile = async (file?: File) => {
    if (!file) return;
    setUploadError(false);
    try {
      const m = await loadLocalMedia(file);
      if (upload) URL.revokeObjectURL(upload.url);
      setUpload(m);
    } catch {
      setUploadError(true);
    }
  };

  const downloadShot = () => {
    const url = sceneRef.current?.capture();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "persona-led-3d.png";
    a.click();
  };

  // 報價：基本方案每台含 4 天內活動（未稅）
  const rentalFee = RATES.perUnit[machineType] * effectiveQty;
  const setupFee = getSetupFee(setupOption, effectiveQty);

  // 平面預覽（原影片版）
  const PANEL_W = config.panelW, PANEL_H = config.panelH;
  const totalW = PANEL_W * effectiveQty;
  const scale = Math.min(1, 560 / totalW);
  const scaledW = Math.round(totalW * scale), scaledH = Math.round(PANEL_H * scale);
  const scaleRatio = Math.round(config.mmH / (PANEL_H * scale));

  const pill = (active: boolean) =>
    `py-2 rounded-lg text-xs font-bold border-2 transition-all ${active ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:border-gray-500"}`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Controls */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <BackButton />
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">{t("type_label")}</p>
            <div className="flex gap-2">
              {(["single", "triple"] as const).map(type => (
                <button key={type} onClick={() => { setMachineType(type); setQuantity(1); }} className={`flex-1 ${pill(machineType === type)}`}>
                  {tProduct(MACHINE_CONFIG[type].labelKey as "single_name" | "triple_name")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">{t("form_label")}</p>
            <div className="flex gap-2">
              <button onClick={() => setFolded(false)} className={`flex-1 ${pill(!folded)}`}>{t("form_open")}</button>
              <button onClick={() => setFolded(true)} className={`flex-1 ${pill(folded)}`}>{t("form_fold")}</button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{folded ? t(machineType === "single" ? "fold_note_single" : "fold_note_triple") : t("fold_only_single")}</p>
          </div>

          {!folded && maxQty > 1 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">{t("quantity_label")}</p>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: maxQty }, (_, i) => i + 1).map(q => (
                  <button key={q} onClick={() => setQuantity(q)} className={`flex-1 min-w-[40px] ${pill(effectiveQty === q)} text-sm`}>
                    {q}{t("units")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "3d" && !no3d && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">{t("scene_label")}</p>
              <div className="grid grid-cols-2 gap-2">
                {SCENES.map(s => (
                  <button key={s} onClick={() => setSceneKey(s)} className={pill(sceneKey === s)}>{t(`scene_${s}`)}</button>
                ))}
              </div>
            </div>
          )}

          {/* 素材上傳＋解析度規定 */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">{t("media_label")}</p>
            <p className="text-xs text-gray-500 mb-2">
              {t("media_required")} <span className="font-bold text-gray-900">{req.w} × {req.h} px</span>
            </p>
            <label className="block text-center border-2 border-gray-900 hover:bg-gray-100 text-gray-900 font-semibold py-2 rounded-lg text-sm cursor-pointer">
              {upload ? t("media_change") : t("media_upload")}
              <input type="file" accept="image/*,video/*" className="hidden" onChange={e => onFile(e.target.files?.[0])} />
            </label>
            {upload && (
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="truncate text-gray-600">{upload.name}（{upload.w} × {upload.h}）</span>
                <button onClick={() => { URL.revokeObjectURL(upload.url); setUpload(null); }} className="text-gray-400 hover:text-gray-700 ml-2 shrink-0">{t("media_clear")}</button>
              </div>
            )}
            {fit === "exact" && <p className="text-xs text-green-700 mt-1.5">✅ {t("fit_exact")}</p>}
            {fit === "ratio" && <p className="text-xs text-yellow-700 mt-1.5">⚠️ {t("fit_ratio", { w: req.w, h: req.h })}</p>}
            {fit === "stretch" && (
              <p className="text-xs text-red-600 font-semibold mt-1.5 bg-red-50 rounded p-2">❌ {t("fit_stretch", { w: req.w, h: req.h })}</p>
            )}
            {uploadError && <p className="text-xs text-red-600 mt-1.5">{t("media_error")}</p>}
            <p className="text-[11px] text-gray-400 mt-1.5">{t("media_local_note")}</p>
            {folded && <p className="text-[11px] text-gray-500 mt-1">{t("media_fold_note")} <Link href="/guide" className="underline">{tNav("guide")}</Link></p>}
          </div>

          {/* 規格 */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700 mb-1">{tProduct(config.labelKey as "single_name" | "triple_name")}</p>
            <p><span className="text-gray-400">{t("spec_physical_size")}　</span>{config.mmW * effectiveQty} × {config.physH} × {config.physD} mm</p>
            <p><span className="text-gray-400">{t("spec_display_size")}　　　</span>{config.displayMmW * effectiveQty} × {config.mmH} mm</p>
            {(() => {
              const totalPower = config.maxPowerW * effectiveQty;
              const overload = totalPower > 1500;
              return (
                <div className={`mt-1 pt-1 border-t border-gray-200 ${overload ? "text-red-600" : "text-gray-600"}`}>
                  <span className="text-gray-400">最大消耗電力　</span>
                  <span className={`font-semibold ${overload ? "text-red-600" : ""}`}>≤ {totalPower} W</span>
                  {overload && <p className="text-red-500 mt-0.5">⚠️ 超過一般插座負荷，請使用專用迴路，避免跳電</p>}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Preview + quote */}
      <div className="flex-1 min-w-0 w-full">
        <div className="flex gap-2 mb-3">
          {(["3d", "photo", "flat"] as Tab[]).filter(k => !(k === "3d" && no3d)).map(k => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 ${pill(tab === k)} text-sm`}>{t(`tab_${k}`)}</button>
          ))}
        </div>

        {tab === "3d" && !no3d && (
          <>
            <div className="relative rounded-xl overflow-hidden bg-gray-100 h-[420px] sm:h-[520px]">
              <Scene3D
                ref={sceneRef}
                type={machineType}
                quantity={effectiveQty}
                folded={folded}
                sceneKey={sceneKey}
                media={media}
                onUnsupported={() => { setNo3d(true); setTab("flat"); }}
              />
              <button onClick={downloadShot} className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow">
                ⬇ {t("shot_download")}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">{t("3d_hint")}</p>
          </>
        )}

        {tab === "photo" && (
          <PhotoComposite media={media} contentW={req.w} contentH={req.h} />
        )}

        {tab === "flat" && (
          <>
            <div className="bg-gray-900 rounded-xl p-6 flex items-center justify-center min-h-[520px]">
              <div style={{ width: scaledW + "px", height: scaledH + "px", flexShrink: 0 }}>
                <div style={{ position: "relative", width: totalW + "px", height: PANEL_H + "px", overflow: "hidden", background: "#000", transform: `scale(${scale})`, transformOrigin: "top left" }} className="rounded-sm">
                  {media.kind === "video" ? (
                    <video key={media.url} autoPlay loop muted playsInline src={media.url}
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: upload ? "fill" : "cover", objectPosition: "center bottom" }} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media.url} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "fill" }} />
                  )}
                  {Array.from({ length: effectiveQty - 1 }).map((_, i) => (
                    <div key={i} style={{ position: "absolute", top: 0, left: PANEL_W * (i + 1) + "px", width: "2px", height: "100%", background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 6px, transparent 6px, transparent 10px)" }} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              {t("spec_preview_scale", { ratio: scaleRatio })} — {config.mmW * effectiveQty} × {config.mmH} mm / {config.pxW * effectiveQty} × {config.pxH} px
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">{t("multi_content_note")}</p>
          </>
        )}

        {/* 即時報價 */}
        <div className="mt-5 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">{t("quote_title")}</p>
          <div className="text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">{tProduct(config.labelKey as "single_name" | "triple_name")} × {effectiveQty}</span>
              <span>NT${rentalFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center gap-3">
              <select value={setupOption} onChange={e => setSetupOption(e.target.value as SetupOption)}
                className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-700">
                <option value="none">{t("quote_setup_none")}</option>
                <option value="half">{t("quote_setup_half", { count: getSetupPersons(effectiveQty) })}</option>
                <option value="full">{t("quote_setup_full", { count: getSetupPersons(effectiveQty) })}</option>
              </select>
              <span>NT${setupFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
              <span>{t("quote_subtotal")}</span>
              <span>NT${(rentalFee + setupFee).toLocaleString()}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{t("quote_note", { days: RATES.maxDays })}</p>
          <div className="flex gap-3 mt-4">
            <Link href={`/booking?type=${machineType}&qty=${effectiveQty}&setup=${setupOption}`}
              className="flex-1 text-center bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-3 rounded-lg text-sm transition-colors">
              {tHero("cta_booking")}
            </Link>
            <Link href="/calculator"
              className="flex-1 text-center border-2 border-gray-900 hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-lg text-sm transition-colors">
              {tNav("calculator")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
