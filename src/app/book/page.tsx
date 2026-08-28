"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SHOP, SERVICES, type Service } from "@/config/shop";
import { format, addDays, addMonths, startOfWeek, startOfMonth, isSameMonth, parseISO } from "date-fns";

function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function toDateStr(d: Date) {
  return format(d, "yyyy-MM-dd");
}

const DAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "var(--font-condensed)",
      fontWeight: 900,
      fontSize: 13,
      letterSpacing: "0.12em",
      color: "var(--text)",
      padding: "20px 20px 12px",
      borderBottom: "1px solid var(--border)",
    }}>
      {children}
    </p>
  );
}

function ServiceRow({ service, selected, onSelect }: {
  service: Service;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 20px",
        background: "transparent",
        border: "none",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        textAlign: "left",
        color: "var(--text)",
      }}
    >
      <div style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        border: `2px solid ${selected ? "var(--accent)" : "#444"}`,
        background: selected ? "var(--accent)" : "transparent",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--on-accent)" }} />}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>{service.name}</p>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          {service.duration < 60
            ? `${service.duration} minutes`
            : `${Math.floor(service.duration / 60)} hr${service.duration % 60 ? ` ${service.duration % 60} min` : ""}`}
        </p>
      </div>
      <p style={{ fontWeight: 700, fontSize: 17 }}>${service.price}</p>
    </button>
  );
}

