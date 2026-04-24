"use client";

import { useState } from "react";
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
  const totalW = PANEL_W * quantity;

  const MAX_DISPLAY_W = 560;
  const scale = Math.min(1, MAX_DISPLAY_W / totalW);
  const scaledW = Math.round(totalW * scale);
  const scaledH = Math.round(PANEL_H * scale);
  const scaleRatio = Math.round(config.mmH / (PANEL_H * scale));

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
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-900 rounded-xl p-6 flex items-center justify-center min-h-[520px]">
          <div style={{ width: scaledW + "px", height: scaledH + "px", flexShrink: 0 }}>
            {/* Inner container at natural size, scaled down via CSS transform */}
            <div style={{
              position: "relative",
              width: totalW + "px",
              height: PANEL_H + "px",
              display: "flex",
              overflow: "hidden",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }} className="rounded-sm">
              {/* Each panel is an independent video — full portrait content, no cropping */}
              {Array.from({ length: quantity }).map((_, i) => (
                <div key={i} style={{ width: PANEL_W + "px", height: PANEL_H + "px", flexShrink: 0, overflow: "hidden" }}>
                  <video
                    autoPlay loop muted playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  >
                    <source src={config.demoVideo} type="video/mp4" />
                  </video>
                </div>
              ))}
              {/* Dashed panel separators */}
              {Array.from({ length: quantity - 1 }).map((_, i) => (
                <div key={i} style={{
                  position: "absolute", top: 0, left: PANEL_W * (i + 1) + "px",
                  width: "2px", height: "100%",
                  background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 6px, transparent 6px, transparent 10px)",
                }} />
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          預覽比例約 1:{scaleRatio} — {config.mmW * quantity} × {config.mmH} mm / {config.pxW * quantity} × {config.pxH} px
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">{t("multi_content_note")}</p>
      </div>
    </div>
  );
}
