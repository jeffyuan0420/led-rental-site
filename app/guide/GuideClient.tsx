"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import BackButton from "@/components/BackButton";

const DEMO_VIDEOS = ["robot", "car", "jewelry", "triple-car", "back-a"] as const;
const DEMO_SRCS: Record<typeof DEMO_VIDEOS[number], string> = {
  robot:        "/videos/demo-robot.mp4",
  car:          "/videos/demo-car.mp4",
  jewelry:      "/videos/demo-jewelry.mp4",
  "triple-car": "/videos/demo-triple-car.mp4",
  "back-a":     "/videos/demo-back-a.mp4",
};

type Tab = "single" | "triple";

function Thumb({ src, badge, label, onClick }: { src: string; badge: "A" | "B" | null; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`relative rounded-lg overflow-hidden border-2 transition-all ${badge ? "border-yellow-400" : "border-gray-200 hover:border-gray-400"}`}
      style={{ width: 62, height: 93 }}>
      <video src={src} autoPlay loop muted playsInline className="w-full h-full object-cover" />
      {badge && (
        <div className={`absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white ${badge === "A" ? "bg-amber-500" : "bg-sky-500"}`}>{badge}</div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] py-0.5 text-center">{label}</div>
    </button>
  );
}

function Panel({ src, w, h, transform }: { src: string; w: number; h: number; transform?: string }) {
  return (
    <div style={{ width: w, height: h, overflow: "hidden" }} className="bg-black rounded-sm flex-shrink-0">
      <video src={src} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform }} />
    </div>
  );
}

function HalfPanel({ src, half, w, h, videoRef }: { src: string; half: "left" | "right"; w: number; h: number; videoRef?: React.RefObject<HTMLVideoElement | null> }) {
  return (
    <div style={{ width: w, height: h, overflow: "hidden", flexShrink: 0 }} className="bg-black rounded-sm">
      <video ref={videoRef} src={src} autoPlay loop muted playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: "scaleX(2)", transformOrigin: half === "left" ? "left center" : "right center" }} />
    </div>
  );
}

function SingleGuide({ srcA, srcB }: { srcA: string; srcB: string }) {
  const t = useTranslations("guide");
  const W = 82, H = 246;
  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-1">{t("diagram_title")}</h3>
        <p className="text-sm text-gray-500 mb-6">{t("single_desc")}</p>
        <div className="flex flex-wrap gap-10 items-center">
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500 font-semibold mb-3 text-center">{t("flat_title")}</p>
            <span className="text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full font-medium mb-1.5">{t("back_label")}</span>
            <Panel src={srcB} w={W} h={H} transform="rotate(180deg)" />
            <div className="flex items-center gap-1 my-2" style={{ width: W + 24 }}>
              <div className="flex-1 border-t-2 border-dashed border-gray-400" />
              <span className="text-[10px] text-gray-400 px-1 whitespace-nowrap">{t("fold_line")}</span>
              <div className="flex-1 border-t-2 border-dashed border-gray-400" />
            </div>
            <Panel src={srcA} w={W} h={H} />
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium mt-1.5">{t("front_label")}</span>
          </div>
          <div className="text-3xl text-gray-300">→</div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500 font-semibold mb-3 text-center">{t("folded_title")}</p>
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <Panel src={srcA} w={W} h={H} />
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-0.5 rounded border border-amber-200">{t("front")}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Panel src={srcB} w={W} h={H} />
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-0.5 rounded border border-sky-200">{t("back")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-2 text-sm text-amber-900">
        <p className="font-bold text-amber-800 mb-1">{t("tips_title")}</p>
        <p>✅ {t("single_tips_a")}</p>
        <p>✅ {t("single_tips_b")}</p>
        <p className="text-amber-600 text-xs pt-1">{t("single_tips_note")}</p>
      </div>
    </div>
  );
}

