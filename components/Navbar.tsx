"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

const SALES_REPS: Record<string, string[]> = {
  // 原本3人各出現2次(20%)，新增4人各出現1次(10%)
  北區: ["0908867358", "0908867358", "richsource015", "richsource015", "marscsknight", "marscsknight", "0980381600", "hsiang860711", "0968601499", "0908008619"],
  中區: ["0968283885", "ryanwu1122", "0977131871"],
  南區: ["0902018518", "rsray", "0980017885"],
};

const REGIONS = [
  { key: "北區", labelKey: "sales_region_north" },
  { key: "中區", labelKey: "sales_region_central" },
  { key: "南區", labelKey: "sales_region_south" },
] as const;

function lineUrl(id: string) {
  return `https://line.me/ti/p/~${id}`;
}

function SalesModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("nav");
  const [selected, setSelected] = useState<string | null>(null);

  function handleRegion(key: string) {
    setSelected(key);
    const reps = SALES_REPS[key];
    const rep = reps[Math.floor(Math.random() * reps.length)];
    setTimeout(() => {
      window.open(lineUrl(rep), "_blank");
      onClose();
    }, 300);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-80 text-center">
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>
        <div className="text-3xl mb-3">💼</div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{t("sales_modal_title")}</h3>
        <p className="text-sm text-gray-500 mb-6">{t("sales_modal_subtitle")}</p>
        <div className="flex flex-col gap-3">
          {REGIONS.map((region) => (
            <button
              key={region.key}
              onClick={() => handleRegion(region.key)}
              disabled={selected !== null}
              className={`w-full py-3 rounded-xl font-bold text-base transition-all border-2 ${
                selected === region.key
                  ? "bg-yellow-400 border-yellow-400 text-gray-900"
                  : "border-yellow-400 text-yellow-700 hover:bg-yellow-50"
              }`}
            >
              {t(region.labelKey)}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">{t("sales_modal_footer")}</p>
      </div>
    </div>
  );
}

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);

  const links = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("products") },
    { href: "/simulator", label: t("simulator") },
    { href: "/calculator", label: t("calculator") },
    { href: "/booking", label: t("booking") },
    { href: "/faq", label: t("faq") },
  ];

  async function switchLocale(locale: string) {
    document.cookie = `locale=${locale}; path=/; max-age=31536000`;
    window.location.reload();
  }

  return (
    <>
      <nav className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="Persona Taiwan" width={140} height={36} className="h-9 w-auto" style={{filter: 'invert(1) hue-rotate(180deg)'}} />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-yellow-400 ${
                  pathname === link.href ? "text-yellow-400" : "text-gray-200"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setShowSalesModal(true)}
              className="ml-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm px-4 py-1.5 rounded-lg transition-colors"
            >
              {t("sales_btn")}
            </button>
            {/* Locale switcher */}
            <div className="flex gap-1 border border-gray-600 rounded overflow-hidden">
              <button onClick={() => switchLocale("zh-TW")} className="px-2 py-1 text-xs hover:bg-gray-700 transition-colors">中文</button>
              <button onClick={() => switchLocale("en")} className="px-2 py-1 text-xs hover:bg-gray-700 transition-colors">EN</button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-200 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-gray-800 px-4 py-3 flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-yellow-400 ${
                  pathname === link.href ? "text-yellow-400" : "text-gray-200"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { setMenuOpen(false); setShowSalesModal(true); }}
              className="text-left bg-yellow-400 text-gray-900 font-bold text-sm px-4 py-2 rounded-lg"
            >
              {t("sales_btn")}
            </button>
            <div className="flex gap-2 pt-2 border-t border-gray-700">
              <button onClick={() => switchLocale("zh-TW")} className="text-xs text-gray-300 hover:text-white">中文</button>
              <span className="text-gray-600">|</span>
              <button onClick={() => switchLocale("en")} className="text-xs text-gray-300 hover:text-white">EN</button>
            </div>
          </div>
        )}
      </nav>

      {showSalesModal && <SalesModal onClose={() => setShowSalesModal(false)} />}
    </>
  );
}
