import { HOURS, SLOT_DURATION_MINUTES, type BookingWindow } from "@/config/shop";
import { format, addMinutes, parseISO, isAfter } from "date-fns";
import type { ShopSettings, WeekSchedule } from "./getSettings";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function dayNameOf(dateStr: string): string {
  return DAYS[parseISO(dateStr).getDay()];
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isShopOpen(dateStr: string, hours?: WeekSchedule): boolean {
  const h = hours ?? (HOURS as WeekSchedule);
  return h[dayNameOf(dateStr)]?.open ?? false;
}

/**
 * The [start, end] window a service can be booked in on a given date, or null
 * when that service isn't offered that day.
 *
 *  regular — the day's normal hours.
 *  after   — from the normal closing time to the after-hours cutoff, on days
 *            the shop is open. Empty when the shop closes at or after the
 *            cutoff, since there is no time left to offer.
 *  off     — the off-day schedule, and only on days the shop is closed, so an
 *            off-day booking can never overlap a normal working day.
 */
export function windowFor(
  dateStr: string,
  bookingWindow: BookingWindow,
  settings: Pick<ShopSettings, "hours" | "offDayHours" | "afterHoursEnd" | "afterHoursEnabled">
): [string, string] | null {
  const day = dayNameOf(dateStr);
  const regular = settings.hours[day];

  if (bookingWindow === "regular") {
    return regular?.open ? regular.times : null;
  }

  if (bookingWindow === "after") {
    if (!settings.afterHoursEnabled || !regular?.open) return null;
    const close = regular.times[1];
    if (toMinutes(settings.afterHoursEnd) <= toMinutes(close)) return null;
    return [close, settings.afterHoursEnd];
  }

  // off-day: only on days the shop is not normally open
  if (regular?.open) return null;
  const offDay = settings.offDayHours[day];
  return offDay?.open ? offDay.times : null;
}

/**
 * Bookable start times inside `window`, dropping any that are already taken
 * or in the past.
 */
export function generateSlots(
  dateStr: string,
  bookedSlots: string[],
  window: [string, string] | null
): string[] {
  if (!window) return [];

  const date = parseISO(dateStr);
  const [startH, startM] = window[0].split(":").map(Number);
  const [endH, endM] = window[1].split(":").map(Number);

  const startDate = new Date(date);
  startDate.setHours(startH, startM, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(endH, endM, 0, 0);

  const taken = new Set(bookedSlots);
  const slots: string[] = [];
  const now = new Date();
  let current = startDate;

  // A slot only fits if the whole appointment ends by the closing time.
  while (isAfter(endDate, addMinutes(current, SLOT_DURATION_MINUTES - 1))) {
    const slotStr = format(current, "HH:mm");
    if (!isAfter(now, current) && !taken.has(slotStr)) {
      slots.push(slotStr);
    }
    current = addMinutes(current, SLOT_DURATION_MINUTES);
  }

  return slots;
}

/**
 * Every start time an existing booking occupies, so overlapping starts are
 * blocked for appointments longer than one slot.
 */
export function blockedStarts(time: string, durationMinutes: number): string[] {
  const count = slotsNeeded(durationMinutes);
  const start = toMinutes(time);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const mins = start + i * SLOT_DURATION_MINUTES;
    const hh = Math.floor(mins / 60).toString().padStart(2, "0");
    const mm = (mins % 60).toString().padStart(2, "0");
    out.push(`${hh}:${mm}`);
  }
  return out;
}

export function formatSlot(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0
    ? `${hour}:00 ${ampm}`
    : `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/** How many slots a service of this length occupies. */
export function slotsNeeded(durationMinutes: number): number {
  return Math.ceil(durationMinutes / SLOT_DURATION_MINUTES);
}