function TripleGuide({ srcA, srcB }: { srcA: string; srcB: string }) {
  const t = useTranslations("guide");
  const W1 = 35, W2 = 70, H = 210;
  const ref1 = useRef<HTMLVideoElement>(null);
  const ref3 = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v1 = ref1.current;
    const v3 = ref3.current;
    if (!v1 || !v3) return;
    const sync = () => {
      if (Math.abs(v1.currentTime - v3.currentTime) > 0.05) {
        v3.currentTime = v1.currentTime;
      }
    };
    v1.addEventListener("timeupdate", sync);
    return () => v1.removeEventListener("timeupdate", sync);
  }, [srcA]);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-1">{t("diagram_title")}</h3>
        <p className="text-sm text-gray-500 mb-6">{t("triple_desc")}</p>
        <div className="flex flex-wrap gap-10 items-center">
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500 font-semibold mb-3 text-center">{t("flat_title")}</p>
            <div className="flex items-stretch gap-0">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 font-medium">{t("panel1")}</span>
                <HalfPanel src={srcA} half="right" w={W1} h={H} videoRef={ref1} />
                <span className="text-[10px] text-sky-600 font-semibold mt-0.5">{t("panel1_label")}</span>
              </div>
              <div className="self-stretch border-l border-dashed border-gray-400 mx-1" style={{ marginTop: 18, marginBottom: 18 }} />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 font-medium">{t("panel2")}</span>
                <Panel src={srcB} w={W2} h={H} />
                <span className="text-[10px] text-amber-600 font-semibold mt-0.5">{t("panel2_label")}</span>
              </div>
              <div className="self-stretch border-l border-dashed border-gray-400 mx-1" style={{ marginTop: 18, marginBottom: 18 }} />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 font-medium">{t("panel3")}</span>
                <HalfPanel src={srcA} half="left" w={W1} h={H} videoRef={ref3} />
                <span className="text-[10px] text-sky-600 font-semibold mt-0.5">{t("panel3_label")}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">{t("triple_footer")}</p>
          </div>
          <div className="text-3xl text-gray-300">→</div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500 font-semibold mb-3 text-center">{t("folded_title")}</p>
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <Panel src={srcB} w={W2} h={H} />
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-0.5 rounded border border-amber-200">{t("front")}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Panel src={srcA} w={W2} h={H} />
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-0.5 rounded border border-sky-200">{t("back")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-2 text-sm text-blue-900">
        <p className="font-bold text-blue-800 mb-1">{t("tips_title")}</p>
        <p>✅ {t("triple_tips_a")}</p>
        <p>✅ {t("triple_tips_b")}</p>
        <p className="text-blue-600 text-xs pt-1">{t("triple_tips_note")}</p>
      </div>
    </div>
  );
}

export default function GuideClient() {
  const t = useTranslations("guide");
  const [tab, setTab] = useState<Tab>("single");
  const [selA, setSelA] = useState(0);
  const [selB, setSelB] = useState(1);

  useEffect(() => {
    setSelA(tab === "triple" ? 4 : 0);
  }, [tab]);

  const srcA = DEMO_SRCS[DEMO_VIDEOS[selA]];
  const srcB = DEMO_SRCS[DEMO_VIDEOS[selB]];

  return (
    <div>
      <BackButton />
      <div className="flex gap-3 mb-8">
        {(["single", "triple"] as const).map((tp) => (
          <button key={tp} onClick={() => setTab(tp)}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm border-2 transition-all ${tp === tab ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:border-gray-500"}`}>
            {t(tp === "single" ? "tab_single" : "tab_triple")}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-sm font-black flex items-center justify-center">1</div>
          <h2 className="text-lg font-bold text-gray-900">{t("step1_title")}</h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-5">{t("step1_desc")}</p>
          <div className="flex gap-8 flex-wrap">
            {(["A", "B"] as const).map((badge) => {
              const sel = badge === "A" ? selA : selB;
              const setSel = badge === "A" ? setSelA : setSelB;
              return (
                <div key={badge}>
                  <p className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-black ${badge === "A" ? "bg-amber-500" : "bg-sky-500"}`}>{badge}</span>
                    {t(badge === "A" ? "slot_a" : "slot_b")}
                    <span className="text-gray-400 font-normal">{t("slot_front_back", { side: badge === (tab === "triple" ? "B" : "A") ? t("front") : t("back") })}</span>
                  </p>
                  <div className="flex gap-2">
                    {DEMO_VIDEOS.map((id, i) => (
                      <Thumb key={id} src={DEMO_SRCS[id]} label={t(`demo_${String.fromCharCode(65 + i)}`)}
                        badge={sel === i ? badge : null} onClick={() => setSel(i)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-sm font-black flex items-center justify-center">2</div>
        <h2 className="text-lg font-bold text-gray-900">{t("step2_title")}</h2>
      </div>
      {tab === "single" ? <SingleGuide srcA={srcA} srcB={srcB} /> : <TripleGuide srcA={srcA} srcB={srcB} />}
    </div>
  );
}
