"use client";

import Link from "next/link";
import { useState } from "react";

// ── 控制開關 ──────────────────────────────────────────────
const PROMO_ENABLED = true;
const ACTIVE_PROMO = 0; // 切換 0 / 1 / 2 換不同活動
// ─────────────────────────────────────────────────────────

const PROMOS = [
  {
    // 示意一：免運費促銷（對標競品風格）
    badge: "限時優惠",
    main: "預定 4 天方案",
    highlight: "免單趟運費",
    sub: "＋ 進場當天免租金",
    cta: "立即預約",
    href: "/booking",
    badgeBg: "bg-red-500",
    highlightBg: "bg-yellow-300 text-gray-900",
    bannerBg: "bg-amber-400",
    textColor: "text-gray-900",
    ctaBg: "bg-gray-900 text-yellow-400 hover:bg-gray-700",
  },
  {
    // 示意二：新客首租折扣（品牌深色風格）
    badge: "新客專屬",
    main: "首次租賃立享",
    highlight: "設定協助 免費",
    sub: "— 限本月，數量有限",
    cta: "了解方案",
    href: "/products",
    badgeBg: "bg-yellow-400 text-gray-900",
    highlightBg: "bg-white text-gray-900",
    bannerBg: "bg-gray-900",
    textColor: "text-white",
    ctaBg: "bg-yellow-400 text-gray-900 hover:bg-yellow-300",
  },
  {
    // 示意三：多台優惠（簡潔版）
    badge: "多台優惠",
    main: "2 台以上同時租賃",
    highlight: "享 9 折",
    sub: "，所有機型與租期適用",
    cta: "立即試算",
    href: "/calculator",
    badgeBg: "bg-white text-gray-900",
    highlightBg: "bg-yellow-300 text-gray-900",
    bannerBg: "bg-amber-600",
    textColor: "text-white",
    ctaBg: "bg-gray-900 text-yellow-400 hover:bg-gray-800",
  },
];

export default function PromoBanner() {
  const [closed, setClosed] = useState(false);
  if (!PROMO_ENABLED || closed) return null;

  const p = PROMOS[ACTIVE_PROMO];

  return (
    <div className={`w-full ${p.bannerBg} py-2.5 px-4`}>
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-3 flex-wrap text-center relative">
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${p.badgeBg}`}>
          {p.badge}
        </span>
        <span className={`font-bold text-sm md:text-base ${p.textColor}`}>
          {p.main}{" "}
          <span className={`px-1.5 py-0.5 rounded font-black ${p.highlightBg}`}>
            {p.highlight}
          </span>
          {p.sub}
        </span>
        <Link
          href={p.href}
          className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors shrink-0 ${p.ctaBg}`}
        >
          {p.cta} →
        </Link>
        <button
          onClick={() => setClosed(true)}
          className={`absolute right-0 text-sm opacity-50 hover:opacity-100 transition-opacity ${p.textColor}`}
          aria-label="關閉"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
