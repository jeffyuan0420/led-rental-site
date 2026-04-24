import { getTranslations } from "next-intl/server";
import Link from "next/link";

const STEP_META = [
  { icon: "📋", bg: "#1f2937" },
  { icon: "📧", bg: "#374151" },
  { icon: "✍️", bg: "#4b5563" },
  { icon: "🚚", bg: "#b45309" },
  { icon: "📦", bg: "#d97706" },
];

export default async function HomePage() {
  const t = await getTranslations("hero");
  const tNav = await getTranslations("nav");
  const tHome = await getTranslations("home");
  const tFlow = await getTranslations("flow");

  const features = [
    { icon: "☀️", title: tHome("feat1_title"), desc: tHome("feat1_desc") },
    { icon: "🔧", title: tHome("feat2_title"), desc: tHome("feat2_desc") },
    { icon: "🎯", title: tHome("feat3_title"), desc: tHome("feat3_desc") },
  ];

  const FLOW_STEPS = [
    { ...STEP_META[0], title: tFlow("s1_title"), details: [tFlow("s1_d1"), tFlow("s1_d2"), tFlow("s1_d3")] },
    { ...STEP_META[1], title: tFlow("s2_title"), details: [tFlow("s2_d1"), tFlow("s2_d2"), tFlow("s2_d3")] },
    { ...STEP_META[2], title: tFlow("s3_title"), details: [tFlow("s3_d1"), tFlow("s3_d2"), tFlow("s3_d3")] },
    { ...STEP_META[3], title: tFlow("s4_title"), details: [tFlow("s4_d1"), tFlow("s4_d2"), tFlow("s4_d3")] },
    { ...STEP_META[4], title: tFlow("s5_title"), details: [tFlow("s5_d1"), tFlow("s5_d2"), tFlow("s5_d3")] },
  ];

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
            {tHome("why_title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
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

      {/* Rental Flow */}
      <section className="py-20 bg-gray-900" id="process">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3 text-white">{tFlow("title")}</h2>
          <p className="text-center text-gray-400 mb-14 text-sm">{tFlow("subtitle")}</p>

          {/* Desktop: horizontal arrows */}
          <div className="hidden lg:flex items-start">
            {FLOW_STEPS.map((step, i) => (
              <div key={i} className="flex-1 flex flex-col" style={{ marginLeft: i > 0 ? "-14px" : "0", zIndex: FLOW_STEPS.length - i }}>
                {/* Arrow banner */}
                <div
                  className="flex flex-col items-center justify-center text-white px-5 py-5 text-center relative"
                  style={{
                    background: step.bg,
                    clipPath: i === 0
                      ? "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)"
                      : i === FLOW_STEPS.length - 1
                      ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 18px 50%)"
                      : "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 18px 50%)",
                    minHeight: "100px",
                    paddingLeft: i > 0 ? "28px" : "20px",
                    paddingRight: i < FLOW_STEPS.length - 1 ? "28px" : "20px",
                  }}
                >
                  <span className="text-3xl mb-1">{step.icon}</span>
                  <span className="text-sm font-bold leading-tight">{step.title}</span>
                </div>
                {/* Number + details */}
                <div className="mt-4 px-3 flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 text-gray-900 font-bold text-base flex items-center justify-center mb-3">
                    {i + 1}
                  </div>
                  <ul className="space-y-1.5 text-left">
                    {step.details.map((d, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-sm text-gray-300">
                        <span className="text-yellow-400 mt-0.5 shrink-0">—</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: vertical */}
          <div className="lg:hidden space-y-0">
            {FLOW_STEPS.map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full text-gray-900 font-bold text-sm flex items-center justify-center shrink-0 shadow-md text-lg"
                    style={{ background: step.bg === "#1f2937" ? "#facc15" : "#facc15" }}>
                    {step.icon}
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <div className="w-0.5 h-8 bg-yellow-400/30 my-1" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-yellow-400 text-gray-900 font-bold text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                    <h3 className="font-bold text-white text-sm">{step.title}</h3>
                  </div>
                  <ul className="space-y-1">
                    {step.details.map((d, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-sm text-gray-400">
                        <span className="text-yellow-400 shrink-0">—</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          {/* Booking policy notice */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="bg-gray-800 border border-gray-600 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-400 text-lg">📅</span>
                <span className="text-white font-bold text-base">{tFlow("policy_std_title")}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {tFlow("policy_std_before")}
                <strong className="text-yellow-400">{tFlow("policy_std_highlight")}</strong>
                {tFlow("policy_std_after")}
              </p>
            </div>
            <div className="bg-gray-800 border border-amber-600/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-400 text-lg">⚡</span>
                <span className="text-white font-bold text-base">{tFlow("policy_urg_title")}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {tFlow("policy_urg_before")}
                <strong className="text-amber-400">{tFlow("policy_urg_highlight")}</strong>
                {tFlow("policy_urg_after")}
              </p>
            </div>
            <p className="md:col-span-2 text-center text-gray-500 text-xs mt-1">
              {tFlow("policy_note")}
            </p>
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
