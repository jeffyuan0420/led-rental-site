import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import BackButton from "@/components/BackButton";

const PRODUCTS = [
  {
    key: "single",
    nameZh: "單面直立機",
    nameEn: "Single-Side Vertical Display",
    size: "640 × 1920 mm",
    brightness: "650～800 nits",
    ipRating: "IP31",
    weight: "約 35kg",
    useCases: ["展覽主視覺", "門市形象展示", "活動入口品牌牆"],
    image: "/images/single.png",
    highlight: "直立細長比例，橫向拼接後形成超寬螢幕",
  },
  {
    key: "triple",
    nameZh: "三折雙面機",
    nameEn: "Triple-Fold Double-Side Display",
    size: "摺疊 640 × 1920 mm / 展開 1280 × 1920 mm",
    brightness: "650～800 nits",
    ipRating: "IP31",
    weight: "約 80kg（含底座）",
    useCases: ["展場攤位主視覺", "記者會背板", "活動舞台側屏"],
    image: "/images/triple.png",
    highlight: "三折可自立，雙面同時展示，360° 視覺覆蓋",
  },
];

export default async function ProductsPage() {
  const t = await getTranslations("product");

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <BackButton />
      <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">產品介紹</h1>
      <p className="text-center text-gray-500 mb-14 text-lg">
        兩款高亮度 LED 廣告機，滿足不同展示需求
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {PRODUCTS.map((product) => (
          <div
            key={product.key}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="relative h-80 bg-gray-50 overflow-hidden">
              <Image
                src={product.image}
                alt={product.nameZh}
                fill
                className="object-contain p-4"
              />
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-bold mb-1 text-gray-900">
                {product.nameZh}
              </h2>
              <p className="text-gray-500 mb-5 text-sm">{product.nameEn}</p>

              <p className="text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm mb-6">
                {product.highlight}
              </p>

              {/* Specs table */}
              <table className="w-full text-sm mb-6">
                <tbody>
                  {[
                    { label: "尺寸", value: product.size },
                    { label: "亮度", value: product.brightness },
                    { label: "防護等級", value: product.ipRating },
                    { label: "重量", value: product.weight },
                  ].map((spec) => (
                    <tr key={spec.label} className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-500 font-medium w-24">
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
              <div className="mb-6">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                  適用場景
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

              <div className="flex gap-3">
                <Link
                  href="/simulator"
                  className="flex-1 text-center bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  模擬拼接效果
                </Link>
                <Link
                  href="/booking"
                  className="flex-1 text-center bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  立即預約
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
