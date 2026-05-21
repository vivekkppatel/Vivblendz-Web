import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_PASSWORD } from "@/config/shop";
import { supabase } from "@/lib/supabase";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_auth")?.value === ADMIN_PASSWORD;
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("shop_settings")
    .select("address, phone, hours")
    .eq("id", 1)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { error } = await supabase
    .from("shop_settings")
    .upsert({ id: 1, address: body.address, phone: body.phone, hours: body.hours });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
