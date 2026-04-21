import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function HomePage() {
  const t = await getTranslations("hero");
  const tNav = await getTranslations("nav");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden min-h-[70vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900 opacity-90" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center w-full">
          <p className="text-yellow-400 font-semibold text-sm uppercase tracking-widest mb-4">
            Persona Taiwan
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t("title")}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all hover:scale-105 shadow-lg"
            >
              {t("cta_products")}
            </Link>
            <Link
              href="/booking"
              className="border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold px-8 py-4 rounded-lg text-lg transition-all hover:scale-105"
            >
              {t("cta_booking")}
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            為什麼選擇 Persona Taiwan？
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "☀️",
                title: "高亮度室內展示",
                desc: "650～800 nits 高亮度，畫面清晰銳利，適合室內展覽、活動現場",
              },
              {
                icon: "🔧",
                title: "拼接靈活多變",
                desc: "支援 1 至 3 台拼接，橫向延伸視覺效果，滿足不同場地需求",
              },
              {
                icon: "🎯",
                title: "全程協助服務",
                desc: "提供設定協助選配，從佈置到撤場，專業團隊全程到位",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick nav */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: "/products", label: tNav("products"), icon: "📦" },
            { href: "/simulator", label: tNav("simulator"), icon: "🖼️" },
            { href: "/calculator", label: tNav("calculator"), icon: "🧮" },
            { href: "/booking", label: tNav("booking"), icon: "📅" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-5 rounded-xl border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all group"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-semibold text-gray-700 group-hover:text-yellow-700">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
