"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RATES, calculateTotal, type ProductType } from "@/lib/pricing";

export default function CalculatorClient() {
  const router = useRouter();
  const [productType, setProductType] = useState<ProductType>("single");
  const [quantity, setQuantity] = useState<number>(1);
  const [days, setDays] = useState<number>(1);
  const [addSetup, setAddSetup] = useState(false);
  const [includeShipping, setIncludeShipping] = useState(true);

  const result = calculateTotal({ productType, quantity, days, addSetup, includeShipping });
  const hasRates = RATES.perUnit.single > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      {/* Back button */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        ← 返回上一頁
      </button>

      {/* Product Type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">機型</label>
        <div className="flex gap-3">
          {([["single", "單面/兩折機"], ["triple", "三折雙面機"]] as [ProductType, string][]).map(([type, label]) => (
            <button key={type} onClick={() => setProductType(type)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${productType === type ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:border-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">台數</label>
        <div className="flex items-center gap-4">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full border-2 border-gray-300 text-xl font-bold hover:border-gray-700 transition-colors">−</button>
          <input type="number" min={1} max={99} value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 border-2 border-gray-300 rounded-xl px-3 py-2 text-lg font-bold text-center focus:border-gray-900 focus:outline-none" />
          <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full border-2 border-gray-300 text-xl font-bold hover:border-gray-700 transition-colors">+</button>
          <span className="text-gray-500">台</span>
        </div>
      </div>

      {/* Days */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          租賃天數
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-28 border-2 border-gray-300 rounded-xl px-4 py-2.5 text-lg font-bold text-center focus:border-gray-900 focus:outline-none"
          />
          <span className="text-gray-500">天</span>
        </div>
      </div>

      {/* Options */}
      <div className="mb-8 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={addSetup}
            onChange={(e) => setAddSetup(e.target.checked)}
            className="w-5 h-5 rounded accent-gray-900"
          />
          <span className="text-sm text-gray-700">含設定協助服務</span>
          {RATES.setup > 0 && <span className="text-xs text-gray-400 ml-auto">NT$ {RATES.setup.toLocaleString()}</span>}
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeShipping}
            onChange={(e) => setIncludeShipping(e.target.checked)}
            className="w-5 h-5 rounded accent-gray-900"
          />
          <span className="text-sm text-gray-700">含運費（非偏遠山區，來回計）</span>
          {RATES.shipping > 0 && (
            <span className="text-xs text-gray-400 ml-auto">
              NT$ {(RATES.shipping * 2).toLocaleString()}
            </span>
          )}
        </label>
      </div>

      {/* Result */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        {hasRates ? (
          <>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>
                  租賃費用（{quantity} 台 × {days} 天 × NT${result.unitRate.toLocaleString()}）
                </span>
                <span>NT$ {result.rentalFee.toLocaleString()}</span>
              </div>
              {addSetup && (
                <div className="flex justify-between text-gray-600">
                  <span>設定協助費</span>
                  <span>NT$ {result.setupFee.toLocaleString()}</span>
                </div>
              )}
              {includeShipping && (
                <div className="flex justify-between text-gray-600">
                  <span>運費（來回）</span>
                  <span>NT$ {result.shippingFee.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900 text-lg">估算總費用</span>
              <span className="font-bold text-2xl text-gray-900">
                NT$ {result.total.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              ※ 以上為估算金額，實際費用以確認書為準
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm mb-2">費率設定中，敬請期待</p>
            <p className="text-xs text-gray-400">
              請聯繫我們取得最新報價
            </p>
          </div>
        )}
      </div>

      <Link
        href="/booking"
        className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3.5 rounded-xl text-base transition-colors"
      >
        前往預約
      </Link>
    </div>
  );
}
