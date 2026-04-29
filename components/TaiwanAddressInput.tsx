"use client";

import { TAIWAN_DISTRICTS, TAIWAN_CITIES } from "@/lib/taiwanDistricts";

interface Props {
  city: string;
  district: string;
  detail: string;
  onChange: (city: string, district: string, detail: string) => void;
  required?: boolean;
  detailPlaceholder?: string;
  cityLabel?: string;
  districtLabel?: string;
  detailLabel?: string;
  cityPlaceholder?: string;
  districtPlaceholder?: string;
}

const selectCls = "border-2 border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none bg-white w-full";

export default function TaiwanAddressInput({
  city, district, detail, onChange, required,
  detailPlaceholder = "路名、門牌號碼",
  cityLabel = "縣市",
  districtLabel = "鄉鎮市區",
  detailLabel = "詳細地址",
  cityPlaceholder = "請選擇縣市",
  districtPlaceholder = "請選擇鄉鎮市區",
}: Props) {
  const districts = city ? (TAIWAN_DISTRICTS[city] ?? []) : [];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">{cityLabel}</label>
          <select
            value={city}
            onChange={(e) => onChange(e.target.value, "", detail)}
            required={required}
            className={selectCls}
          >
            <option value="">{cityPlaceholder}</option>
            {TAIWAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">{districtLabel}</label>
          <select
            value={district}
            onChange={(e) => onChange(city, e.target.value, detail)}
            required={required}
            disabled={!city}
            className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <option value="">{districtPlaceholder}</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">{detailLabel}</label>
        <input
          type="text"
          value={detail}
          onChange={(e) => onChange(city, district, e.target.value)}
          required={required}
          placeholder={detailPlaceholder}
          className={selectCls}
        />
      </div>
    </div>
  );
}
