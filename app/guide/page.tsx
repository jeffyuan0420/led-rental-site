import { Suspense } from "react";
import GuideClient from "./GuideClient";

export const metadata = {
  title: "素材製作指南 | 盛源Persona LED 租賃",
  description: "了解如何為兩折機和三折雙面機製作最佳化的展示素材，確保展示效果完美呈現",
};

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-black text-gray-900 mb-1">素材製作指南</h1>
        <p className="text-gray-500 text-sm mb-8">了解各機型的素材製作方式，確保展示效果完美呈現</p>
        <Suspense>
          <GuideClient />
        </Suspense>
      </div>
    </main>
  );
}
