import { cookies } from "next/headers";
import { supabase, type Booking } from "@/lib/supabase";
import { getShopSettings } from "@/lib/getSettings";
import { SHOP, ADMIN_PASSWORD } from "@/config/shop";
import { format, parseISO, isToday, isFuture } from "date-fns";
import AdminLoginForm from "./LoginForm";
import SettingsForm from "./SettingsForm";

async function getBookings(): Promise<Booking[]> {
  try {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "confirmed")
      .order("date", { ascending: true })
      .order("time", { ascending: true });
    return (data as Booking[]) ?? [];
  } catch {
    return [];
  }
}

function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = cookieStore.get("admin_auth")?.value === ADMIN_PASSWORD;

  if (!authed) {
    return <AdminLoginForm />;
  }

  const [bookings, settings] = await Promise.all([getBookings(), getShopSettings()]);
  const today = bookings.filter((b) => isToday(parseISO(b.date)));
  const upcoming = bookings.filter((b) => {
    const d = parseISO(b.date);
    return isFuture(d) && !isToday(d);
  });

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
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Today", count: today.length },
            { label: "Upcoming", count: upcoming.length },
            { label: "Total", count: bookings.length },
          ].map((s) => (
            <div
              key={s.label}
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              className="rounded-lg p-6 text-center"
            >
              <p className="text-4xl font-black mb-1" style={{ color: "var(--orange)" }}>
                {s.count}
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
            <BookingTable bookings={today} />
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
            <BookingTable bookings={upcoming} />
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

function BookingTable({ bookings }: { bookings: Booking[] }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
      {bookings.map((b, i) => (
        <div
          key={b.id}
          style={{
            background: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
            borderBottom: i < bookings.length - 1 ? "1px solid var(--border)" : "none",
          }}
          className="p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
        >
          <div className="flex gap-4 items-center min-w-[200px]">
            <div>
              <p className="font-bold text-sm">{format(parseISO(b.date), "EEE, MMM d")}</p>
              <p style={{ color: "var(--orange)" }} className="text-sm font-semibold">
                {fmt12(b.time)}
              </p>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{b.client_name}</p>
            <p style={{ color: "var(--muted)" }} className="text-xs">
              {b.client_phone} &nbsp;·&nbsp; {b.client_email}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{b.service_name}</p>
            <p style={{ color: "var(--muted)" }} className="text-xs">
              {b.duration_minutes} min
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
