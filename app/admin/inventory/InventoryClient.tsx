"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function InventoryClient() {
  const router = useRouter();
  const [single, setSingle] = useState<number>(20);
  const [triple, setTriple] = useState<number>(2);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/admin/login");
    });
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((d) => {
        setSingle(d.single);
        setTriple(d.triple);
        setLoading(false);
      });
  }, [router]);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ single, triple }),
    });
    if (res.ok) {
      setMsg("✅ 已更新！網站庫存數字即時生效。");
    } else {
      setMsg("❌ 更新失敗，請重試。");
    }
    setSaving(false);
  }

  if (loading) return <div className="text-gray-500 py-10 text-center">載入中…</div>;

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-1">庫存管理</h2>
      <p className="text-sm text-gray-500 mb-8">修改後網站即時更新，所有頁面自動以此數字計算可租台數。</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            兩折機（2折廣告機）— 目前可租台數
          </label>
          <input
            type="number"
            min={0}
            max={99}
            value={single}
            onChange={(e) => setSingle(Number(e.target.value))}
            className="w-32 border-2 border-gray-300 rounded-xl px-4 py-3 text-2xl font-bold text-center focus:border-gray-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            三折雙面機（3折廣告機）— 目前可租台數
          </label>
          <input
            type="number"
            min={0}
            max={99}
            value={triple}
            onChange={(e) => setTriple(Number(e.target.value))}
            className="w-32 border-2 border-gray-300 rounded-xl px-4 py-3 text-2xl font-bold text-center focus:border-gray-900 focus:outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-8 w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-700 disabled:opacity-50 transition"
      >
        {saving ? "儲存中…" : "確認更新"}
      </button>

      {msg && <p className="mt-4 text-center text-sm font-medium">{msg}</p>}

      <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
        <p className="font-semibold mb-1">使用說明</p>
        <p>每次業務或業助完成一筆租借，把這裡的數字減掉對應台數即可。</p>
        <p className="mt-1">歸還後記得加回來。</p>
      </div>
    </div>
  );
}
