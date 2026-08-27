import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabase";

async function checkAuth() {
  return isAdminAuthed();
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("shop_settings")
    .select("address, phone, hours, off_day_hours, after_hours_end, after_hours_enabled")
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

  if (typeof body.afterHoursEnd === "string" && !/^\d{2}:\d{2}$/.test(body.afterHoursEnd)) {
    return NextResponse.json({ error: "Invalid after-hours time" }, { status: 400 });
  }

  const { error } = await supabase.from("shop_settings").upsert({
    id: 1,
    address: body.address,
    phone: body.phone,
    hours: body.hours,
    off_day_hours: body.offDayHours,
    after_hours_end: body.afterHoursEnd,
    after_hours_enabled: body.afterHoursEnabled,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
