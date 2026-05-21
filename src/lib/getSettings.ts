import { supabase } from "./supabase";
import { HOURS, SHOP } from "@/config/shop";

export type DaySchedule = { open: boolean; times: [string, string] };
export type WeekSchedule = Record<string, DaySchedule>;

export type ShopSettings = {
  address: string;
  phone: string;
  hours: WeekSchedule;
};

export async function getShopSettings(): Promise<ShopSettings> {
  if (!supabase) {
    return { address: SHOP.address, phone: SHOP.phone, hours: HOURS as WeekSchedule };
  }
  try {
    const { data } = await supabase
      .from("shop_settings")
      .select("address, phone, hours")
      .eq("id", 1)
      .single();
    if (data) return data as ShopSettings;
  } catch {}
  return { address: SHOP.address, phone: SHOP.phone, hours: HOURS as WeekSchedule };
}
