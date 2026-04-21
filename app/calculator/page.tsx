import CalculatorClient from "./CalculatorClient";
import { getTranslations } from "next-intl/server";

export default async function CalculatorPage() {
  const t = await getTranslations("calculator");
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
        {t("title")}
      </h1>
      <p className="text-center text-gray-500 mb-12 text-lg">
        即時估算您的租賃費用
      </p>
      <CalculatorClient />
    </div>
  );
}
