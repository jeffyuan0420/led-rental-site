import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import BackButton from "@/components/BackButton";
import DimensionDiagram from "@/components/DimensionDiagram";

export default async function ProductsPage() {
  const t = await getTranslations("product");
  const tNav = await getTranslations("nav");
  const tHero = await getTranslations("hero");

  const products = [
    {
      key: "single" as const,
      name: t("single_name"),
      nameEn: "Two-Fold Display",
      size: "664 × 1920 mm",
      brightness: "650～800 nits",
      ipRating: "IP31",
      weight: "52 kg",
      useCases: [t("single_use1"), t("single_use2"), t("single_use3")],
      image: "/images/single.png",
      highlight: t("single_highlight"),
      youtubeId: "urffISPwXK4",
    },
    {
      key: "triple" as const,
      name: t("triple_name"),
      nameEn: "Triple-Fold Double-Side Display",
      size: "640 × 1920 mm / 1280 × 1920 mm",
      brightness: "650～800 nits",
      ipRating: "IP31",
      weight: "~80 kg",
      useCases: [t("triple_use1"), t("triple_use2"), t("triple_use3")],
      image: "/images/triple.png",
      highlight: t("triple_highlight"),
      youtubeId: "l5qzBeU3Cps",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <BackButton />
      <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
        {tNav("products")}
      </h1>
      <p className="text-center text-gray-500 mb-14 text-lg">
        {t("page_subtitle")}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {products.map((product) => (
          <div
            key={product.key}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="relative h-80 bg-gray-50 overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
            </div>

            {/* YouTube product video */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/${product.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${product.youtubeId}`}
                title={product.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-bold mb-1 text-gray-900">
                {product.name}
              </h2>
              <p className="text-gray-500 mb-5 text-sm">{product.nameEn}</p>

              <p className="text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm mb-6">
                {product.highlight}
              </p>

              {/* Specs table */}
              <table className="w-full text-sm mb-6">
                <tbody>
                  {[
                    { label: t("size"), value: product.size },
                    { label: t("brightness"), value: product.brightness },
                    { label: t("ip_rating"), value: product.ipRating },
                    { label: t("weight"), value: product.weight },
                  ].map((spec) => (
                    <tr key={spec.label} className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-500 font-medium w-28">
                        {spec.label}
                      </td>
                      <td className="py-2 text-gray-800 font-semibold">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Use cases */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                  {t("use_case")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.useCases.map((uc) => (
                    <span
                      key={uc}
                      className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                    >
                      {uc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dimension diagram */}
              <DimensionDiagram machineType={product.key} />

              <div className="flex gap-3 mt-6">
                <Link
                  href={`/simulator?type=${product.key}`}
                  className="flex-1 text-center bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {t("simulate_btn")}
                </Link>
                <Link
                  href="/booking"
                  className="flex-1 text-center bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {tHero("cta_booking")}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
