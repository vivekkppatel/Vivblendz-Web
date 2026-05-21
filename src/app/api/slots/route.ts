import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateSlots, isShopOpen } from "@/lib/slots";
import { getShopSettings } from "@/lib/getSettings";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const settings = await getShopSettings();

  if (!isShopOpen(date, settings.hours)) {
    return NextResponse.json({ slots: [], closed: true });
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("time, duration_minutes")
    .eq("date", date)
    .eq("status", "confirmed");

  if (error) {
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 });
  }

  // Expand booked slots to block the full duration
  const bookedTimes = new Set<string>();
  for (const b of data ?? []) {
    const [h, m] = b.time.split(":").map(Number);
    const start = h * 60 + m;
    const slots = Math.ceil(b.duration_minutes / 30);
    for (let i = 0; i < slots; i++) {
      const mins = start + i * 30;
      const hh = Math.floor(mins / 60).toString().padStart(2, "0");
      const mm = (mins % 60).toString().padStart(2, "0");
      bookedTimes.add(`${hh}:${mm}`);
    }
  }

  const slots = generateSlots(date, Array.from(bookedTimes), settings.hours);
  return NextResponse.json({ slots, closed: false });
}
