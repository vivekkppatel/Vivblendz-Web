import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendReminderEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { getShopSettings } from "@/lib/getSettings";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const settings = await getShopSettings();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("date", today)
    .eq("status", "confirmed");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = await Promise.allSettled(
    (bookings ?? []).flatMap((b) => {
      const reminderSMS = `Hey ${b.client_name}! Just a reminder — your cut at VivBlendz is today at ${b.time}. See you soon! 💈`;
      return [
        sendReminderEmail({
          clientName: b.client_name,
          clientEmail: b.client_email,
          clientPhone: b.client_phone,
          serviceName: b.service_name,
          date: format(new Date(), "EEEE, MMMM d, yyyy"),
          time: b.time,
          shopAddress: settings.address,
          shopPhone: settings.phone,
        }),
        sendSMS(b.client_phone, reminderSMS),
      ];
    })
  );

  const failures = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({
    success: true,
    sent: bookings?.length ?? 0,
    failures,
  });
}
