"use client";

import { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase, type Booking } from "@/lib/supabase";

type BookedRange = { start: Date; end: Date };

const INVENTORY = { single: 24, triple: 2 };
const BUFFER_DAYS = 2;

export default function BookingClient() {
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availabilityMsg, setAvailabilityMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    product_type: "single" as "single" | "triple",
    quantity: 1 as 1 | 2 | 3,
    add_setup: false,
    notes: "",
  });

  useEffect(() => {
    checkAvailability(startDate, endDate, form.product_type, form.quantity);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, form.product_type, form.quantity]);

  // Load booked dates
  useEffect(() => {
    async function loadBookings() {
      const { data } = await supabase
        .from("bookings")
        .select("start_date, end_date")
        .eq("status", "confirmed");

      if (data) {
        setBookedRanges(
          data.map((b) => ({
            start: new Date(b.start_date),
            end: new Date(b.end_date),
          }))
        );
      }
    }
    loadBookings();
  }, []);

  function isDateBooked(date: Date): boolean {
    return bookedRanges.some(
      (range) => date >= range.start && date <= range.end
    );
  }

  function filterDate(date: Date): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return date >= tomorrow && !isDateBooked(date);
  }

  async function checkAvailability(
    start: Date | null,
    end: Date | null,
    productType: "single" | "triple",
    qty: number
  ) {
    if (!start || !end) { setAvailabilityMsg(null); return; }
    const maxUnits = INVENTORY[productType];
    if (qty > maxUnits) {
      setAvailabilityMsg(`此機種最多可租 ${maxUnits} 台`);
      return;
    }
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];
    const { data } = await supabase
      .from("bookings")
      .select("quantity, end_date")
      .eq("status", "confirmed")
      .eq("product_type", productType)
      .lte("start_date", endStr)
      .gte("end_date", startStr);

    const bookedQty = (data ?? []).reduce((sum, b) => sum + b.quantity, 0);
    const remaining = maxUnits - bookedQty;
    if (remaining >= qty) {
      setAvailabilityMsg(null);
    } else {
      const earliestFree = (data ?? [])
        .map((b) => new Date(b.end_date))
        .sort((a, b) => a.getTime() - b.getTime())[0];
      const freeDate = new Date(earliestFree);
      freeDate.setDate(freeDate.getDate() + BUFFER_DAYS + 1);
      const freeDateStr = `${freeDate.getFullYear()}/${String(freeDate.getMonth()+1).padStart(2,"0")}/${String(freeDate.getDate()).padStart(2,"0")}`;
      setAvailabilityMsg(
        `此時段目前僅剩 ${remaining} 台可租，無法滿足 ${qty} 台需求。預計 ${freeDateStr} 後將釋出更多台數。`
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError("請選擇租賃日期區間");
      return;
    }
    if (availabilityMsg) {
      setError(availabilityMsg);
      return;
    }
    setLoading(true);
    setError(null);

    const booking = {
      ...form,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    };

    const { error: sbError } = await supabase.from("bookings").insert([booking]);

    if (sbError) {
      setError("送出失敗，請稍後再試或聯繫我們");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-800 mb-3">預約成功！</h2>
        <p className="text-green-700">
          感謝您的預約，我們將於 1 工作天內與您確認細節。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
      <BackButton />
      {/* Date picker */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          租賃日期區間 <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">開始日期</p>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              selectsStart
              startDate={startDate ?? undefined}
              endDate={endDate ?? undefined}
              filterDate={filterDate}
              minDate={new Date()}
              placeholderText="選擇開始日期"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
              dateFormat="yyyy/MM/dd"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">結束日期</p>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              selectsEnd
              startDate={startDate ?? undefined}
              endDate={endDate ?? undefined}
              minDate={startDate ?? new Date()}
              filterDate={filterDate}
              placeholderText="選擇結束日期"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
              dateFormat="yyyy/MM/dd"
            />
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            姓名 <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
            placeholder="王小明"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            公司名稱（選填）
          </label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
            placeholder="XX 有限公司"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            聯絡電話 <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
            placeholder="0912-345-678"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            電子信箱 <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
            placeholder="example@email.com"
          />
        </div>
      </div>

      {/* Product options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            產品類型 <span className="text-red-500">*</span>
          </label>
          <select
            value={form.product_type}
            onChange={(e) =>
              setForm({ ...form, product_type: e.target.value as "single" | "triple" })
            }
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
          >
            <option value="single">單面直立機</option>
            <option value="triple">三折雙面機</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            台數 <span className="text-red-500">*</span>
          </label>
          <select
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: parseInt(e.target.value) as 1 | 2 | 3 })
            }
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
          >
            <option value={1}>1 台</option>
            <option value={2}>2 台</option>
            <option value={3}>3 台</option>
          </select>
        </div>
      </div>

      {/* Setup */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.add_setup}
          onChange={(e) => setForm({ ...form, add_setup: e.target.checked })}
          className="w-5 h-5 rounded accent-gray-900"
        />
        <span className="text-sm text-gray-700">需要設定協助服務</span>
      </label>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">備註</label>
        <textarea
          rows={4}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none resize-none"
          placeholder="請描述您的活動場景、特殊需求等..."
        />
      </div>

      {availabilityMsg && (
        <p className="text-yellow-800 text-sm bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-2">
          ⚠️ {availabilityMsg}
        </p>
      )}

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl text-base transition-colors"
      >
        {loading ? "送出中..." : "送出預約"}
      </button>
    </form>
  );
}
