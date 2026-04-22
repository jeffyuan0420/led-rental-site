"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import BackButton from "@/components/BackButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase, type Booking } from "@/lib/supabase";

type BookedRange = { start: Date; end: Date };

const INVENTORY = { single: 24, triple: 2 };
const BUFFER_DAYS = 2;

export default function BookingClient() {
  const t = useTranslations("booking");
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
      setAvailabilityMsg(t("availability_max", { max: maxUnits }));
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
        t("availability_shortage", { remaining, qty, date: freeDateStr })
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError(t("date_required"));
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
      setError(t("submit_error"));
    } else {
      // Fire-and-forget email notification (non-blocking)
      fetch("/api/notify-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      }).catch(() => {});
      setSubmitted(true);
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-800 mb-3">{t("success_title")}</h2>
        <p className="text-green-700">{t("success_msg")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
      <BackButton />
      {/* Date picker */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("date_label")} <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">{t("date_start")}</p>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              selectsStart
              startDate={startDate ?? undefined}
              endDate={endDate ?? undefined}
              filterDate={filterDate}
              minDate={new Date()}
              placeholderText={t("date_start_placeholder")}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
              dateFormat="yyyy/MM/dd"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">{t("date_end")}</p>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              selectsEnd
              startDate={startDate ?? undefined}
              endDate={endDate ?? undefined}
              minDate={startDate ?? new Date()}
              filterDate={filterDate}
              placeholderText={t("date_end_placeholder")}
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
            {t("name_label")} <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
            placeholder={t("name_placeholder")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("company_label")}
          </label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
            placeholder={t("company_placeholder")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("phone_label")} <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
            placeholder={t("phone_placeholder")}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("email_label")} <span className="text-red-500">*</span>
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
            {t("product_label")} <span className="text-red-500">*</span>
          </label>
          <select
            value={form.product_type}
            onChange={(e) =>
              setForm({ ...form, product_type: e.target.value as "single" | "triple" })
            }
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
          >
            <option value="single">{t("single_option")}</option>
            <option value="triple">{t("triple_option")}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("quantity_label")} <span className="text-red-500">*</span>
          </label>
          <select
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: parseInt(e.target.value) as 1 | 2 | 3 })
            }
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
          >
            <option value={1}>1 {t("qty_unit")}</option>
            <option value={2}>2 {t("qty_unit")}</option>
            <option value={3}>3 {t("qty_unit")}</option>
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
        <span className="text-sm text-gray-700">{t("add_setup_label")}</span>
      </label>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{t("notes_label")}</label>
        <textarea
          rows={4}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none resize-none"
          placeholder={t("notes_placeholder")}
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
        {loading ? t("submit_loading") : t("submit_btn")}
      </button>
    </form>
  );
}
