import { google } from "googleapis";
import { format, parseISO, addMinutes } from "date-fns";

export type CalendarEventData = {
  serviceName: string;
  clientName: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
};

/** Auto-add booking to your Google Calendar via service account */
export async function addToGoogleCalendar(data: CalendarEventData): Promise<string | null> {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!key || !calendarId) return null;

  try {
    const credentials = JSON.parse(key);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    const startDate = parseISO(`${data.date}T${data.time}:00`);
    const endDate = addMinutes(startDate, data.durationMinutes);

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${data.serviceName} — ${data.clientName}`,
        description: `Phone: ${data.clientPhone}`,
        start: { dateTime: startDate.toISOString() },
        end: { dateTime: endDate.toISOString() },
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: 30 }],
        },
      },
    });

    return event.data.htmlLink ?? null;
  } catch {
    return null;
  }
}

/** Generate a one-click Google Calendar event link */
export function googleCalendarLink(data: CalendarEventData): string {
  const startDate = parseISO(`${data.date}T${data.time}:00`);
  const endDate = addMinutes(startDate, data.durationMinutes);

  const fmt = (d: Date) => format(d, "yyyyMMdd'T'HHmmss");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${data.serviceName} — ${data.clientName}`,
    details: `Phone: ${data.clientPhone}`,
    dates: `${fmt(startDate)}/${fmt(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
