import { getTranslations } from "next-intl/server";
import BackButton from "@/components/BackButton";

export default async function KioskProductsPage() {
  const t = await getTranslations("product");

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <BackButton />
      <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
        {t("kiosk_section_title")}
      </h1>
      <p className="text-center text-gray-500 mb-14 text-lg">
        {t("kiosk_section_subtitle")}
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-900 text-white px-8 py-4 text-sm font-medium">
          {t("kiosk_highlight")}
        </div>
        <div className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-3 pr-4 text-gray-400 font-medium w-36" />
                  <th className="text-center py-3 px-6 border-b-2 border-gray-900">
                    <span className="text-lg font-bold text-gray-900">{t("kiosk_55_name")}</span>
                    <p className="text-xs text-gray-400 font-normal mt-0.5">55K10SK-PRO</p>
                  </th>
                  <th className="text-center py-3 px-6 border-b-2 border-gray-300">
                    <span className="text-lg font-bold text-gray-900">{t("kiosk_65_name")}</span>
                    <p className="text-xs text-gray-400 font-normal mt-0.5">65K10SK-PRO</p>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {([
                  [t("size"),               "1984×745×389 mm",       "1999×821×730 mm"],
                  [t("kiosk_display_area"), "55\" / 1210×682 mm",    "65\" / 1428×804 mm"],
                  [t("kiosk_resolution"),   "3840×2160 (4K UHD)",    "3840×2160 (4K UHD)"],
                  [t("brightness"),         "350 cd/m²",              "350 cd/m²"],
                  [t("kiosk_touch"),        t("kiosk_touch_val"),    t("kiosk_touch_val")],
                  [t("kiosk_os"),           "Android 13 / 4GB+32GB", "Android 13 / 4GB+32GB"],
                  [t("weight"),             "33.9 kg",               "64.7 kg"],
                  [t("power"),              "≤ 120 W",               "—"],
                  [t("kiosk_inventory"),    "28 台",                 "2 台"],
                ] as [string, string, string][]).map(([label, v55, v65]) => (
                  <tr key={label}>
                    <td className="py-2.5 pr-4 text-gray-500 font-medium">{label}</td>
                    <td className="py-2.5 px-6 text-center text-gray-800 font-semibold">{v55}</td>
                    <td className="py-2.5 px-6 text-center text-gray-800 font-semibold">{v65}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-7 mb-6">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
              {t("use_case")}
            </p>
            <div className="flex flex-wrap gap-2">
              {[t("kiosk_use1"), t("kiosk_use2"), t("kiosk_use3"), t("kiosk_use4")].map((uc) => (
                <span key={uc} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  {uc}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-6 py-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">{t("kiosk_price_tbd")}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t("kiosk_price_note")}</p>
            </div>
            <a
              href="https://line.me/R/ti/p/@touchpersona"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              {t("kiosk_inquiry_btn")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
