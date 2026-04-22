"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function BackButton() {
  const router = useRouter();
  const t = useTranslations("common");
  return (
    <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
      ← {t("back")}
    </button>
  );
}
