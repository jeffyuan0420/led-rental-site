"use client";

import Link from "next/link";
import { useState } from "react";

// ── 控制開關 ──────────────────────────────────────────────
const PROMO_ENABLED = true;
const ACTIVE_PROMO = 0; // 切換 0 / 1 / 2 換不同活動
// ─────────────────────────────────────────────────────────

const PROMOS = [
  {
    // 示意一：免運費促銷
    badge: "📅 限時優惠",
    main: "預定 4 天方案",
    highlight: "免單趟運費",
    sub: "＋ 進場當天免租金",
    note: "活動至 2025/05/31 止，數量有限",
    cta: "立即預約",
    href: "/booking",
    bg: "bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-400",
    textDark: true,
    deco: ["🎁", "🚚", "⭐", "🎉"],
  },
  {
    // 示意二：新客專屬
    badge: "🎊 新客專屬",
    main: "首次租賃",
    highlight: "設定協助 免費",
    sub: "專業技師到場，省下 NT$3,000～4,500",
    note: "限本月，每客戶限用一次",
    cta: "了解方案",
    href: "/products",
    bg: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
    textDark: false,
    deco: ["✨", "🏆", "🎯", "💡"],
  },
  {
    // 示意三：多台折扣
    badge: "💡 多台優惠",
    main: "2 台以上同時租賃",
    highlight: "享 9 折優惠",
    sub: "所有機型、所有租期皆適用",
    note: "可與運費方案合併使用",
    cta: "立即試算",
    href: "/calculator",
    bg: "bg-gradient-to-br from-amber-600 via-orange-500 to-amber-600",
    textDark: false,
    deco: ["📦", "📦", "⚡", "🎯"],
  },
];

export default function PromoBanner() {
  const [closed, setClosed] = useState(false);
  if (!PROMO_ENABLED || closed) return null;

  const p = PROMOS[ACTIVE_PROMO];
  const textBase = p.textDark ? "text-gray-900" : "text-white";
  const textMuted = p.textDark ? "text-gray-700" : "text-white/70";
  const highlightCls = p.textDark
    ? "bg-gray-900 text-yellow-400"
    : "bg-yellow-400 text-gray-900";
  const ctaCls = p.textDark
    ? "bg-gray-900 text-yellow-400 hover:bg-gray-700"
    : "bg-yellow-400 text-gray-900 hover:bg-yellow-300";
  const badgeCls = p.textDark
    ? "bg-white/40 text-gray-900"
    : "bg-white/20 text-white";
  const closeCls = p.textDark
    ? "text-gray-700 hover:text-gray-900"
    : "text-white/60 hover:text-white";

  return (
    <div className={`relative w-full ${p.bg} overflow-hidden`}>
      {/* Decorative blobs */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 text-6xl opacity-20 select-none pointer-events-none hidden md:block">
        {p.deco[0]}
      </div>
      <div className="absolute left-32 top-4 text-4xl opacity-15 select-none pointer-events-none hidden md:block">
        {p.deco[1]}
      </div>
      <div className="absolute right-32 top-4 text-4xl opacity-15 select-none pointer-events-none hidden md:block">
        {p.deco[2]}
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-6xl opacity-20 select-none pointer-events-none hidden md:block">
        {p.deco[3]}
      </div>

      {/* Close button */}
      <button
        onClick={() => setClosed(true)}
        className={`absolute top-3 right-4 text-lg transition-colors z-10 ${closeCls}`}
        aria-label="關閉"
      >
        ✕
      </button>

      {/* Content */}
      <div className="relative max-w-3xl mx-auto px-6 py-12 md:py-16 text-center">
        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${badgeCls}`}>
          {p.badge}
        </span>

        <h2 className={`text-3xl md:text-5xl font-black mb-3 leading-tight ${textBase}`}>
          {p.main}
        </h2>

        <p className={`text-2xl md:text-4xl font-black mb-4 ${textBase}`}>
          <span className={`px-3 py-1 rounded-lg inline-block ${highlightCls}`}>
            {p.highlight}
          </span>
        </p>

        <p className={`text-base md:text-lg font-semibold mb-2 ${textBase}`}>
          {p.sub}
        </p>

        <p className={`text-xs mb-8 ${textMuted}`}>{p.note}</p>

        <Link
          href={p.href}
          className={`inline-block font-black text-base px-8 py-3 rounded-xl transition-colors shadow-lg ${ctaCls}`}
        >
          {p.cta} →
        </Link>
      </div>
    </div>
  );
}
