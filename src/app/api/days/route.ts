import { NextRequest, NextResponse } from "next/server";
import { windowFor } from "@/lib/slots";
import { getShopSettings } from "@/lib/getSettings";
import { serviceById, SERVICES } from "@/config/shop";
import { addDays, format, parseISO } from "date-fns";

/**
 * Which dates a service can be booked on, so the calendar can grey out the
 * rest instead of letting someone pick a day and then telling them no.
 *
 * Availability here is schedule-level: it says the shop offers this service
 * that day, not that a slot is still free. /api/slots answers that.
 */
export async function GET(req: NextRequest) {
  const start = req.nextUrl.searchParams.get("start");
  const serviceId = req.nextUrl.searchParams.get("service") ?? SERVICES[0].id;
  const count = Math.min(Number(req.nextUrl.searchParams.get("days") ?? 14), 60);

  if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
  }

  const service = serviceById(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }

  const settings = await getShopSettings();
  const from = parseISO(start);
  const days: Record<string, boolean> = {};

  for (let i = 0; i < count; i++) {
    const date = format(addDays(from, i), "yyyy-MM-dd");
    days[date] = windowFor(date, service.window, settings) !== null;
  }

  return NextResponse.json({ days });
}
