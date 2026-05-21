import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendOwnerNotification, sendClientConfirmation } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { addToGoogleCalendar } from "@/lib/calendar";
import { getShopSettings } from "@/lib/getSettings";
import { SERVICES } from "@/config/shop";
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

  const service = SERVICES.find((s) => s.id === serviceId);
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

  const confirmationSMS = `Hey ${name.trim()}! Your ${service.name} at VivBlendz is confirmed for ${formattedDate} at ${formattedTime}. See you then! 💈`;

  // Run all async side effects in parallel; don't block on failures
  const [calendarLink] = await Promise.allSettled([
    addToGoogleCalendar(calendarData),
    sendOwnerNotification({ ...emailData, calendarData }),
    sendClientConfirmation(emailData),
    sendSMS(phone.trim(), confirmationSMS),
  ]).then((results) => results.map((r) => (r.status === "fulfilled" ? r.value : null)));

  return NextResponse.json({ success: true, calendarLink, address: settings.address, phone: settings.phone });
}
