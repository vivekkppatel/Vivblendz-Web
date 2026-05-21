import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables."
  );
}

export const supabase = createClient(url, key);

export type Booking = {
  id: string;
  created_at: string;
  service_id: string;
  service_name: string;
  date: string;
  time: string;
  duration_minutes: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  status: "confirmed" | "cancelled" | "completed";
  amount_paid: number | null;
};