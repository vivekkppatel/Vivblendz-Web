import { supabase } from "./supabase";
import {
  HOURS,
  SHOP,
  DEFAULT_AFTER_HOURS_END,
  DEFAULT_OFF_DAY_HOURS,
  type DaySchedule,
  type WeekSchedule,
} from "@/config/shop";

export type { DaySchedule, WeekSchedule };

export type ShopSettings = {
  address: string;
  phone: string;
  /** Normal working hours. */
  hours: WeekSchedule;
  /** Availability on days `hours` is closed, for off-day bookings. */
  offDayHours: WeekSchedule;
  /** How late after-hours bookings may run, 24-hour time. */
  afterHoursEnd: string;
  /** Whether after-hours bookings are offered at all. */
  afterHoursEnabled: boolean;
};

const FALLBACK: ShopSettings = {
  address: SHOP.address,
  phone: SHOP.phone,
  hours: HOURS as WeekSchedule,
  offDayHours: DEFAULT_OFF_DAY_HOURS,
  afterHoursEnd: DEFAULT_AFTER_HOURS_END,
  afterHoursEnabled: true,
};

/** Row shape in Supabase; the extra columns may be absent on older databases. */
type SettingsRow = {
  address: string | null;
  phone: string | null;
  hours: WeekSchedule | null;
  off_day_hours: WeekSchedule | null;
  after_hours_end: string | null;
  after_hours_enabled: boolean | null;
};

export async function getShopSettings(): Promise<ShopSettings> {
  try {
    const { data } = await supabase
      .from("shop_settings")
      .select("address, phone, hours, off_day_hours, after_hours_end, after_hours_enabled")
      .eq("id", 1)
      .single();

    if (!data) return FALLBACK;
    const row = data as SettingsRow;

    return {
      address: row.address ?? FALLBACK.address,
      phone: row.phone ?? FALLBACK.phone,
      hours: row.hours ?? FALLBACK.hours,
      offDayHours: row.off_day_hours ?? FALLBACK.offDayHours,
      afterHoursEnd: row.after_hours_end ?? FALLBACK.afterHoursEnd,
      afterHoursEnabled: row.after_hours_enabled ?? FALLBACK.afterHoursEnabled,
    };
  } catch {
    return FALLBACK;
  }
}
