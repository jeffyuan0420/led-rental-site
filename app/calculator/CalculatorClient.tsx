"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import BackButton from "@/components/BackButton";
import { RATES, calculateTotal, type ProductType } from "@/lib/pricing";

const LINE_OA = "https://line.me/R/ti/p/@touchpersona";
const MAX_STANDARD_DAYS = 5;

export default function CalculatorClient() {
  const t = useTranslations("calculator");
  const [productType, setProductType] = useState<ProductType>("single");
  const [qtyInput, setQtyInput] = useState<string>("1");
  const [daysInput, setDaysInput] = useState<string>("1");
  const [addSetup, setAddSetup] = useState(false);
  const [includeShipping, setIncludeShipping] = useState(true);

  const quantity = Math.max(1, parseInt(qtyInput) || 1);
  const days = Math.max(1, parseInt(daysInput) || 1);
  const isLongRental = days > MAX_STANDARD_DAYS;

  const result = calculateTotal({ productType, quantity, days, addSetup, includeShipping });
  const hasRates = RATES.perUnit.single > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <BackButton />

      {/* Product Type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">{t("product_type_label")}</label>
        <div className="flex gap-3">
          {([["single", t("single_label")], ["triple", t("triple_label")]] as [ProductType, string][]).map(([type, label]) => (
            <button key={type} onClick={() => setProductType(type)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${productType === type ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:border-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity — +/- buttons + free-type input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">{t("quantity_label")}</label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQtyInput(String(Math.max(1, quantity - 1)))}
            className="w-10 h-10 rounded-full border-2 border-gray-300 text-xl font-bold hover:border-gray-700 transition-colors"
          >−</button>
          <input
            type="number"
            min={1}
            max={99}
            value={qtyInput}
            onChange={(e) => setQtyInput(e.target.value)}
            onBlur={() => setQtyInput(String(Math.max(1, parseInt(qtyInput) || 1)))}
            className="w-20 border-2 border-gray-300 rounded-xl px-3 py-2 text-lg font-bold text-center focus:border-gray-900 focus:outline-none"
          />
          <button
            onClick={() => setQtyInput(String(quantity + 1))}
            className="w-10 h-10 rounded-full border-2 border-gray-300 text-xl font-bold hover:border-gray-700 transition-colors"
          >+</button>
          <span className="text-gray-500">{t("qty_suffix")}</span>
        </div>
      </div>

      {/* Days — free-type input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t("days_label")}</label>
        <p className="text-xs text-gray-400 mb-3">{t("days_hint")}</p>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min={1}
            max={365}
            value={daysInput}
            onChange={(e) => setDaysInput(e.target.value)}
            onBlur={() => setDaysInput(String(Math.max(1, parseInt(daysInput) || 1)))}
            className="w-28 border-2 border-gray-300 rounded-xl px-4 py-2.5 text-lg font-bold text-center focus:border-gray-900 focus:outline-none"
          />
          <span className="text-gray-500">{t("day_suffix")}</span>
        </div>
      </div>

      {/* Options */}
      <div className="mb-8 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={addSetup} onChange={(e) => setAddSetup(e.target.checked)} className="w-5 h-5 rounded accent-gray-900" />
          <span className="text-sm text-gray-700">{t("include_setup")}</span>
          {RATES.setup > 0 && <span className="text-xs text-gray-400 ml-auto">NT$ {RATES.setup.toLocaleString()}</span>}
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={includeShipping} onChange={(e) => setIncludeShipping(e.target.checked)} className="w-5 h-5 rounded accent-gray-900" />
          <span className="text-sm text-gray-700">{t("include_shipping")}</span>
          {RATES.shipping > 0 && <span className="text-xs text-gray-400 ml-auto">NT$ {(RATES.shipping * 2).toLocaleString()}</span>}
        </label>
      </div>

      {/* Long rental warning */}
      {isLongRental ? (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 mb-6 text-center">
          <p className="text-yellow-800 font-semibold mb-1">📋 {t("long_rental_warning")}</p>
          <p className="text-yellow-700 text-sm mb-4">({days} {t("day_suffix")})</p>
          <a
            href={LINE_OA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            {t("long_rental_cta")}
          </a>
        </div>
      ) : (
        /* Result */
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          {hasRates ? (
            <>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>{t("rental_fee")} ({quantity} × {days} × NT${result.unitRate.toLocaleString()})</span>
                  <span>NT$ {result.rentalFee.toLocaleString()}</span>
                </div>
                {addSetup && (
                  <div className="flex justify-between text-gray-600">
                    <span>{t("setup_fee")}</span>
                    <span>NT$ {result.setupFee.toLocaleString()}</span>
                  </div>
                )}
                {includeShipping && (
                  <div className="flex justify-between text-gray-600">
                    <span>{t("shipping_fee")}</span>
                    <span>NT$ {result.shippingFee.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-lg">{t("estimated_total_label")}</span>
                <span className="font-bold text-2xl text-gray-900">NT$ {result.total.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">{t("note")}</p>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-2">{t("rates_tbd")}</p>
              <p className="text-xs text-gray-400">{t("contact_for_quote")}</p>
            </div>
          )}
        </div>
      )}

      {!isLongRental && (
        <Link
          href="/booking"
          className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3.5 rounded-xl text-base transition-colors"
        >
          {t("goto_booking")}
        </Link>
      )}
    </div>
  );
}
