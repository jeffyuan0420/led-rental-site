"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import BackButton from "@/components/BackButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "@/lib/supabase";
import { getSetupPersons, calculateTotal, RATES, type SetupOption } from "@/lib/pricing";
import TaiwanAddressInput from "@/components/TaiwanAddressInput";

const MAX_QTY = { single: 10, triple: 2 };
const INVENTORY = { single: 20, triple: 2 };
const BUFFER_DAYS = 2;

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export default function BookingClient() {
  const t = useTranslations("booking");

  // Event dates (what customer fills first)
  const [eventStart, setEventStart] = useState<Date | null>(null);
  const [eventEnd, setEventEnd] = useState<Date | null>(null);

  // Rental dates (auto-populated, but editable)
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
    id_number: "",
    product_type: "single" as "single" | "triple",
    quantity: 1,
    setup_option: "none" as SetupOption,
    teardown_time: "daytime" as "daytime" | "night",
    invoice_type: "personal" as "personal" | "company",
    invoice_company: "",
    invoice_tax_id: "",
    invoice_city: "", invoice_district: "", invoice_detail: "",
    delivery_city: "", delivery_district: "", delivery_detail: "",
    customer_city: "", customer_district: "", customer_detail: "",
    notes: "",
  });
  const [agreedToContract, setAgreedToContract] = useState(false);
  const [agreedToPrice, setAgreedToPrice] = useState(false);

  // Auto-populate rental dates when event dates change
  useEffect(() => {
    if (eventStart) setStartDate(addDays(eventStart, -1));
  }, [eventStart]);

  useEffect(() => {
    if (eventEnd) setEndDate(addDays(eventEnd, 1));
  }, [eventEnd]);

  useEffect(() => {
    checkAvailability(startDate, endDate, form.product_type, form.quantity);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, form.product_type, form.quantity]);

  function filterDate(date: Date): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return date >= tomorrow;
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

    const bookedQty = (data ?? []).reduce((sum: number, b: { quantity: number }) => sum + b.quantity, 0);
    const remaining = maxUnits - bookedQty;
    if (remaining >= qty) {
      setAvailabilityMsg(null);
    } else {
      const earliestFree = (data ?? [])
        .map((b: { end_date: string }) => new Date(b.end_date))
        .sort((a: Date, b: Date) => a.getTime() - b.getTime())[0];
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
    if (!form.delivery_city || !form.delivery_district || !form.delivery_detail) {
      setError(t("address_required"));
      return;
    }
    if (!form.customer_city || !form.customer_district || !form.customer_detail) {
      setError(t("address_required"));
      return;
    }
    if (!form.id_number) {
      setError(t("id_number_required"));
      return;
    }
    if (!agreedToContract) {
      setError(t("contract_agree_required"));
      return;
    }
    if (startDate && endDate && !agreedToPrice) {
      setError(t("price_agree_required"));
      return;
    }
    if (form.invoice_type === "company" && (!form.invoice_company || !form.invoice_tax_id || !form.invoice_city || !form.invoice_district || !form.invoice_detail)) {
      setError(t("invoice_required"));
      return;
    }
    if (availabilityMsg) {
      setError(availabilityMsg);
      return;
    }
    setLoading(true);
    setError(null);

    const booking = {
      name: form.name,
      company: form.company || null,
      phone: form.phone,
      email: form.email,
      id_number: form.id_number,
      product_type: form.product_type,
      quantity: form.quantity,
      event_start_date: eventStart ? eventStart.toISOString().split("T")[0] : null,
      event_end_date: eventEnd ? eventEnd.toISOString().split("T")[0] : null,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      setup_option: form.setup_option,
      teardown_time: form.teardown_time,
      invoice_type: form.invoice_type,
      invoice_company: form.invoice_type === "company" ? form.invoice_company : null,
      invoice_tax_id: form.invoice_type === "company" ? form.invoice_tax_id : null,
      invoice_address: form.invoice_type === "company" ? `${form.invoice_city}${form.invoice_district}${form.invoice_detail}` : null,
      delivery_address: `${form.delivery_city}${form.delivery_district}${form.delivery_detail}`,
      customer_address: `${form.customer_city}${form.customer_district}${form.customer_detail}`,
      notes: form.notes || null,
    };

    const { error: sbError } = await supabase.from("bookings").insert([booking]);

    if (sbError) {
      setError(t("submit_error"));
    } else {
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

      {/* Step 1: Event Dates */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {t("event_date_label")} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-3">{t("event_date_hint")}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">{t("event_start")}</p>
            <DatePicker
              selected={eventStart}
              onChange={(date: Date | null) => setEventStart(date)}
              selectsStart
              startDate={eventStart ?? undefined}
              endDate={eventEnd ?? undefined}
              filterDate={filterDate}
              minDate={new Date()}
              placeholderText={t("event_start_placeholder")}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
              dateFormat="yyyy/MM/dd"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">{t("event_end")}</p>
            <DatePicker
              selected={eventEnd}
              onChange={(date: Date | null) => setEventEnd(date)}
              selectsEnd
              startDate={eventStart ?? undefined}
              endDate={eventEnd ?? undefined}
              minDate={eventStart ?? new Date()}
              filterDate={filterDate}
              placeholderText={t("event_end_placeholder")}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
              dateFormat="yyyy/MM/dd"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Rental Dates (auto-populated, editable) */}
      <div className="bg-gray-50 rounded-xl p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {t("date_label")} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-3">{t("rental_date_hint")}</p>
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
        <p className="text-xs text-yellow-600 mt-2">{t("rental_date_note")}</p>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("name_label")} <span className="text-red-500">*</span>
          </label>
          <input required type="text" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
            placeholder={t("name_placeholder")} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("company_label")}
          </label>
          <input type="text" value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
            placeholder={t("company_placeholder")} />
          <p className="text-xs text-gray-400 mt-1">如填寫公司名稱，契約乙方將登記為公司而非個人</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("phone_label")} <span className="text-red-500">*</span>
          </label>
          <input required type="tel" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
            placeholder={t("phone_placeholder")} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("email_label")} <span className="text-red-500">*</span>
          </label>
          <input required type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
            placeholder="example@email.com" />
        </div>
      </div>

      {/* Product options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("product_label")} <span className="text-red-500">*</span>
          </label>
          <select value={form.product_type}
            onChange={(e) => {
              const pt = e.target.value as "single" | "triple";
              setForm({ ...form, product_type: pt, quantity: Math.min(form.quantity, MAX_QTY[pt]) });
            }}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none">
            <option value="single">{t("single_option")}</option>
            <option value="triple">{t("triple_option")}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("quantity_label")} <span className="text-red-500">*</span>
          </label>
          <select value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none">
            {Array.from({ length: MAX_QTY[form.product_type] }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} {t("qty_unit")}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Setup Option */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t("setup_option_label")}</label>
        <p className="text-xs text-gray-400 mb-3">
          {t("setup_persons_hint", { count: getSetupPersons(form.quantity) })}
        </p>
        <div className="flex gap-2">
          {(["none", "half", "full"] as SetupOption[]).map((opt) => (
            <button key={opt} type="button"
              onClick={() => setForm({ ...form, setup_option: opt })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${form.setup_option === opt ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:border-gray-700"}`}>
              {opt === "none"
                ? t("setup_none")
                : opt === "half"
                ? `${t("setup_half")} NT$${(getSetupPersons(form.quantity) * RATES.setup.halfDay).toLocaleString()}`
                : `${t("setup_full")} NT$${(getSetupPersons(form.quantity) * RATES.setup.fullDay).toLocaleString()}`}
            </button>
          ))}
        </div>
      </div>

      {/* Teardown Time */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t("teardown_label")}</label>
        <p className="text-xs text-gray-400 mb-3">{t("teardown_hint")}</p>
        <div className="flex gap-2">
          {([
            ["daytime", t("teardown_daytime")],
            ["night",   t("teardown_night")],
          ] as ["daytime" | "night", string][]).map(([val, label]) => (
            <button key={val} type="button"
              onClick={() => setForm({ ...form, teardown_time: val })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${form.teardown_time === val ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:border-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>
        {form.teardown_time === "night" && (
          <p className="text-xs text-amber-600 mt-2">{t("teardown_night_note")}</p>
        )}
      </div>

      {/* Invoice */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t("invoice_label")}</label>
        <div className="flex gap-2 mb-3">
          {([
            ["personal", t("invoice_personal")],
            ["company",  t("invoice_company_opt")],
          ] as ["personal" | "company", string][]).map(([val, label]) => (
            <button key={val} type="button"
              onClick={() => setForm({ ...form, invoice_type: val })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${form.invoice_type === val ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:border-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>
        {form.invoice_type === "company" && (
          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {t("invoice_company_name")} <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.invoice_company}
                onChange={(e) => setForm({ ...form, invoice_company: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
                placeholder={t("invoice_company_placeholder")} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {t("invoice_tax_id")} <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.invoice_tax_id} maxLength={8}
                onChange={(e) => setForm({ ...form, invoice_tax_id: e.target.value.replace(/\D/g, "") })}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
                placeholder="12345678" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {t("invoice_address")} <span className="text-red-500">*</span>
              </label>
              <TaiwanAddressInput
                city={form.invoice_city} district={form.invoice_district} detail={form.invoice_detail}
                onChange={(c, d, v) => setForm({ ...form, invoice_city: c, invoice_district: d, invoice_detail: v })}
                required
                cityLabel={t("addr_city_label")} districtLabel={t("addr_district_label")} detailLabel={t("addr_detail_label")}
                cityPlaceholder={t("addr_city_placeholder")} districtPlaceholder={t("addr_district_placeholder")} detailPlaceholder={t("addr_detail_placeholder")}
              />
            </div>
          </div>
        )}
      </div>

      {/* Delivery Address */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {t("delivery_address_label")} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">{t("delivery_address_hint")}</p>
        <TaiwanAddressInput
          city={form.delivery_city} district={form.delivery_district} detail={form.delivery_detail}
          onChange={(c, d, v) => setForm({ ...form, delivery_city: c, delivery_district: d, delivery_detail: v })}
          required
          cityLabel={t("addr_city_label")} districtLabel={t("addr_district_label")} detailLabel={t("addr_detail_label")}
          cityPlaceholder={t("addr_city_placeholder")} districtPlaceholder={t("addr_district_placeholder")} detailPlaceholder={t("addr_detail_placeholder")}
        />
      </div>

      {/* Customer Address */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {t("customer_address_label")} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">{t("customer_address_hint")}</p>
        <TaiwanAddressInput
          city={form.customer_city} district={form.customer_district} detail={form.customer_detail}
          onChange={(c, d, v) => setForm({ ...form, customer_city: c, customer_district: d, customer_detail: v })}
          required
          cityLabel={t("addr_city_label")} districtLabel={t("addr_district_label")} detailLabel={t("addr_detail_label")}
          cityPlaceholder={t("addr_city_placeholder")} districtPlaceholder={t("addr_district_placeholder")} detailPlaceholder={t("addr_detail_placeholder")}
        />
      </div>

      {/* ID Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("id_number_label")}<span className="text-red-500"> *</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">{t("id_number_hint")}</p>
        <input required type="text" value={form.id_number}
          onChange={(e) => setForm({ ...form, id_number: e.target.value.trim() })}
          className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
          placeholder={t("id_number_placeholder")} />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{t("notes_label")}</label>
        <textarea rows={4} value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none resize-none"
          placeholder={t("notes_placeholder")} />
      </div>

      {/* Price Summary */}
      {startDate && endDate && (() => {
        const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const { rentalFee, setupFee, needsQuote } = calculateTotal({
          productType: form.product_type,
          quantity: form.quantity,
          days,
          setupOption: form.setup_option,
          includeShipping: false,
        });
        const nightFee = form.teardown_time === "night" ? RATES.nightSurcharge * form.quantity : 0;
        const subtotal = rentalFee + setupFee + nightFee;
        const tax = Math.round(subtotal * 0.05);
        const total = subtotal + tax;
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">{t("summary_title")}</h3>
            {needsQuote ? (
              <p className="text-amber-700 text-sm font-semibold">{t("summary_quote_required")}</p>
            ) : (
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{t("summary_rental_fee")}</span>
                  <span>NT$ {rentalFee.toLocaleString()}</span>
                </div>
                {setupFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>{t("summary_setup_fee")}</span>
                    <span>NT$ {setupFee.toLocaleString()}</span>
                  </div>
                )}
                {nightFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>{t("summary_night_fee")}</span>
                    <span>NT$ {nightFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 text-xs pt-1 border-t border-gray-200">
                  <span>{t("summary_subtotal")}</span>
                  <span>NT$ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>{t("summary_tax")}</span>
                  <span>NT$ {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-300">
                  <span>{t("summary_total")}</span>
                  <span>NT$ {total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{t("summary_note")}</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToPrice}
                      onChange={(e) => setAgreedToPrice(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-gray-900 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      我確認以上費用明細，含稅總金額為 <strong>NT$ {total.toLocaleString()}</strong>，並同意依此金額支付。
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Contract Agreement */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToContract}
            onChange={(e) => setAgreedToContract(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-gray-900 flex-shrink-0"
          />
          <span className="text-sm text-gray-700 leading-relaxed">
            {t.rich("contract_agree_text", {
              link: (chunks) => (
                <a
                  href="/contract"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-600"
                >{chunks}</a>
              )
            })}
          </span>
        </label>
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

      <button type="submit" disabled={loading}
        className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl text-base transition-colors">
        {loading ? t("submit_loading") : t("submit_btn")}
      </button>
    </form>
  );
}
