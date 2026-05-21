import Link from "next/link";
import { SHOP, SERVICES } from "@/config/shop";
import { getShopSettings } from "@/lib/getSettings";

export const revalidate = 0;

const DAY_ORDER = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS: Record<string, string> = {
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};

function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${ampm}` : `${hour}:${m.toString().padStart(2, "0")}${ampm}`;
}

export default async function Home() {
  const settings = await getShopSettings();
  const openDays = Object.entries(settings.hours).filter(([, v]) => v.open);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }} className="min-h-screen">

      {/* ── Nav ──────────────────────────────── */}
      <nav
        style={{ borderBottom: "1px solid var(--border)", background: "rgba(10,10,10,0.9)" }}
        className="sticky top-0 z-50 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span
            className="graffiti glow-orange"
            style={{ color: "var(--orange)", fontSize: 26 }}
          >
            {SHOP.name}
          </span>
          <div className="flex items-center gap-4">
            {SHOP.instagram && (
              <a
                href={SHOP.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--muted)" }}
                className="condensed text-sm hover:text-white transition-colors hidden sm:block"
              >
                Instagram
              </a>
            )}
            <Link
              href="/book"
              style={{ background: "var(--orange)", color: "#fff", whiteSpace: "nowrap" }}
              className="condensed font-bold text-sm px-4 py-2 rounded hover:opacity-90 transition-opacity"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-28 pb-24">
        {/* background word */}
        <div
          className="graffiti absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
          style={{
            fontSize: "clamp(100px, 18vw, 230px)",
            color: "transparent",
            WebkitTextStroke: "1px rgba(59,130,246,0.25)",
            letterSpacing: "-0.04em",
          }}
        >
          CUTZ
        </div>

        <div className="relative z-10">
          <span className="tag mb-6 inline-block">Premium Barbershop Experience</span>
          <h1
            className="graffiti glow-orange mb-4"
            style={{
              fontSize: "clamp(38px, 11vw, 160px)",
              color: "var(--orange)",
            }}
          >
            {SHOP.name}
          </h1>
          <p
            className="condensed mb-10 font-semibold"
            style={{
              fontSize: "clamp(18px, 3vw, 28px)",
              color: "var(--muted)",
              letterSpacing: "0.15em",
            }}
          >
            {SHOP.tagline}
          </p>
          <Link
            href="/book"
            style={{ background: "var(--orange)", color: "#000" }}
            className="condensed font-black text-lg px-10 py-4 rounded inline-block hover:opacity-90 transition-opacity"
          >
            Book Your Cut →
          </Link>
        </div>
      </section>

      {/* ── Services ─────────────────────────── */}
      <section
        style={{ borderTop: "1px solid var(--border)" }}
        className="max-w-6xl mx-auto px-6 py-20"
      >
        <div className="flex items-end justify-between mb-10">
          <h2 className="graffiti" style={{ fontSize: "clamp(36px, 6vw, 72px)", color: "var(--orange)" }}>
            Services
          </h2>
          <Link href="/book" className="condensed font-bold text-sm" style={{ color: "var(--orange)" }}>
            Book Now →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SERVICES.map((s) => (
            <Link
              key={s.id}
              href="/book"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                display: "block",
                padding: "20px",
                transition: "border-color 0.15s, background 0.15s",
                textDecoration: "none",
                color: "inherit",
              }}
              className="hover:border-[#ff5c00] group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="condensed font-bold text-lg text-white">{s.name}</h3>
                <span
                  className="condensed font-black text-xl"
                  style={{ color: "var(--orange)" }}
                >
                  ${s.price}
                </span>
              </div>
              <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>
                {s.description}
              </p>
              <p className="condensed mt-3" style={{ color: "var(--muted)", fontSize: 12, letterSpacing: "0.1em" }}>
                {s.duration} MIN
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Hours + Instagram ─────────────────── */}
      <section
        style={{ borderTop: "1px solid var(--border)" }}
        className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16"
      >
        {/* Hours */}
        <div>
          <h2 className="graffiti mb-8" style={{ fontSize: 48, color: "var(--orange)" }}>
            Hours
          </h2>
          <div className="space-y-3">
            {DAY_ORDER.map(day => { const info = settings.hours[day]; return (
              <div key={day} className="flex items-center justify-between">
                <span className="condensed font-semibold" style={{ color: info.open ? "var(--text)" : "var(--muted)" }}>
                  {DAY_LABELS[day]}
                </span>
                {info.open ? (
                  <span className="condensed font-bold" style={{ color: "var(--orange)" }}>
                    {fmt12(info.times[0])} – {fmt12(info.times[1])}
                  </span>
                ) : (
                  <span className="condensed" style={{ color: "var(--muted)" }}>
                    CLOSED
                  </span>
                )}
              </div>
            ); })}
          </div>
        </div>

        {/* Instagram */}
        {SHOP.instagram && (
          <div>
            <h2 className="graffiti mb-4" style={{ fontSize: 48, color: "var(--orange)" }}>
              Follow
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
              Stay up on the latest cuts, styles, and availability. Follow us on Instagram for daily drops.
            </p>
            <a
              href={SHOP.instagram}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "14px 20px",
                textDecoration: "none",
                color: "var(--text)",
                transition: "border-color 0.15s",
              }}
              className="hover:border-[#ff5c00] group"
            >
              {/* Instagram icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--orange)" }}>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
              <span className="condensed font-bold" style={{ fontSize: 15 }}>
                @{SHOP.instagram.split("instagram.com/")[1]?.split("?")[0] ?? "vivblendz.va"}
              </span>
            </a>

            {openDays.length > 0 && (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "16px 20px",
                  marginTop: 16,
                }}
              >
                <p className="condensed font-bold" style={{ color: "var(--orange)", marginBottom: 4 }}>
                  Walk-ins Welcome
                </p>
                <p style={{ color: "var(--muted)", fontSize: 13 }}>
                  Book online for guaranteed availability, or swing by during open hours.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--surface)",
          textAlign: "center",
        }}
        className="py-24 px-6"
      >
        <h2
          className="graffiti glow-orange mb-4"
          style={{ fontSize: "clamp(40px, 8vw, 96px)", color: "var(--orange)" }}
        >
          Fresh Cut?
        </h2>
        <p className="condensed mb-8" style={{ color: "var(--muted)", fontSize: 18 }}>
          Book online in under 60 seconds. No payment needed.
        </p>
        <Link
          href="/book"
          style={{ background: "var(--orange)", color: "#000" }}
          className="condensed font-black text-lg px-12 py-4 rounded inline-block hover:opacity-90 transition-opacity"
        >
          Book Now →
        </Link>
      </section>

      {/* ── Footer ───────────────────────────── */}
      <footer
        style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}
        className="condensed text-center py-6 text-xs"
      >
        © {new Date().getFullYear()} {SHOP.name}. All rights reserved.
        {SHOP.instagram && (
          <>
            {" "}·{" "}
            <a href={SHOP.instagram} style={{ color: "var(--muted)" }} className="hover:text-white transition-colors">
              Instagram
            </a>
          </>
        )}
      </footer>
    </div>
  );
}
