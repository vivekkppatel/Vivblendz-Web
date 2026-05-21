import { HOURS, SLOT_DURATION_MINUTES } from "@/config/shop";
import { format, addMinutes, parseISO, isAfter } from "date-fns";
import type { WeekSchedule } from "./getSettings";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function isShopOpen(dateStr: string, hours?: WeekSchedule): boolean {
  const date = parseISO(dateStr);
  const dayName = DAYS[date.getDay()];
  const h = hours ?? (HOURS as WeekSchedule);
  return h[dayName]?.open ?? false;
}

export function generateSlots(dateStr: string, bookedSlots: string[], hours?: WeekSchedule): string[] {
  const date = parseISO(dateStr);
  const dayName = DAYS[date.getDay()];
  const h = hours ?? (HOURS as WeekSchedule);
  const dayHours = h[dayName];

  if (!dayHours?.open) return [];

  const [startH, startM] = dayHours.times[0].split(":").map(Number);
  const [endH, endM] = dayHours.times[1].split(":").map(Number);

  const startDate = new Date(date);
  startDate.setHours(startH, startM, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(endH, endM, 0, 0);

  const slots: string[] = [];
  let current = startDate;
  const now = new Date();

  while (isAfter(endDate, addMinutes(current, SLOT_DURATION_MINUTES - 1))) {
    const slotStr = format(current, "HH:mm");
    // Don't show past slots for today
    if (!isAfter(now, current)) {
      if (!bookedSlots.includes(slotStr)) {
        slots.push(slotStr);
      }
    }
    current = addMinutes(current, SLOT_DURATION_MINUTES);
  }

  return slots;
}

export function formatSlot(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0
    ? `${hour}:00 ${ampm}`
    : `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/** Returns how many 30-min slots a service needs (rounded up) */
export function slotsNeeded(durationMinutes: number): number {
  return Math.ceil(durationMinutes / SLOT_DURATION_MINUTES);
}
