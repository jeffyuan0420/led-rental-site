"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

// ── 控制開關 ──────────────────
const PROMO_ENABLED = true;
// ──────────────────────────────

const PROMO_META = [
  { bg: "bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-400", textDark: true,  deco: ["🎁","🚚","⭐","🎉"], href: "/booking" },
  { bg: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",      textDark: false, deco: ["✨","🏆","🎯","💡"], href: "/products" },
  { bg: "bg-gradient-to-br from-amber-600 via-orange-500 to-amber-600",  textDark: false, deco: ["📦","📦","⚡","🎯"], href: "/calculator" },
] as const;

export default function PromoBanner() {
  const t = useTranslations("promo");
  const [current, setCurrent] = useState(0);
  const [closed, setClosed] = useState(false);

  if (!PROMO_ENABLED || closed) return null;

  const total = PROMO_META.length;
  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  const p = PROMO_META[current];
  const idx = `p${current}` as "p0" | "p1" | "p2";

  const textBase   = p.textDark ? "text-gray-900" : "text-white";
  const textMuted  = p.textDark ? "text-gray-700"  : "text-white/70";
  const highlight  = p.textDark ? "bg-gray-900 text-yellow-400" : "bg-yellow-400 text-gray-900";
  const ctaCls     = p.textDark ? "bg-gray-900 text-yellow-400 hover:bg-gray-700" : "bg-yellow-400 text-gray-900 hover:bg-yellow-300";
  const badgeCls   = p.textDark ? "bg-white/40 text-gray-900" : "bg-white/20 text-white";
  const arrowCls   = p.textDark ? "bg-black/10 hover:bg-black/20 text-gray-900" : "bg-white/10 hover:bg-white/25 text-white";
  const dotActive  = p.textDark ? "bg-gray-900" : "bg-white";
  const dotInactive= p.textDark ? "bg-gray-900/30" : "bg-white/30";

  return (
    <div className={`relative w-full ${p.bg} overflow-hidden transition-all duration-500`}>
      {/* Decorative emoji */}
      <div className="absolute left-8  top-1/2 -translate-y-1/2 text-6xl opacity-20 select-none pointer-events-none hidden md:block">{p.deco[0]}</div>
      <div className="absolute left-32 top-4               text-4xl opacity-15 select-none pointer-events-none hidden md:block">{p.deco[1]}</div>
      <div className="absolute right-32 top-4              text-4xl opacity-15 select-none pointer-events-none hidden md:block">{p.deco[2]}</div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-6xl opacity-20 select-none pointer-events-none hidden md:block">{p.deco[3]}</div>

      {/* Arrows */}
      <button onClick={prev} className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-xl transition-colors ${arrowCls}`} aria-label="上一則">‹</button>
      <button onClick={next} className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-xl transition-colors ${arrowCls}`} aria-label="下一則">›</button>

      {/* Close */}
      <button onClick={() => setClosed(true)} className={`absolute top-3 right-14 text-sm z-10 opacity-50 hover:opacity-100 transition-opacity ${textBase}`} aria-label={t("close")}>✕</button>

      {/* Content */}
      <div className="relative max-w-2xl mx-auto px-14 py-12 md:py-16 text-center">
        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${badgeCls}`}>{t(`${idx}_badge`)}</span>
        <h2 className={`text-3xl md:text-5xl font-black mb-3 leading-tight ${textBase}`}>{t(`${idx}_main`)}</h2>
        <p className={`text-2xl md:text-4xl font-black mb-4 ${textBase}`}>
          <span className={`px-3 py-1 rounded-lg inline-block ${highlight}`}>{t(`${idx}_highlight`)}</span>
        </p>
        <p className={`text-base md:text-lg font-semibold mb-2 ${textBase}`}>{t(`${idx}_sub`)}</p>
        <p className={`text-xs mb-8 ${textMuted}`}>{t(`${idx}_note`)}</p>
        <Link href={p.href} className={`inline-block font-black text-base px-8 py-3 rounded-xl transition-colors shadow-lg ${ctaCls}`}>{t(`${idx}_cta`)} →</Link>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {PROMO_META.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all ${i === current ? `${dotActive} w-4` : `${dotInactive} w-2`}`} aria-label={`第 ${i + 1} 則`} />
        ))}
      </div>
    </div>
  );
}
