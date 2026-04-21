"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Booking } from "@/lib/supabase";

const PRODUCT_LABELS = {
  single: "單面直立機",
  triple: "三折雙面機",
};

const STATUS_LABELS = {
  pending: { label: "待確認", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "已確認", color: "bg-green-100 text-green-800" },
  cancelled: { label: "已取消", color: "bg-red-100 text-red-800" },
};

export default function AdminBookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);
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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">載入中...</div>
    );
  }

  return (
    <div>
      {/* Header bar */}
      <div className="flex justify-end mb-6">
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
                {["姓名", "公司", "產品", "台數", "日期區間", "設定協助", "狀態", "操作"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
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
                    <td className="px-4 py-3">
                      {b.add_setup ? "✅" : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_LABELS[b.status].color}`}>
                        {STATUS_LABELS[b.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value as Booking["status"])}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none"
                      >
                        <option value="pending">待確認</option>
                        <option value="confirmed">已確認</option>
                        <option value="cancelled">已取消</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                { label: "設定協助", value: selected.add_setup ? "是" : "否" },
                { label: "備註", value: selected.notes ?? "—" },
                { label: "建立時間", value: new Date(selected.created_at).toLocaleString("zh-TW") },
              ].map((row) => (
                <div key={row.label} className="flex gap-4 border-b border-gray-100 pb-2">
                  <span className="text-gray-400 w-20 flex-shrink-0">{row.label}</span>
                  <span className="text-gray-900 font-medium">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
