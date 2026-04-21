import SimulatorClient from "./SimulatorClient";
import { getTranslations } from "next-intl/server";

export default async function SimulatorPage() {
  const t = await getTranslations("simulator");
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
        {t("title")}
      </h1>
      <p className="text-center text-gray-500 mb-12 text-lg">
        {t("subtitle")}
      </p>
      <SimulatorClient />
    </div>
  );
}
