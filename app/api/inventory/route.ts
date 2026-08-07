import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { isAllowedAdminEmail } from "@/lib/admin-auth";

export async function GET() {
  const sb = createServerSupabase();
  const { data, error } = await sb
    .from("inventory")
    .select("single_stock, triple_stock")
    .eq("id", 1)
    .single();

  if (error || !data) {
    // Fallback to hardcoded defaults if table doesn't exist yet
    return NextResponse.json({ single: 20, triple: 2 });
  }

  return NextResponse.json({ single: data.single_stock, triple: data.triple_stock });
}

export async function PATCH(req: Request) {
  const sb = createServerSupabase();

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }
  const { data: userData, error: userError } = await sb.auth.getUser(token);
  if (userError || !isAllowedAdminEmail(userData?.user?.email)) {
    return NextResponse.json({ error: "無權限" }, { status: 403 });
  }

  const body = await req.json();
  const { single, triple } = body as { single: number; triple: number };

  if (typeof single !== "number" || typeof triple !== "number") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { error } = await sb
    .from("inventory")
    .update({ single_stock: single, triple_stock: triple, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, single, triple });
}
