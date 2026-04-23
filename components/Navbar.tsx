"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="Persona Taiwan" width={140} height={36} className="h-9 w-auto" style={{filter: 'none'}} />
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
          {/* Locale switcher */}
          <div className="flex gap-1 ml-4 border border-gray-600 rounded overflow-hidden">
            <button
              onClick={() => switchLocale("zh-TW")}
              className="px-2 py-1 text-xs hover:bg-gray-700 transition-colors"
            >
              中文
            </button>
            <button
              onClick={() => switchLocale("en")}
              className="px-2 py-1 text-xs hover:bg-gray-700 transition-colors"
            >
              EN
            </button>
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
          <div className="flex gap-2 pt-2 border-t border-gray-700">
            <button onClick={() => switchLocale("zh-TW")} className="text-xs text-gray-300 hover:text-white">中文</button>
            <span className="text-gray-600">|</span>
            <button onClick={() => switchLocale("en")} className="text-xs text-gray-300 hover:text-white">EN</button>
          </div>
        </div>
      )}
    </nav>
  );
}