function MonthCalendar({ selected, onSelect, availableDays, monthStart, onMonthChange }: {
  selected: string;
  onSelect: (d: string) => void;
  /** date -> bookable for the chosen service; null while unknown. */
  availableDays: Record<string, boolean> | null;
  /** First of the displayed month. Owned by the page so that picking a service
      with no availability this month can move the calendar to one that has some. */
  monthStart: string;
  onMonthChange: (firstOfMonth: string) => void;
}) {
  const monthDate = parseISO(monthStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Six weeks from the Sunday on or before the 1st covers every month layout.
  const gridStart = startOfWeek(monthDate, { weekStartsOn: 0 });
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const atFirstMonth = monthDate <= startOfMonth(today);

  return (
    <div style={{ padding: "16px 20px 4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button
          onClick={() => onMonthChange(toDateStr(startOfMonth(addMonths(monthDate, -1))))}
          disabled={atFirstMonth}
          aria-label="Previous month"
          style={{ background: "none", border: "none", color: atFirstMonth ? "#5C2029" : "var(--muted)", fontSize: 22, cursor: atFirstMonth ? "not-allowed" : "pointer", padding: "0 4px" }}
        >&lsaquo;</button>
        <p style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: 15, letterSpacing: "0.1em" }}>
          {format(monthDate, "MMMM yyyy").toUpperCase()}
        </p>
        <button
          onClick={() => onMonthChange(toDateStr(startOfMonth(addMonths(monthDate, 1))))}
          aria-label="Next month"
          style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 22, cursor: "pointer", padding: "0 4px" }}
        >&rsaquo;</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {DAY_ABBR.map((d) => (
          <p key={d} style={{ textAlign: "center", fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 8 }}>
            {d}
          </p>
        ))}
        {cells.map((day) => {
          const str = toDateStr(day);
          const outside = !isSameMonth(day, monthDate);
          const isPast = day < today;
          // Unknown availability stays clickable so the calendar isn't dead
          // while the first request is in flight.
          const isClosed = availableDays ? availableDays[str] === false : false;
          const isBlocked = isPast || isClosed;
          const isSelected = str === selected;
          const isToday = str === toDateStr(today);

          // Days spilling in from the neighbouring month keep the grid square
          // without inviting a click that would jump the view.
          if (outside) return <span key={str} style={{ height: 36 }} />;

          return (
            <button
              key={str}
              onClick={() => !isBlocked && onSelect(str)}
              disabled={isBlocked}
              title={isClosed && !isPast ? "Not available for this service" : undefined}
              style={{
                background: isSelected ? "var(--accent)" : "transparent",
                border: isToday && !isSelected ? "1px solid var(--accent)" : "1px solid transparent",
                opacity: isClosed && !isPast ? 0.35 : 1,
                borderRadius: "50%",
                width: 36,
                height: 36,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: isSelected ? 700 : 400,
                fontSize: 14,
                color: isSelected ? "var(--on-accent)" : isBlocked ? "#5C2029" : "var(--text)",
                cursor: isBlocked ? "not-allowed" : "pointer",
                transition: "all 0.12s",
              }}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookPage() {
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState(toDateStr(new Date()));
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [closedDay, setClosedDay] = useState(false);
  // Keyed by service so a pending response for the previous service can never
  // be shown against the current one.
  const [daysByService, setDaysByService] =
    useState<Record<string, Record<string, boolean>>>({});
  const [monthStart, setMonthStart] = useState(
    () => toDateStr(startOfMonth(new Date())));
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [shopAddress, setShopAddress] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [zelleOpen, setZelleOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  // Which days the calendar should let you click at all. Each service is
  // offered on a different set of days, so this refetches with the service
  // and whenever the calendar moves to another week. If the day currently
  // chosen isn't offered by the newly chosen service, move to the next one
  // that is rather than leaving a dead selection behind.
  useEffect(() => {
    if (!service) return;
    const id = service.id;
    let cancelled = false;
    // The grid shows six weeks from the Sunday on or before the 1st.
    const gridStart = toDateStr(startOfWeek(parseISO(monthStart), { weekStartsOn: 0 }));
    fetch(`/api/days?service=${encodeURIComponent(id)}&start=${gridStart}&days=42`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d.days) return;
        setDaysByService((prev) => ({ ...prev, [id]: { ...prev[id], ...d.days } }));
        setDate((current) => {
          if (d.days[current] !== false) return current;
          const todayStr = toDateStr(new Date());
          const next = Object.keys(d.days).sort()
            .find((day) => day >= todayStr && d.days[day]);
          if (!next) return current;
          // Bring the calendar to the month that day is in, or it lands on a
          // month where nothing looks selected.
          setMonthStart(toDateStr(startOfMonth(parseISO(next))));
          return next;
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [service, monthStart]);

  const availableDays = service ? daysByService[service.id] ?? null : null;

  // Availability depends on the service as well as the date: each one is
  // bookable in its own window, so changing either has to refetch.
  useEffect(() => {
    if (!date || !service) {
      setSlots([]);
      setClosedDay(false);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    setSlots([]);
    setTime("");
    setClosedDay(false);
    fetch(`/api/slots?date=${date}&service=${encodeURIComponent(service.id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setClosedDay(d.closed);
        setSlots(d.slots ?? []);
      })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [date, service]);

  async function submit() {
    if (!service || !time || !name.trim() || !email.trim() || !phone.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, date, time, name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      if (data.address) setShopAddress(data.address);
      if (data.phone) setShopPhone(data.phone);
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const canBook = !!service && !!time && name.trim() && email.trim() && phone.trim() && !submitting;

  if (done) {
    return (
      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "var(--on-accent)", marginBottom: 24 }}>✓</div>
        <h1 className="graffiti glow" style={{ fontSize: 56, color: "var(--accent-text)", marginBottom: 8 }}>You&apos;re In!</h1>
        <p style={{ color: "var(--muted)", marginBottom: 6, fontSize: 15 }}>Confirmation sent to your email.</p>
        <p style={{ fontSize: 15, marginBottom: 24 }}>
          <strong style={{ color: "var(--accent-text)" }}>{service?.name}</strong>{" · "}
          {format(parseISO(date), "EEE, MMM d")}{" · "}{fmt12(time)}
        </p>
        {(shopAddress || shopPhone) && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px", marginBottom: 28, textAlign: "left", maxWidth: 320, width: "100%" }}>
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "var(--accent-text)", letterSpacing: "0.08em" }}>WHERE TO GO</p>
            {shopAddress && <p style={{ fontSize: 14, marginBottom: 4, color: "var(--text)" }}>{shopAddress}</p>}
            {shopPhone && <p style={{ fontSize: 14, color: "var(--muted)" }}>{shopPhone}</p>}
          </div>
        )}
        <Link href="/" style={{ color: "var(--accent-text)" }} className="condensed font-bold underline">← Back to home</Link>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100dvh", paddingBottom: 90 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--scrim)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <Link href="/" style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", color: "var(--accent-text)", textDecoration: "none" }}>
          CANCEL
        </Link>
        <p style={{ fontFamily: "var(--font-condensed)", fontWeight: 900, fontSize: 15, letterSpacing: "0.12em" }}>BOOK APPOINTMENT</p>
        <div style={{ width: 60 }} />
      </div>

      {/* Profile card */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="graffiti" style={{ fontSize: 20, color: "var(--on-accent)", lineHeight: 1 }}>V</span>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 1 }}>{SHOP.name}</p>
          {/* The address here came from the hardcoded config placeholder, not
              the one set in /admin. The real address is shown on the
              confirmation screen, once there's a booking to go to. */}
          <p style={{ color: "var(--muted)", fontSize: 12 }}>{SHOP.tagline}</p>
        </div>
      </div>

      {/* Services */}
      <SectionHeader>SELECT SERVICES</SectionHeader>
      {SERVICES.map((s) => (
        <ServiceRow key={s.id} service={s} selected={service?.id === s.id} onSelect={() => { setService(s); setTime(""); }} />
      ))}

      {/* Date & Time */}
      <SectionHeader>SELECT DATE &amp; TIME</SectionHeader>
      <MonthCalendar
        selected={date}
        onSelect={(d) => { setDate(d); setTime(""); }}
        availableDays={availableDays}
        monthStart={monthStart}
        onMonthChange={setMonthStart}
      />

      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        {loadingSlots && <p style={{ color: "var(--muted)", fontSize: 14, textAlign: "center", padding: "12px 0" }}>Loading…</p>}
        {!loadingSlots && !service && (
          <p style={{ color: "var(--muted)", fontSize: 14, textAlign: "center", padding: "12px 0" }}>
            Pick a service to see available times
          </p>
        )}
        {!loadingSlots && service && (closedDay || slots.length === 0) && (
          <p style={{ color: "var(--muted)", fontSize: 14, textAlign: "center", padding: "12px 0" }}>
            {service.window === "off"
              ? "No off-day times this day — off-day cuts are only on days the shop is closed."
              : service.window === "after"
              ? "No after-hours times this day."
              : "No available times"}
          </p>
        )}
        {!loadingSlots && slots.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => { setTime(s); setTimeout(() => infoRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
                style={{
                  background: time === s ? "var(--accent)" : "var(--surface)",
                  color: time === s ? "var(--on-accent)" : "var(--text)",
                  border: `1px solid ${time === s ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: 6,
                  padding: "10px 6px",
                  fontWeight: time === s ? 700 : 400,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                {fmt12(s)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Your Info */}
      <div ref={infoRef}><SectionHeader>YOUR INFORMATION</SectionHeader></div>
      {[
        { label: "FULL NAME", type: "text", val: name, set: setName, ph: "John Smith", ac: "name" },
        { label: "PHONE NUMBER", type: "tel", val: phone, set: setPhone, ph: "(555) 000-0000", ac: "tel" },
        { label: "EMAIL", type: "email", val: email, set: setEmail, ph: "john@email.com", ac: "email" },
      ].map((f) => (
        <div key={f.label} style={{ borderBottom: "1px solid var(--border)", padding: "12px 20px" }}>
          <p style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 6 }}>{f.label}</p>
          <input
            type={f.type}
            placeholder={f.ph}
            value={f.val}
            onChange={(e) => f.set(e.target.value)}
            autoComplete={f.ac}
            style={{ background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 16, width: "100%", fontFamily: "var(--font-body)" }}
          />
        </div>
      ))}

      {/* Payment */}
      <SectionHeader>PAYMENT</SectionHeader>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid var(--accent)", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--on-accent)" }} />
        </div>
        <div style={{ width: 32, height: 32, background: "var(--surface-2)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💵</div>
        <p style={{ fontWeight: 600, fontSize: 16 }}>In Shop</p>
      </div>

      <div style={{ margin: "12px 20px 8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
        <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Pay at the shop — we accept:</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
            💵 Cash
          </span>
          <button onClick={() => setZelleOpen(true)} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: "var(--text)", cursor: "pointer" }}>
            💸 Zelle
          </button>
          <a href="https://cash.app/$vivek2jiggy" target="_blank" rel="noopener noreferrer" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>
            💚 Cash App
          </a>
          <a href="https://venmo.com/u/Vivek2jiggy" target="_blank" rel="noopener noreferrer" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>
            💜 Venmo
          </a>
        </div>
      </div>

      {error && <p style={{ color: "var(--danger)", fontSize: 14, padding: "8px 20px" }}>{error}</p>}

      {/* Sticky footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--scrim)", borderTop: "1px solid var(--border)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 50, backdropFilter: "blur(12px)" }}>
        <p style={{ fontWeight: 800, fontSize: 22 }}>${service?.price ?? 0}</p>
        <button
          onClick={submit}
          disabled={!canBook}
          style={{
            background: canBook ? "var(--accent)" : "var(--border)",
            color: canBook ? "var(--on-accent)" : "var(--muted)",
            border: "none",
            borderRadius: 8,
            padding: "14px 40px",
            fontFamily: "var(--font-condensed)",
            fontWeight: 900,
            fontSize: 17,
            letterSpacing: "0.08em",
            cursor: canBook ? "pointer" : "not-allowed",
            transition: "all 0.15s",
          }}
        >
          {submitting ? "BOOKING…" : "BOOK"}
        </button>
      </div>

      {/* Zelle QR Modal */}
      {zelleOpen && (
        <div
          onClick={() => setZelleOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, maxWidth: 320, width: "100%", textAlign: "center" }}
          >
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Pay with Zelle</p>
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>Scan in your banking app · Vivek Patel</p>
            <img src="/zelle-qr.png" alt="Zelle QR code" style={{ width: "100%", borderRadius: 8, background: "#fff", padding: 8 }} />
            <button onClick={() => setZelleOpen(false)} style={{ marginTop: 20, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 24px", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
