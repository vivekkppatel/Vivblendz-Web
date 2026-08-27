import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateSlots, windowFor, blockedStarts } from "@/lib/slots";
import { getShopSettings } from "@/lib/getSettings";
import { serviceById, SERVICES } from "@/config/shop";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const serviceId = req.nextUrl.searchParams.get("service") ?? SERVICES[0].id;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const service = serviceById(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }

  const settings = await getShopSettings();
  const window = windowFor(date, service.window, settings);

  // No window means this service isn't offered on this date at all.
  if (!window) {
    return NextResponse.json({ slots: [], closed: true });
  }

  // Bookings of every service compete for the same chair, so all of them
  // block, not just the ones in this window.
  const { data, error } = await supabase
    .from("bookings")
    .select("time, duration_minutes")
    .eq("date", date)
    .eq("status", "confirmed");

  if (error) {
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 });
  }

  const taken = (data ?? []).flatMap((b) => blockedStarts(b.time, b.duration_minutes));
  const slots = generateSlots(date, taken, window);

  return NextResponse.json({ slots, closed: false });
}
