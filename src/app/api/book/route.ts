import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendOwnerNotification, sendClientConfirmation } from "@/lib/email";
import { addToGoogleCalendar } from "@/lib/calendar";
import { getShopSettings } from "@/lib/getSettings";
import { serviceById } from "@/config/shop";
import { blockedStarts, generateSlots, windowFor } from "@/lib/slots";
import { format, parseISO } from "date-fns";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { serviceId, date, time, name, email, phone } = body as Record<string, string>;

  if (!serviceId || !date || !time || !name || !email || !phone) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const service = serviceById(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "Invalid date or time format" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const settings = await getShopSettings();

  // Re-check availability server-side. The browser picked this slot from a
  // list that may be seconds out of date, and nothing stops a request being
  // sent without going through the page at all.
  const window = windowFor(date, service.window, settings);
  if (!window) {
    return NextResponse.json(
      { error: "That service isn't offered on that day." },
      { status: 409 }
    );
  }

  const { data: sameDay, error: lookupError } = await supabase
    .from("bookings")
    .select("time, duration_minutes")
    .eq("date", date)
    .eq("status", "confirmed");

  if (lookupError) {
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 });
  }

  // Distinguish "not a time we offer for this service" from "someone else
  // got there first" — they need different things from the client.
  if (!generateSlots(date, [], window).includes(time)) {
    return NextResponse.json(
      { error: `${service.name} isn't available at that time. Please pick another.` },
      { status: 409 }
    );
  }

  const taken = (sameDay ?? []).flatMap((b) => blockedStarts(b.time, b.duration_minutes));
  if (!generateSlots(date, taken, window).includes(time)) {
    return NextResponse.json(
      { error: "Sorry — that time was just taken. Please pick another." },
      { status: 409 }
    );
  }

  const { error: insertError } = await supabase.from("bookings").insert({
    service_id: service.id,
    service_name: service.name,
    date,
    time,
    duration_minutes: service.duration,
    client_name: name.trim(),
    client_email: email.trim().toLowerCase(),
    client_phone: phone.trim(),
    status: "confirmed",
  });

  if (insertError) {
    // 23505 is Postgres' unique-violation code. The partial unique index on
    // (date, time) for confirmed bookings is what actually settles a race
    // between two people confirming the same slot at the same moment.
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "Sorry — that time was just taken. Please pick another." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
  }

  const formattedDate = format(parseISO(date), "EEEE, MMMM d, yyyy");
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  const formattedTime = `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;

  const emailData = {
    clientName: name.trim(),
    clientEmail: email.trim().toLowerCase(),
    clientPhone: phone.trim(),
    serviceName: service.name,
    date: formattedDate,
    time: formattedTime,
    shopAddress: settings.address,
    shopPhone: settings.phone,
  };

  const calendarData = {
    serviceName: service.name,
    clientName: name.trim(),
    clientPhone: phone.trim(),
    date,
    time,
    durationMinutes: service.duration,
  };

  // Run all async side effects in parallel; don't block on failures
  const [calendarLink] = await Promise.allSettled([
    addToGoogleCalendar(calendarData),
    sendOwnerNotification({ ...emailData, calendarData }),
    sendClientConfirmation(emailData),
  ]).then((results) => results.map((r) => (r.status === "fulfilled" ? r.value : null)));

  return NextResponse.json({ success: true, calendarLink, address: settings.address, phone: settings.phone });
}
