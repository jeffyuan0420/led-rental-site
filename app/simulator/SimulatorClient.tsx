"use client";

import { useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import BackButton from "@/components/BackButton";

const GAP = 0; // panels touch; dashed line drawn on top

const MACHINE_CONFIG = {
  single: { panelW: 160, panelH: 480, mmW: 664, mmH: 1920, pxW: 344, pxH: 1032, maxQty: 5, labelKey: "single_name" },
  triple: { panelW: 320, panelH: 480, mmW: 1280, mmH: 1920, pxW: 688, pxH: 1032, maxQty: 3, labelKey: "triple_name" },
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalWidth = PANEL_W * quantity + GAP * (quantity - 1);
  const totalHeight = PANEL_H;

  const drawCanvas = useCallback(
    (imgUrl: string, qty: Quantity) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = PANEL_W * qty + GAP * (qty - 1);
      const h = PANEL_H;
      canvas.width = w;
      canvas.height = h;

      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, w, h);

        const scale = Math.max(w / img.width, h / img.height);
        const sw = img.width * scale;
        const sh = img.height * scale;
        const sx = (w - sw) / 2;
        const sy = (h - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh);

        // panel outlines
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        for (let i = 0; i < qty; i++) {
          ctx.strokeRect(i * PANEL_W + 0.5, 0.5, PANEL_W - 1, h - 1);
        }

        // dashed separator between panels
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 5]);
        for (let i = 1; i < qty; i++) {
          const x = PANEL_W * i;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      };
      img.src = imgUrl;
    },
    []
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    drawCanvas(url, quantity);
  }

  function handleQuantityChange(qty: Quantity) {
    setQuantity(qty);
    if (imageUrl) drawCanvas(imageUrl, qty);
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `led-preview-${quantity}panel.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10 items-start">
      {/* Controls */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <BackButton />
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {config.maxQty > 1 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">{t("quantity_label")}</p>
              <div className="flex flex-wrap gap-2">
                {(Array.from({ length: config.maxQty }, (_, i) => i + 1) as Quantity[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuantityChange(q)}
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

          {/* Dimensions + resolution info */}
          <div className="mb-6 bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700 mb-1">{tProduct(config.labelKey as "single_name" | "triple_name")}</p>
            <p>{config.mmW * quantity} × {config.mmH} mm</p>
            <p className="text-gray-400">{config.pxW * quantity} × {config.pxH} px</p>
            {/* Content recommendation */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="font-semibold text-gray-600 mb-0.5">{t("content_rec_label")}</p>
              <p className="text-yellow-700">{config.pxW * quantity} × {config.pxH} px</p>
              {machineType === "single" && quantity === 5 && (
                <p className="text-green-700 font-semibold mt-1">≈ 16:9 {t("content_rec_16_9")}</p>
              )}
            </div>
          </div>

          {/* Upload */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">{t("upload_label")}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-yellow-400 hover:text-yellow-700 transition-colors"
            >
              {imageUrl ? t("reupload_btn") : t("upload_btn")}
            </button>
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={!imageUrl}
            className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-semibold rounded-lg text-sm transition-colors"
          >
            {t("download_btn")}
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1">
        <div className="bg-gray-900 rounded-xl p-6 flex items-center justify-center min-h-[500px]">
          {imageUrl ? (
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="rounded shadow-2xl"
                style={{ maxWidth: "100%", height: "auto", display: "block" }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <div className="flex items-center mb-4">
                {Array.from({ length: quantity }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    {i > 0 && (
                      <div
                        style={{
                          width: "2px",
                          height: PANEL_H + "px",
                          background: "repeating-linear-gradient(to bottom, #6B7280 0, #6B7280 6px, transparent 6px, transparent 10px)",
                        }}
                      />
                    )}
                    <div
                      className="border-2 border-gray-600 rounded"
                      style={{ width: PANEL_W + "px", height: PANEL_H + "px" }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm">{t("empty_hint")}</p>
            </div>
          )}
        </div>
        {imageUrl && (
          <p className="text-xs text-gray-400 text-center mt-3">
            {t("preview_scale")} — {config.mmW * quantity} × {config.mmH} mm / {config.pxW * quantity} × {config.pxH} px
          </p>
        )}
      </div>
    </div>
  );
}
