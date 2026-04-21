"use client";

import { useRef, useState, useCallback } from "react";
import BackButton from "@/components/BackButton";

// LED panel dimensions (mm → we use pixel ratio 1:4 for display)
// Single panel: 640 x 1920mm
const PANEL_W = 160; // px (640mm / 4)
const PANEL_H = 480; // px (1920mm / 4)
const GAP = 4;       // px - LED seam gap between panels

type Quantity = 1 | 2 | 3;

export default function SimulatorClient() {
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
        // Fill background
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, w, h);

        // Draw image scaled to fit entire canvas
        const scale = Math.max(w / img.width, h / img.height);
        const sw = img.width * scale;
        const sh = img.height * scale;
        const sx = (w - sw) / 2;
        const sy = (h - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh);

        // Draw LED seam gaps
        ctx.fillStyle = "#000";
        for (let i = 1; i < qty; i++) {
          const x = PANEL_W * i + GAP * (i - 1);
          ctx.fillRect(x, 0, GAP, h);
        }

        // Draw panel borders
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        for (let i = 0; i < qty; i++) {
          const x = i * (PANEL_W + GAP);
          ctx.strokeRect(x + 0.5, 0.5, PANEL_W - 1, h - 1);
        }
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
          {/* Quantity selector */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">選擇台數</p>
            <div className="flex gap-2">
              {([1, 2, 3] as Quantity[]).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuantityChange(q)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                    quantity === q
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-300 text-gray-600 hover:border-gray-500"
                  }`}
                >
                  {q} 台
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions info */}
          <div className="mb-6 bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">拼接尺寸</p>
            <p>{640 * quantity} × 1920 mm</p>
            <p className="mt-1 text-gray-400">（{quantity} 台橫向拼接）</p>
          </div>

          {/* Upload */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">上傳圖片</p>
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
              {imageUrl ? "重新選擇圖片" : "選擇圖片"}
            </button>
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={!imageUrl}
            className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-semibold rounded-lg text-sm transition-colors"
          >
            下載預覽圖
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
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              {/* Empty state: show frame outlines */}
              <div
                className="flex gap-1 mb-4"
                style={{ height: PANEL_H + "px" }}
              >
                {Array.from({ length: quantity }).map((_, i) => (
                  <div
                    key={i}
                    className="border-2 border-gray-600 rounded"
                    style={{ width: PANEL_W + "px", height: PANEL_H + "px" }}
                  />
                ))}
              </div>
              <p className="text-sm">請上傳圖片以預覽拼接效果</p>
            </div>
          )}
        </div>
        {imageUrl && (
          <p className="text-xs text-gray-400 text-center mt-3">
            預覽比例 1:4（實際尺寸：{640 * quantity} × 1920 mm）
          </p>
        )}
      </div>
    </div>
  );
}
