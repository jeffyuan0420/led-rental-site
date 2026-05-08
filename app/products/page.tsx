import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";

export default async function ProductsPage() {
  const t = await getTranslations("product");
  const tNav = await getTranslations("nav");

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
        {tNav("products")}
      </h1>
      <p className="text-center text-gray-500 mb-14 text-lg">
        {t("overview_subtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LED 廣告機 */}
        <Link
          href="/products/led"
          className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all overflow-hidden"
        >
          <div className="relative h-64 bg-gray-50 overflow-hidden">
            <Image
              src="/images/single.png"
              alt={t("led_line_title")}
              fill
              className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-8">
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {t("led_line_badge")}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {t("led_line_title")}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {t("led_line_desc")}
            </p>
            <div className="flex items-center text-gray-900 font-semibold text-sm group-hover:gap-3 gap-2 transition-all">
              {t("view_details_btn")}
              <span className="text-lg">→</span>
            </div>
          </div>
        </Link>

        {/* 觸控廣告機 */}
        <Link
          href="/products/kiosk"
          className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all overflow-hidden"
        >
          <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center overflow-hidden">
            <div className="text-center select-none">
              <div className="flex items-end justify-center gap-6">
                <div className="bg-white/10 rounded-xl border border-white/20 px-5 py-8 flex flex-col items-center gap-2">
                  <span className="text-white/40 text-xs font-bold tracking-widest">55&quot;</span>
                  <div className="w-10 h-16 border-2 border-white/30 rounded" />
                </div>
                <div className="bg-white/10 rounded-xl border border-white/20 px-6 py-10 flex flex-col items-center gap-2">
                  <span className="text-white/40 text-xs font-bold tracking-widest">65&quot;</span>
                  <div className="w-12 h-20 border-2 border-white/30 rounded" />
                </div>
              </div>
              <p className="text-white/30 text-xs mt-5 tracking-widest uppercase">Touch Kiosk</p>
            </div>
          </div>
          <div className="p-8">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {t("kiosk_line_badge")}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {t("kiosk_section_title")}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {t("kiosk_line_desc")}
            </p>
            <div className="flex items-center text-gray-900 font-semibold text-sm group-hover:gap-3 gap-2 transition-all">
              {t("view_details_btn")}
              <span className="text-lg">→</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
