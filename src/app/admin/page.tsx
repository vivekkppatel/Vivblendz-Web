import { cookies } from "next/headers";
import { supabase, type Booking } from "@/lib/supabase";
import { getShopSettings } from "@/lib/getSettings";
import { SHOP, ADMIN_PASSWORD, SERVICES } from "@/config/shop";
import { parseISO, isToday, isFuture } from "date-fns";
import AdminLoginForm from "./LoginForm";
import SettingsForm from "./SettingsForm";
import BookingList from "./BookingList";

async function getBookings(): Promise<Booking[]> {
  try {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .in("status", ["confirmed", "completed"])
      .order("date", { ascending: true })
      .order("time", { ascending: true });
    return (data as Booking[]) ?? [];
  } catch {
    return [];
  }
}

function getPrice(serviceId: string): number {
  return SERVICES.find(s => s.id === serviceId)?.price ?? 0;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = cookieStore.get("admin_auth")?.value === ADMIN_PASSWORD;

  if (!authed) {
    return <AdminLoginForm />;
  }

  const [bookings, settings] = await Promise.all([getBookings(), getShopSettings()]);

  const today = bookings.filter(b => b.status === "confirmed" && isToday(parseISO(b.date)));
  const upcoming = bookings.filter(b => {
    const d = parseISO(b.date);
    return b.status === "confirmed" && isFuture(d) && !isToday(d);
  });
  const revenue = bookings
    .filter(b => b.status === "completed")
    .reduce((sum, b) => sum + (b.amount_paid ?? getPrice(b.service_id)), 0);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }} className="min-h-screen">
      <nav
        style={{ borderBottom: "1px solid var(--border)", background: "rgba(13,13,13,0.9)" }}
        className="sticky top-0 z-10"
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span style={{ color: "var(--orange)" }} className="font-black text-xl uppercase tracking-widest">
            {SHOP.name} &mdash; Admin
          </span>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              style={{ color: "var(--muted)", fontSize: 13 }}
              className="hover:text-white transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: "Today", count: today.length, prefix: "" },
            { label: "Upcoming", count: upcoming.length, prefix: "" },
            { label: "Total", count: bookings.length, prefix: "" },
            { label: "Revenue", count: revenue, prefix: "$" },
          ].map((s) => (
            <div
              key={s.label}
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              className="rounded-lg p-6 text-center"
            >
              <p className="text-3xl font-black mb-1" style={{ color: "var(--orange)" }}>
                {s.prefix}{s.count}
              </p>
              <p style={{ color: "var(--muted)" }} className="text-xs uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Today */}
        {today.length > 0 && (
          <section className="mb-10">
            <h2
              style={{ color: "var(--orange)", letterSpacing: "0.15em" }}
              className="text-xs uppercase font-semibold mb-4"
            >
              Today
            </h2>
            <BookingList initialBookings={today} />
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="mb-10">
            <h2
              style={{ color: "var(--muted)", letterSpacing: "0.15em" }}
              className="text-xs uppercase font-semibold mb-4"
            >
              Upcoming
            </h2>
            <BookingList initialBookings={upcoming} />
          </section>
        )}

        {bookings.length === 0 && (
          <p style={{ color: "var(--muted)" }} className="text-center py-20">
            No bookings yet.
          </p>
        )}

        {/* Settings */}
        <SettingsForm
          initialAddress={settings.address}
          initialPhone={settings.phone}
          initialHours={settings.hours}
        />
      </div>
    </div>
  );
}
