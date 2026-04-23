"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Booking } from "@/lib/supabase";
import { calculateTotal, RATES } from "@/lib/pricing";
import { PAYMENT, addWorkingDays } from "@/lib/payment";

const PRODUCT_LABELS = {
  single: "單面直立機",
  triple: "三折雙面機",
};

const STATUS_LABELS = {
  pending: { label: "待確認", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "已確認", color: "bg-green-100 text-green-800" },
  cancelled: { label: "已取消", color: "bg-red-100 text-red-800" },
};

function calcDays(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

function calcFee(b: Booking): string {
  const days = calcDays(b.start_date, b.end_date);
  if (days > 5) return "專案報價";
  const { total } = calculateTotal({
    productType: b.product_type,
    quantity: b.quantity,
    days,
    setupOption: b.setup_option,
    includeShipping: true,
  });
  return `NT$ ${total.toLocaleString()}`;
}

function exportCSV(bookings: Booking[]) {
  const headers = ["姓名", "公司", "電話", "Email", "產品", "台數", "進場日期", "撤場日期", "天數", "設定協助", "估算費用", "狀態", "建立時間", "備註"];
  const rows = bookings.map((b) => {
    const days = calcDays(b.start_date, b.end_date);
    return [
      b.name,
      b.company ?? "",
      b.phone,
      b.email,
      PRODUCT_LABELS[b.product_type],
      b.quantity,
      b.start_date,
      b.end_date,
      days,
      b.setup_option === "none" ? "否" : b.setup_option === "half" ? "半天" : "整天",
      calcFee(b),
      STATUS_LABELS[b.status].label,
      new Date(b.created_at).toLocaleString("zh-TW"),
      b.notes ?? "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });
  const csv = "﻿" + [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const DAYS_OF_WEEK = ["（日）", "（一）", "（二）", "（三）", "（四）", "（五）", "（六）"];

function formatDeadline(date: Date): string {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}${DAYS_OF_WEEK[date.getDay()]}`;
}

export default function AdminBookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [showConfirmPreview, setShowConfirmPreview] = useState(false);
  const [confirmSending, setConfirmSending] = useState(false);
  const [confirmResult, setConfirmResult] = useState<"sent" | "error" | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
    await loadBookings();
  }

  async function loadBookings() {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setBookings(data as Booking[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: Booking["status"]) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    await loadBookings();
    if (selected?.id === id) {
      setSelected((prev) => prev ? { ...prev, status } : null);
    }
  }

  async function deleteBooking(id: string) {
    if (!confirm("確定要刪除此筆預訂？此操作無法復原。")) return;
    await supabase.from("bookings").delete().eq("id", id);
    setSelected(null);
    await loadBookings();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  async function sendConfirmEmail() {
    if (!selected) return;
    setConfirmSending(true);
    setConfirmResult(null);
    try {
      const res = await fetch("/api/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selected.name,
          email: selected.email,
          company: selected.company,
          product_type: selected.product_type,
          quantity: selected.quantity,
          start_date: selected.start_date,
          end_date: selected.end_date,
          setup_option: selected.setup_option,
          teardown_time: selected.teardown_time,
          notes: selected.notes,
        }),
      });
      if (res.ok) {
        setConfirmResult("sent");
        await updateStatus(selected.id, "confirmed");
      } else {
        setConfirmResult("error");
      }
    } catch {
      setConfirmResult("error");
    } finally {
      setConfirmSending(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">載入中...</div>
    );
  }

  return (
    <div>
      {/* Header bar */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => exportCSV(bookings)}
          className="text-sm bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ↓ 匯出 CSV
        </button>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 border border-gray-300 px-4 py-2 rounded-lg transition-colors"
        >
          登出
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(["pending", "confirmed", "cancelled"] as const).map((status) => {
          const count = bookings.filter((b) => b.status === status).length;
          const s = STATUS_LABELS[status];
          return (
            <div key={status} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center">
              <p className="text-3xl font-bold text-gray-900">{count}</p>
              <p className={`text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${s.color}`}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["姓名", "公司", "產品", "台數", "日期區間", "估算費用", "設定協助", "狀態", "操作"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-400">
                    尚無預訂資料
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelected(b)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                    <td className="px-4 py-3 text-gray-500">{b.company ?? "—"}</td>
                    <td className="px-4 py-3">{PRODUCT_LABELS[b.product_type]}</td>
                    <td className="px-4 py-3">{b.quantity} 台</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.start_date} ~ {b.end_date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                      {calcFee(b)}
                    </td>
                    <td className="px-4 py-3">
                      {b.setup_option === "none" ? "—" : b.setup_option === "half" ? "半天" : "整天"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_LABELS[b.status].color}`}>
                        {STATUS_LABELS[b.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <select
                          value={b.status}
                          onChange={(e) => updateStatus(b.id, e.target.value as Booking["status"])}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none"
                        >
                          <option value="pending">待確認</option>
                          <option value="confirmed">已確認</option>
                          <option value="cancelled">已取消</option>
                        </select>
                        <button
                          onClick={() => deleteBooking(b.id)}
                          className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-2 py-1 rounded transition-colors"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm email preview modal */}
      {showConfirmPreview && selected && (() => {
        const days = calcDays(selected.start_date, selected.end_date);
        const { rentalFee, setupFee } = calculateTotal({ productType: selected.product_type, quantity: selected.quantity, days, setupOption: selected.setup_option, includeShipping: false });
        const nightFee = selected.teardown_time === "night" ? RATES.nightSurcharge * selected.quantity : 0;
        const subtotal = rentalFee + setupFee + nightFee;
        const tax = Math.round(subtotal * 0.05);
        const total = subtotal + tax;
        const deadline = addWorkingDays(new Date(), PAYMENT.paymentDeadlineDays);
        const deadlineStr = formatDeadline(deadline);
        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirmPreview(false)}>
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-5">
                <h2 className="text-lg font-bold text-gray-900">確認信預覽</h2>
                <button onClick={() => setShowConfirmPreview(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>
              <div className="text-xs text-gray-500 mb-1">收件人</div>
              <div className="text-sm font-medium text-gray-900 mb-4">{selected.email}</div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-3 border border-gray-200">
                <p className="font-semibold text-gray-700">■ 預約資訊</p>
                <div className="space-y-1 text-gray-600">
                  <p>機型：{PRODUCT_LABELS[selected.product_type]} × {selected.quantity} 台</p>
                  <p>日期：{selected.start_date} ～ {selected.end_date}（共 {days} 天）</p>
                  {selected.teardown_time === "night" && <p>撤場：夜間撤場（19:00–22:00）</p>}
                </div>
                <p className="font-semibold text-gray-700 pt-1">■ 付款金額</p>
                <div className="space-y-1 text-gray-600">
                  <p>租賃費用：NT$ {rentalFee.toLocaleString()}</p>
                  {setupFee > 0 && <p>設定協助費：NT$ {setupFee.toLocaleString()}</p>}
                  {nightFee > 0 && <p>夜間撤場費：NT$ {nightFee.toLocaleString()}</p>}
                  <p>小計（未稅）：NT$ {subtotal.toLocaleString()}</p>
                  <p>營業稅（5%）：NT$ {tax.toLocaleString()}</p>
                  <p className="font-bold text-gray-900">合計（含稅）：NT$ {total.toLocaleString()}</p>
                </div>
                <p className="font-semibold text-gray-700 pt-1">■ 匯款資訊</p>
                <div className="space-y-1 text-gray-600">
                  <p>銀行：{PAYMENT.bankName}（{PAYMENT.bankCode}）</p>
                  <p>戶名：{PAYMENT.accountName}</p>
                  <p>帳號：<span className="font-mono font-bold text-gray-900">{PAYMENT.accountNumber}</span></p>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-xs text-yellow-800">
                  付款截止：{deadlineStr}
                </div>
              </div>

              {confirmResult === "sent" && (
                <p className="mt-4 text-green-600 font-semibold text-sm text-center">✅ 確認信已寄出，狀態已更新為「已確認」</p>
              )}
              {confirmResult === "error" && (
                <p className="mt-4 text-red-600 font-semibold text-sm text-center">❌ 寄送失敗，請稍後再試</p>
              )}

              {confirmResult !== "sent" && (
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={sendConfirmEmail}
                    disabled={confirmSending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                  >
                    {confirmSending ? "寄送中..." : "確認寄出"}
                  </button>
                  <button
                    onClick={() => setShowConfirmPreview(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg text-sm transition-colors"
                  >
                    取消
                  </button>
                </div>
              )}
              {confirmResult === "sent" && (
                <button
                  onClick={() => { setShowConfirmPreview(false); setSelected(null); }}
                  className="mt-4 w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  關閉
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">預訂詳情</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: "姓名", value: selected.name },
                { label: "公司", value: selected.company ?? "—" },
                { label: "電話", value: selected.phone },
                { label: "Email", value: selected.email },
                { label: "產品", value: PRODUCT_LABELS[selected.product_type] },
                { label: "台數", value: `${selected.quantity} 台` },
                { label: "租賃日期", value: `${selected.start_date} ~ ${selected.end_date}` },
                { label: "估算費用", value: calcFee(selected) },
                { label: "設定協助", value: selected.setup_option === "none" ? "否" : selected.setup_option === "half" ? "半天" : "整天" },
                { label: "備註", value: selected.notes ?? "—" },
                { label: "建立時間", value: new Date(selected.created_at).toLocaleString("zh-TW") },
              ].map((row) => (
                <div key={row.label} className="flex gap-4 border-b border-gray-100 pb-2">
                  <span className="text-gray-400 w-20 flex-shrink-0">{row.label}</span>
                  <span className="text-gray-900 font-medium">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3 flex-wrap">
              {selected.status === "pending" && calcDays(selected.start_date, selected.end_date) <= 5 && (
                <button
                  onClick={() => { setShowConfirmPreview(true); setConfirmResult(null); }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  ✉ 發送確認信
                </button>
              )}
              <button
                onClick={() => updateStatus(selected.id, "confirmed")}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                確認預訂
              </button>
              <button
                onClick={() => updateStatus(selected.id, "cancelled")}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                取消預訂
              </button>
              <button
                onClick={() => deleteBooking(selected.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
