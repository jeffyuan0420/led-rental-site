"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: sbError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (sbError) {
      setError("帳號或密碼錯誤，請再試一次");
    } else {
      router.push("/admin/bookings");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleLogin}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-5"
    >
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
          placeholder="admin@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          密碼
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-gray-900 focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl text-sm transition-colors"
      >
        {loading ? "登入中..." : "登入"}
      </button>
    </form>
  );
}
