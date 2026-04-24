import { getTranslations } from "next-intl/server";

export default async function FaqPage() {
  const t = await getTranslations("faq");

  const FAQS = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
    { q: t("q6"), a: t("a6") },
    { q: t("q7"), a: t("a7") },
    { q: t("q8"), a: t("a8") },
    { q: t("q9"), a: t("a9") },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-3">{t("title")}</h1>
        <p className="text-center text-gray-500 mb-12 text-sm">{t("subtitle")}</p>

        <div className="space-y-4">
          {FAQS.map((item, i) => (
            <details
              key={i}
              className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <summary className="flex items-center gap-4 px-6 py-5 cursor-pointer select-none list-none hover:bg-gray-50 transition-colors">
                <span className="shrink-0 w-8 h-8 rounded-full bg-gray-900 text-yellow-400 font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="font-semibold text-gray-800 flex-1">{item.q}</span>
                <svg
                  className="w-5 h-5 text-gray-400 shrink-0 transition-transform group-open:rotate-180"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-5 pt-1 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center bg-gray-900 rounded-xl p-8 text-white">
          <p className="font-semibold text-lg mb-1">{t("contact_title")}</p>
          <p className="text-gray-400 text-sm mb-5">{t("contact_subtitle")}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href="https://line.me/R/ti/p/@touchpersona"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              {t("line_btn")}
            </a>
            <a
              href="mailto:help@csknight.com"
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              {t("email_btn")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
