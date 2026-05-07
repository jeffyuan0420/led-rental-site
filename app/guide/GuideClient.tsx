"use client";

import { useState } from "react";
import BackButton from "@/components/BackButton";

const DEMO_VIDEOS = [
  { id: "robot",      src: "/videos/demo-robot.mp4",      label: "示範素材 A" },
  { id: "car",        src: "/videos/demo-car.mp4",        label: "示範素材 B" },
  { id: "jewelry",    src: "/videos/demo-jewelry.mp4",    label: "示範素材 C" },
  { id: "triple-car", src: "/videos/demo-triple-car.mp4", label: "示範素材 D" },
] as const;

type Tab = "single" | "triple";

/* ── Video thumbnail for selection ─────────────────────────── */

function Thumb({
  v, badge, onClick,
}: {
  v: typeof DEMO_VIDEOS[number];
  badge: "A" | "B" | null;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
        badge ? "border-yellow-400" : "border-gray-200 hover:border-gray-400"
      }`}
      style={{ width: 62, height: 93 }}
    >
      <video src={v.src} autoPlay loop muted playsInline className="w-full h-full object-cover" />
      {badge && (
        <div
          className={`absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white ${
            badge === "A" ? "bg-amber-500" : "bg-sky-500"
          }`}
        >
          {badge}
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] py-0.5 text-center leading-tight">
        {v.label}
      </div>
    </button>
  );
}

/* ── Video panel for diagrams ──────────────────────────────── */

function Panel({ src, w, h, transform }: { src: string; w: number; h: number; transform?: string }) {
  return (
    <div style={{ width: w, height: h, overflow: "hidden" }} className="bg-black rounded-sm flex-shrink-0">
      <video
        src={src}
        autoPlay loop muted playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover", transform }}
      />
    </div>
  );
}

/* ── 兩折機 Guide ────────────────────────────────────────────── */

function SingleGuide({ srcA, srcB }: { srcA: string; srcB: string }) {
  const W = 82, H = 246;
  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-1">素材製作示意圖</h3>
        <p className="text-sm text-gray-500 mb-6">
          兩折機正背面各播放一段素材。背面素材需旋轉 180° 製作，折疊後觀眾看到的畫面方向才正確。
        </p>

        <div className="flex flex-wrap gap-10 items-center">
          {/* Flat layout */}
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500 font-semibold mb-3 text-center">平面展開圖（製作時）</p>

            <span className="text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full font-medium mb-1.5">
              背面 B — 旋轉 180°
            </span>
            <Panel src={srcB} w={W} h={H} transform="rotate(180deg)" />

            {/* Fold line */}
            <div className="flex items-center gap-1 my-2" style={{ width: W + 24 }}>
              <div className="flex-1 border-t-2 border-dashed border-gray-400" />
              <span className="text-[10px] text-gray-400 px-1 whitespace-nowrap">折疊線</span>
              <div className="flex-1 border-t-2 border-dashed border-gray-400" />
            </div>

            <Panel src={srcA} w={W} h={H} />
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium mt-1.5">
              正面 A — 正常方向
            </span>
          </div>

          <div className="text-3xl text-gray-300">→</div>

          {/* Folded preview */}
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500 font-semibold mb-3 text-center">折疊後展示效果</p>
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <Panel src={srcA} w={W} h={H} />
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-0.5 rounded border border-amber-200">
                  正面
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Panel src={srcB} w={W} h={H} />
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-0.5 rounded border border-sky-200">
                  背面
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-2 text-sm text-amber-900">
        <p className="font-bold text-amber-800 mb-1">素材製作規格</p>
        <p>✅ 正面素材 A：<strong>344 × 1032 px</strong>，直向，正常方向</p>
        <p>✅ 背面素材 B：<strong>344 × 1032 px</strong>，直向，整體<strong>旋轉 180°</strong></p>
        <p className="text-amber-600 text-xs pt-1">
          💡 原因：機器折疊後，背面面板相對地面方向上下倒置。製作時先倒置素材，展示時觀眾看到的畫面即正確。
        </p>
      </div>
    </div>
  );
}

/* ── 三折雙面機 Guide ────────────────────────────────────────── */

function TripleGuide({ srcA, srcB }: { srcA: string; srcB: string }) {
  const W = 70, H = 210;
  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-1">素材製作示意圖</h3>
        <p className="text-sm text-gray-500 mb-6">
          三折雙面機展開後有三個面板，折疊後形成可自立結構，同時對兩個方向的觀眾展示。
        </p>

        <div className="flex flex-wrap gap-10 items-center">
          {/* Flat 3-panel */}
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500 font-semibold mb-3 text-center">平面展開圖（製作時）</p>
            <div className="flex items-stretch gap-0">
              {/* Panel 1: A mirrored */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 font-medium">面板 1</span>
                <Panel src={srcA} w={W} h={H} transform="scaleX(-1)" />
                <span className="text-[10px] text-sky-600 font-semibold mt-0.5">A（水平鏡像）</span>
              </div>
              {/* Divider */}
              <div className="self-stretch border-l border-dashed border-gray-400 mx-1" style={{ marginTop: 18, marginBottom: 18 }} />
              {/* Panel 2: B normal */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 font-medium">面板 2</span>
                <Panel src={srcB} w={W} h={H} />
                <span className="text-[10px] text-amber-600 font-semibold mt-0.5">B（正常）</span>
              </div>
              {/* Divider */}
              <div className="self-stretch border-l border-dashed border-gray-400 mx-1" style={{ marginTop: 18, marginBottom: 18 }} />
              {/* Panel 3: A normal */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 font-medium">面板 3</span>
                <Panel src={srcA} w={W} h={H} />
                <span className="text-[10px] text-sky-600 font-semibold mt-0.5">A（正常）</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">面板 1＋3 合成正面 · 面板 2 為背面</p>
          </div>

          <div className="text-3xl text-gray-300">→</div>

          {/* Folded preview */}
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500 font-semibold mb-3 text-center">折疊後展示效果</p>
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <Panel src={srcA} w={W} h={H} />
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-0.5 rounded border border-sky-200">
                  正面
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Panel src={srcB} w={W} h={H} />
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-0.5 rounded border border-amber-200">
                  背面
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-2 text-sm text-blue-900">
        <p className="font-bold text-blue-800 mb-1">素材製作規格</p>
        <p>✅ 正面素材 A：<strong>688 × 1032 px</strong>，直向，正常方向</p>
        <p>✅ 背面素材 B：<strong>688 × 1032 px</strong>，直向，正常方向</p>
        <p>✅ 面板 1 的水平鏡像由機器硬體自動處理，無需額外製作</p>
        <p className="text-blue-600 text-xs pt-1">
          💡 三折雙面機可同時吸引兩側觀眾，建議正反面使用同品牌不同訊息，最大化視覺曝光效益。
        </p>
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────── */

export default function GuideClient() {
  const [tab, setTab] = useState<Tab>("single");
  const [selA, setSelA] = useState(0);
  const [selB, setSelB] = useState(1);

  const srcA = DEMO_VIDEOS[selA].src;
  const srcB = DEMO_VIDEOS[selB].src;

  return (
    <div>
      <BackButton />

      {/* Machine type tabs */}
      <div className="flex gap-3 mb-8">
        {(["single", "triple"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm border-2 transition-all ${
              tab === t
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-300 text-gray-600 hover:border-gray-500"
            }`}
          >
            {t === "single" ? "兩折機" : "三折雙面機"}
          </button>
        ))}
      </div>

      {/* Step 1: Select videos */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-sm font-black flex items-center justify-center">
            1
          </div>
          <h2 className="text-lg font-bold text-gray-900">選擇展示素材</h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-5">
            點擊選擇您想預覽的素材，系統將即時呈現製作示意圖與展示效果。
          </p>
          <div className="flex gap-8 flex-wrap">
            {/* Slot A */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-black">
                  A
                </span>
                素材 A
                <span className="text-gray-400 font-normal">（正面）</span>
              </p>
              <div className="flex gap-2">
                {DEMO_VIDEOS.map((v, i) => (
                  <Thumb key={v.id} v={v} badge={selA === i ? "A" : null} onClick={() => setSelA(i)} />
                ))}
              </div>
            </div>
            {/* Slot B */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-black">
                  B
                </span>
                素材 B
                <span className="text-gray-400 font-normal">（背面）</span>
              </p>
              <div className="flex gap-2">
                {DEMO_VIDEOS.map((v, i) => (
                  <Thumb key={v.id} v={v} badge={selB === i ? "B" : null} onClick={() => setSelB(i)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Diagram + Tips */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-sm font-black flex items-center justify-center">
          2
        </div>
        <h2 className="text-lg font-bold text-gray-900">製作方式與展示效果</h2>
      </div>

      {tab === "single" ? (
        <SingleGuide srcA={srcA} srcB={srcB} />
      ) : (
        <TripleGuide srcA={srcA} srcB={srcB} />
      )}
    </div>
  );
}
