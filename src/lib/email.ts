import { Resend } from "resend";
import { SHOP } from "@/config/shop";
import { googleCalendarLink, type CalendarEventData } from "@/lib/calendar";

const resend = new Resend(process.env.RESEND_API_KEY);

export type BookingEmailData = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  date: string;
  time: string;
  shopAddress?: string;
  shopPhone?: string;
  calendarData?: CalendarEventData;
};

export async function sendOwnerNotification(data: BookingEmailData) {
  const calLink = data.calendarData ? googleCalendarLink(data.calendarData) : null;

  await resend.emails.send({
    from: `${SHOP.name} Bookings <bookings@resend.dev>`,
    to: SHOP.ownerEmail,
    subject: `New Booking — ${data.serviceName} on ${data.date}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0d0d0d;color:#f0ece4">
        <h1 style="font-size:22px;font-weight:900;color:#c9a84c;margin:0 0 4px;letter-spacing:0.08em">${SHOP.name}</h1>
        <p style="margin:0 0 24px;color:#8a8480;font-size:13px">New appointment booked</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#8a8480;font-size:13px;width:110px">Client</td><td style="padding:8px 0;font-weight:600">${data.clientName}</td></tr>
          <tr><td style="padding:8px 0;color:#8a8480;font-size:13px">Phone</td><td style="padding:8px 0">${data.clientPhone}</td></tr>
          <tr><td style="padding:8px 0;color:#8a8480;font-size:13px">Email</td><td style="padding:8px 0">${data.clientEmail}</td></tr>
          <tr><td style="padding:8px 0;color:#8a8480;font-size:13px">Service</td><td style="padding:8px 0;font-weight:600">${data.serviceName}</td></tr>
          <tr><td style="padding:8px 0;color:#8a8480;font-size:13px">Date</td><td style="padding:8px 0;font-weight:600">${data.date}</td></tr>
          <tr><td style="padding:8px 0;color:#8a8480;font-size:13px">Time</td><td style="padding:8px 0;font-weight:600">${data.time}</td></tr>
        </table>
        ${calLink ? `
        <div style="margin-top:24px">
          <a href="${calLink}" style="display:inline-block;background:#c9a84c;color:#000;padding:12px 20px;border-radius:6px;font-weight:700;font-size:13px;text-decoration:none;letter-spacing:0.06em">
            + Add to Google Calendar
          </a>
        </div>` : ""}
      </div>
    `,
  });
}

export async function sendReminderEmail(data: BookingEmailData) {
  await resend.emails.send({
    from: `${SHOP.name} <bookings@resend.dev>`,
    to: data.clientEmail,
    subject: `Reminder: Your ${SHOP.name} appointment is today`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0d0d0d;color:#f0ece4">
        <h1 style="font-size:26px;font-weight:900;letter-spacing:-0.02em;margin:0 0 4px;color:#ff5c00">${SHOP.name}</h1>
        <p style="margin:0 0 24px;color:#8a8480;font-size:13px">You've got a cut today. Don't be late.</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #2a2a2a;border-radius:8px;overflow:hidden">
          <tr style="background:#161616">
            <td style="padding:12px 16px;color:#8a8480;font-size:13px;width:100px">Service</td>
            <td style="padding:12px 16px;font-weight:600">${data.serviceName}</td>
          </tr>
          <tr style="background:#1a1a1a">
            <td style="padding:12px 16px;color:#8a8480;font-size:13px">Time</td>
            <td style="padding:12px 16px;font-weight:600;color:#ff5c00">${data.time}</td>
          </tr>
        </table>
        <div style="margin-top:24px;background:#161616;border:1px solid #2a2a2a;border-radius:8px;padding:16px">
          <p style="margin:0 0 6px;font-weight:700;font-size:13px;color:#f0ece4">Where to go</p>
          <p style="margin:0 0 4px;color:#8a8480;font-size:13px">${data.shopAddress ?? SHOP.address}</p>
          <p style="margin:0;font-size:13px"><a href="tel:${data.shopPhone ?? SHOP.phone}" style="color:#ff5c00">${data.shopPhone ?? SHOP.phone}</a></p>
        </div>
      </div>
    `,
  });
}

export async function sendClientConfirmation(data: BookingEmailData) {
  await resend.emails.send({
    from: `${SHOP.name} <bookings@resend.dev>`,
    to: data.clientEmail,
    subject: `Your appointment at ${SHOP.name} is confirmed`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0d0d0d;color:#f0ece4">
        <h1 style="font-size:26px;font-weight:900;letter-spacing:-0.02em;margin:0 0 4px;color:#c9a84c">${SHOP.name}</h1>
        <p style="margin:0 0 24px;color:#8a8480;font-size:13px">Your appointment is confirmed.</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #2a2a2a;border-radius:8px;overflow:hidden">
          <tr style="background:#161616">
            <td style="padding:12px 16px;color:#8a8480;font-size:13px;width:100px">Service</td>
            <td style="padding:12px 16px;font-weight:600">${data.serviceName}</td>
          </tr>
          <tr style="background:#1a1a1a">
            <td style="padding:12px 16px;color:#8a8480;font-size:13px">Date</td>
            <td style="padding:12px 16px;font-weight:600">${data.date}</td>
          </tr>
          <tr style="background:#161616">
            <td style="padding:12px 16px;color:#8a8480;font-size:13px">Time</td>
            <td style="padding:12px 16px;font-weight:600">${data.time}</td>
          </tr>
        </table>
        <div style="margin-top:24px;background:#161616;border:1px solid #2a2a2a;border-radius:8px;padding:16px">
          <p style="margin:0 0 6px;font-weight:700;font-size:13px;color:#f0ece4">Where to go</p>
          <p style="margin:0 0 4px;color:#8a8480;font-size:13px">${data.shopAddress ?? SHOP.address}</p>
          <p style="margin:0;font-size:13px"><a href="tel:${data.shopPhone ?? SHOP.phone}" style="color:#c9a84c">${data.shopPhone ?? SHOP.phone}</a></p>
        </div>
      </div>
    `,
  });
}
