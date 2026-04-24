"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type MachineType = "single" | "triple";

const DIMS: Record<MachineType, { unitW: number; unitH: number }> = {
  single: { unitW: 664, unitH: 1920 },
  triple: { unitW: 1280, unitH: 1920 },
};

function getRatio(w: number, h: number): string {
  if (w === h) return "1:1";
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

function getRatioLabel(machineType: MachineType, qty: number, tProduct: ReturnType<typeof useTranslations>): string | null {
  if (machineType === "triple" && qty === 3) return tProduct("config_ultrawide");
  if (machineType === "triple" && qty === 2) return tProduct("config_ratio_16_9");
  if (machineType === "single" && qty === 3) return tProduct("config_ratio_16_9");
  return null;
}

interface Props {
  machineType: MachineType;
}

const MAX_QTY: Record<MachineType, number> = {
  single: 5,
  triple: 3,
};

export default function DimensionDiagram({ machineType }: Props) {
  const t = useTranslations("product");
  const [qty, setQty] = useState(1);
  const maxQty = MAX_QTY[machineType];

  const { unitW, unitH } = DIMS[machineType];
  const totalW = unitW * qty;
  const totalH = unitH;
  const ratioLabel = getRatioLabel(machineType, qty, t);

  // Calculate SVG dimensions — maintain aspect ratio capped at max height
  const MAX_W = 560;
  const MAX_H = 220;
  const scale = Math.min(MAX_W / totalW, MAX_H / totalH);
  const svgW = totalW * scale;
  const svgH = totalH * scale;
  const panelW = unitW * scale;

  return (
    <div className="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {t("config_title")}
      </p>

      {/* Quantity tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Array.from({ length: maxQty }, (_, i) => i + 1).map((q) => (
          <button
            key={q}
            onClick={() => setQty(q)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
              qty === q
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-300 text-gray-600 hover:border-gray-500"
            }`}
          >
            {q} {t("config_unit")}
          </button>
        ))}
      </div>

      {/* Diagram */}
      <div className="flex justify-center">
        <svg
          width={svgW}
          height={svgH + 40}
          viewBox={`0 0 ${svgW} ${svgH + 40}`}
          className="overflow-visible"
        >
          {/* Panel backgrounds */}
          {Array.from({ length: qty }).map((_, i) => (
            <rect
              key={i}
              x={i * panelW + (i === 0 ? 0 : i * 1)}
              y={0}
              width={panelW - (qty > 1 ? 1 : 0)}
              height={svgH}
              fill="#3b3b3b"
              rx={2}
            />
          ))}

          {/* Unit dividers + labels */}
          {Array.from({ length: qty }).map((_, i) => {
            const x = i * panelW + (i > 0 ? i * 1 : 0);
            return (
              <g key={i}>
                {/* Dotted border */}
                <rect
                  x={x + 3}
                  y={3}
                  width={panelW - 7}
                  height={svgH - 6}
                  fill="none"
                  stroke="#facc15"
                  strokeWidth={1}
                  strokeDasharray="4 3"
                  rx={1}
                />
                {/* Unit label top */}
                <text
                  x={x + panelW / 2}
                  y={18}
                  textAnchor="middle"
                  fill="#facc15"
                  fontSize={10}
                  fontWeight="600"
                >
                  {t("config_unit")} {i + 1}
                </text>
              </g>
            );
          })}

          {/* Center dimension label */}
          <text
            x={svgW / 2}
            y={svgH / 2 + 5}
            textAnchor="middle"
            fill="white"
            fontSize={11}
            fontWeight="700"
          >
            {totalW.toLocaleString()} × {totalH.toLocaleString()} mm
          </text>
          {ratioLabel && (
            <text
              x={svgW / 2}
              y={svgH / 2 + 20}
              textAnchor="middle"
              fill="#facc15"
              fontSize={9}
            >
              ({ratioLabel})
            </text>
          )}

          {/* Width arrow line at bottom */}
          <line x1={0} y1={svgH + 16} x2={svgW} y2={svgH + 16} stroke="#9ca3af" strokeWidth={1} />
          <line x1={0} y1={svgH + 10} x2={0} y2={svgH + 22} stroke="#9ca3af" strokeWidth={1} />
          <line x1={svgW} y1={svgH + 10} x2={svgW} y2={svgH + 22} stroke="#9ca3af" strokeWidth={1} />
          <text
            x={svgW / 2}
            y={svgH + 32}
            textAnchor="middle"
            fill="#6b7280"
            fontSize={9}
          >
            {totalW.toLocaleString()} mm
          </text>
        </svg>
      </div>

      {/* Summary line */}
      <p className="text-center text-xs text-gray-500 mt-2">
        {qty} {t("config_joined")} — {totalW.toLocaleString()} × {totalH.toLocaleString()} mm
        {ratioLabel ? ` (${ratioLabel})` : ""}
      </p>
    </div>
  );
}
