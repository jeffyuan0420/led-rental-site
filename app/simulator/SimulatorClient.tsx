"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import BackButton from "@/components/BackButton";

const MACHINE_CONFIG = {
  single: { panelW: 160, panelH: 480, mmW: 664, mmH: 1920, pxW: 344, pxH: 1032, maxQty: 5, labelKey: "single_name" },
  triple: { panelW: 320, panelH: 480, mmW: 1280, mmH: 1920, pxW: 688, pxH: 1032, maxQty: 3, labelKey: "triple_name" },
};

const DEMO_VIDEOS = [
  { id: "robot",   src: "/videos/demo-robot.mp4",   labelZh: "機器人",  labelEn: "Robot" },
  { id: "car",     src: "/videos/demo-car.mp4",     labelZh: "汽車",    labelEn: "Car" },
  { id: "jewelry", src: "/videos/demo-jewelry.mp4", labelZh: "珠寶",    labelEn: "Jewelry" },
];

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
  // One video ID per panel slot (max 5)
  const [panelVideos, setPanelVideos] = useState<string[]>(["robot", "robot", "robot", "robot", "robot"]);

  function setVideoForPanel(panelIndex: number, videoId: string) {
    setPanelVideos((prev) => {
      const next = [...prev];
      next[panelIndex] = videoId;
      return next;
    });
  }

  const isZh = typeof window !== "undefined"
    ? document.cookie.includes("locale=zh-TW") || !document.cookie.includes("locale=en")
    : true;

  return (
    <div className="flex flex-col lg:flex-row gap-10 items-start">
      {/* Controls */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <BackButton />
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {/* Quantity */}
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

          {/* Dimensions + resolution info */}
          <div className="mb-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
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

          <p className="text-xs text-gray-400 text-center">{t("preview_scale")}</p>
        </div>
      </div>

      {/* Preview + video selector */}
      <div className="flex-1 min-w-0">
        {/* Video panels */}
        <div className="bg-gray-900 rounded-xl p-6 flex items-center justify-center min-h-[520px] mb-6">
          <div className="flex items-stretch">
            {Array.from({ length: quantity }).map((_, i) => {
              const video = DEMO_VIDEOS.find((v) => v.id === panelVideos[i]) ?? DEMO_VIDEOS[0];
              return (
                <div key={i} className="flex items-center">
                  {i > 0 && (
                    <div
                      style={{
                        width: "2px",
                        height: PANEL_H + "px",
                        background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 6px, transparent 6px, transparent 10px)",
                      }}
                    />
                  )}
                  <div
                    style={{ width: PANEL_W + "px", height: PANEL_H + "px", overflow: "hidden", flexShrink: 0 }}
                    className="rounded-sm"
                  >
                    <video
                      key={video.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    >
                      <source src={video.src} type="video/mp4" />
                    </video>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-panel video selector */}
        <div className="space-y-4">
          {Array.from({ length: quantity }).map((_, panelIdx) => (
            <div key={panelIdx} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 mb-3">
                {quantity > 1 ? `${t("panel_label")} ${panelIdx + 1}` : t("select_video_label")}
              </p>
              <div className="flex gap-3">
                {DEMO_VIDEOS.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setVideoForPanel(panelIdx, video.id)}
                    className={`flex-1 rounded-lg border-2 overflow-hidden transition-all ${
                      panelVideos[panelIdx] === video.id
                        ? "border-yellow-400 ring-2 ring-yellow-300"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div style={{ aspectRatio: "344/1032", position: "relative", background: "#111" }}>
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      >
                        <source src={video.src} type="video/mp4" />
                      </video>
                    </div>
                    <p className={`text-xs font-semibold py-1.5 text-center ${
                      panelVideos[panelIdx] === video.id ? "text-yellow-700 bg-yellow-50" : "text-gray-600"
                    }`}>
                      {isZh ? video.labelZh : video.labelEn}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          {t("preview_scale")} — {config.mmW * quantity} × {config.mmH} mm / {config.pxW * quantity} × {config.pxH} px
        </p>
      </div>
    </div>
  );
}
