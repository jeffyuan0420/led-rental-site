"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import BackButton from "@/components/BackButton";

const MACHINE_CONFIG = {
  single: { panelW: 160, panelH: 480, mmW: 664, mmH: 1920, pxW: 344, pxH: 1032, maxQty: 5, labelKey: "single_name", demoVideo: "/videos/demo-robot.mp4" },
  triple: { panelW: 320, panelH: 480, mmW: 1280, mmH: 1920, pxW: 688, pxH: 1032, maxQty: 3, labelKey: "triple_name", demoVideo: "/videos/demo-triple-car.mp4" },
};

type Quantity = 1 | 2 | 3 | 4 | 5;

export default function SimulatorClient() {
  const t = useTranslations("simulator");
  const tProduct = useTranslations("product");
  const searchParams = useSearchParams();
  const machineType = (searchParams.get("type") === "triple" ? "triple" : "single") as keyof typeof MACHINE_CONFIG;
  const config = MACHINE_CONFIG[machineType];
  const PANEL_W = config.panelW;
  const PANEL_H = config.panelH;

  const [quantity, setQuantity] = useState<Quantity>(1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalW = PANEL_W * quantity;

  // Scale down to fit within preview area (max 560px wide)
  const MAX_DISPLAY_W = 560;
  const scale = Math.min(1, MAX_DISPLAY_W / totalW);
  const scaledW = Math.round(totalW * scale);
  const scaledH = Math.round(PANEL_H * scale);
  const scaleRatio = Math.round(config.mmH / (PANEL_H * scale));

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
  }

  async function handleDownload() {
    if (!imageUrl) return;
    const canvas = document.createElement("canvas");
    canvas.width = totalW;
    canvas.height = PANEL_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageUrl;
    await new Promise<void>((resolve) => { img.onload = () => resolve(); });

    // Cover-fit: crop the image to fill the entire canvas
    const imgRatio = img.width / img.height;
    const canvasRatio = totalW / PANEL_H;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (imgRatio > canvasRatio) {
      sw = img.height * canvasRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / canvasRatio;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, totalW, PANEL_H);

    // Draw panel dividers
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;
    for (let i = 1; i < quantity; i++) {
      ctx.beginPath();
      ctx.moveTo(PANEL_W * i, 0);
      ctx.lineTo(PANEL_W * i, PANEL_H);
      ctx.stroke();
    }

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "simulator-preview.png";
    link.click();
  }

  const panelDividers = Array.from({ length: quantity - 1 }).map((_, i) => (
    <div key={i} style={{
      position: "absolute", top: 0, left: PANEL_W * (i + 1) + "px",
      width: "2px", height: "100%",
      background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 6px, transparent 6px, transparent 10px)",
    }} />
  ));

  return (
    <div className="flex flex-col lg:flex-row gap-10 items-start">
      {/* Controls */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <BackButton />
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          {config.maxQty > 1 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">{t("quantity_label")}</p>
              <div className="flex flex-wrap gap-2">
                {(Array.from({ length: config.maxQty }, (_, i) => i + 1) as Quantity[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuantity(q)}
                    className={`flex-1 min-w-[36px] py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                      quantity === q
                        ? "bg-gray-900 text-white border-gray-900"
                        : "border-gray-300 text-gray-600 hover:border-gray-500"
                    }`}
                  >
                    {q}{t("units")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image upload */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">{t("upload_label")}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-gray-500 hover:text-gray-800 transition-colors"
            >
              {imageUrl ? t("reupload_btn") : t("upload_btn")}
            </button>
          </div>

          {/* Dimensions + resolution info */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700 mb-1">{tProduct(config.labelKey as "single_name" | "triple_name")}</p>
            <p>{config.mmW * quantity} × {config.mmH} mm</p>
            <p className="text-gray-400">{config.pxW * quantity} × {config.pxH} px</p>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="font-semibold text-gray-600 mb-0.5">{t("content_rec_label")}</p>
              <p className="text-yellow-700">{config.pxW * quantity} × {config.pxH} px</p>
              {machineType === "single" && quantity === 5 && (
                <p className="text-green-700 font-semibold mt-1">≈ 16:9 {t("content_rec_16_9")}</p>
              )}
            </div>
          </div>

          {imageUrl && (
            <button
              onClick={handleDownload}
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {t("download_btn")}
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-900 rounded-xl p-6 flex items-center justify-center min-h-[520px]">
          <div style={{ width: scaledW + "px", height: scaledH + "px", flexShrink: 0 }}>
            <div style={{
              position: "relative", width: totalW + "px", height: PANEL_H + "px",
              overflow: "hidden", transform: `scale(${scale})`, transformOrigin: "top left",
            }} className="rounded-sm">
              {imageUrl ? (
                // Image spans the full multi-panel area; each panel shows its slice naturally
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <video
                  autoPlay loop muted playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                >
                  <source src={config.demoVideo} type="video/mp4" />
                </video>
              )}
              {panelDividers}
            </div>
          </div>
        </div>

        {imageUrl ? (
          <p className="text-xs text-gray-400 text-center mt-3">
            {t("preview_scale")} — {config.mmW * quantity} × {config.mmH} mm / {config.pxW * quantity} × {config.pxH} px
          </p>
        ) : (
          <p className="text-xs text-yellow-500 text-center mt-3">{t("empty_hint")}</p>
        )}
        <p className="text-xs text-gray-400 text-center mt-1">{t("multi_content_note")}</p>
      </div>
    </div>
  );
}
