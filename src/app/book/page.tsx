"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SHOP, SERVICES, type Service } from "@/config/shop";
import { format, addDays, startOfWeek, parseISO } from "date-fns";

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
        border: `2px solid ${selected ? "var(--orange)" : "#444"}`,
        background: selected ? "var(--orange)" : "transparent",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#000" }} />}
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

function WeekCalendar({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div style={{ padding: "16px 20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button
          onClick={() => setWeekStart((w) => addDays(w, -7))}
          disabled={weekStart <= today}
          style={{ background: "none", border: "none", color: weekStart <= today ? "#333" : "var(--muted)", fontSize: 22, cursor: weekStart <= today ? "not-allowed" : "pointer", padding: "0 4px" }}
        >‹</button>
        <p style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: 15, letterSpacing: "0.1em" }}>
          {format(weekStart, "MMMM yyyy").toUpperCase()}
        </p>
        <button
          onClick={() => setWeekStart((w) => addDays(w, 7))}
          style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 22, cursor: "pointer", padding: "0 4px" }}
        >›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {DAY_ABBR.map((d) => (
          <p key={d} style={{ textAlign: "center", fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 8 }}>
            {d}
          </p>
        ))}
        {days.map((day) => {
          const str = toDateStr(day);
          const isPast = day < today;
          const isSelected = str === selected;
          const isToday = str === toDateStr(today);
          return (
            <button
              key={str}
              onClick={() => !isPast && onSelect(str)}
              disabled={isPast}
              style={{
                background: isSelected ? "var(--orange)" : "transparent",
                border: isToday && !isSelected ? "1px solid var(--orange)" : "1px solid transparent",
                borderRadius: "50%",
                width: 36,
                height: 36,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: isSelected ? 700 : 400,
                fontSize: 14,
                color: isSelected ? "#000" : isPast ? "#333" : "var(--text)",
                cursor: isPast ? "not-allowed" : "pointer",
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

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setSlots([]);
    setTime("");
    setClosedDay(false);
    fetch(`/api/slots?date=${date}`)
      .then((r) => r.json())
      .then((d) => { setClosedDay(d.closed); setSlots(d.slots ?? []); })
      .finally(() => setLoadingSlots(false));
  }, [date]);

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
        <div style={{ width: 72, height: 72, background: "var(--orange)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#000", marginBottom: 24 }}>✓</div>
        <h1 className="graffiti glow-orange" style={{ fontSize: 56, color: "var(--orange)", marginBottom: 8 }}>You&apos;re In!</h1>
        <p style={{ color: "var(--muted)", marginBottom: 6, fontSize: 15 }}>Confirmation sent to your email.</p>
        <p style={{ fontSize: 15, marginBottom: 24 }}>
          <strong style={{ color: "var(--orange)" }}>{service?.name}</strong>{" · "}
          {format(parseISO(date), "EEE, MMM d")}{" · "}{fmt12(time)}
        </p>
        {(shopAddress || shopPhone) && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px", marginBottom: 28, textAlign: "left", maxWidth: 320, width: "100%" }}>
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "var(--orange)", letterSpacing: "0.08em" }}>WHERE TO GO</p>
            {shopAddress && <p style={{ fontSize: 14, marginBottom: 4, color: "var(--text)" }}>{shopAddress}</p>}
            {shopPhone && <p style={{ fontSize: 14, color: "var(--muted)" }}>{shopPhone}</p>}
          </div>
        )}
        <Link href="/" style={{ color: "var(--orange)" }} className="condensed font-bold underline">← Back to home</Link>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100dvh", paddingBottom: 90 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "rgba(10,10,10,0.96)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <Link href="/" style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", color: "var(--orange)", textDecoration: "none" }}>
          CANCEL
        </Link>
        <p style={{ fontFamily: "var(--font-condensed)", fontWeight: 900, fontSize: 15, letterSpacing: "0.12em" }}>BOOK APPOINTMENT</p>
        <div style={{ width: 60 }} />
      </div>

      {/* Profile card */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="graffiti" style={{ fontSize: 20, color: "#000", lineHeight: 1 }}>V</span>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 1 }}>{SHOP.name}</p>
          <p style={{ color: "var(--muted)", fontSize: 12 }}>{SHOP.address}</p>
        </div>
      </div>

      {/* Services */}
      <SectionHeader>SELECT SERVICES</SectionHeader>
      {SERVICES.map((s) => (
        <ServiceRow key={s.id} service={s} selected={service?.id === s.id} onSelect={() => { setService(s); setTime(""); }} />
      ))}

      {/* Date & Time */}
      <SectionHeader>SELECT DATE &amp; TIME</SectionHeader>
      <WeekCalendar selected={date} onSelect={(d) => { setDate(d); setTime(""); }} />

      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        {loadingSlots && <p style={{ color: "var(--muted)", fontSize: 14, textAlign: "center", padding: "12px 0" }}>Loading…</p>}
        {!loadingSlots && (closedDay || slots.length === 0) && (
          <p style={{ color: "var(--muted)", fontSize: 14, textAlign: "center", padding: "12px 0" }}>No available times</p>
        )}
        {!loadingSlots && slots.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => { setTime(s); setTimeout(() => infoRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
                style={{
                  background: time === s ? "var(--orange)" : "var(--surface)",
                  color: time === s ? "#000" : "var(--text)",
                  border: `1px solid ${time === s ? "var(--orange)" : "var(--border)"}`,
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

      {/* Recurring */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", color: "var(--muted)" }}>RECURRING</p>
        <p style={{ fontSize: 15 }}>Never</p>
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
        <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid var(--orange)", background: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#000" }} />
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

      {error && <p style={{ color: "#ff4444", fontSize: 14, padding: "8px 20px" }}>{error}</p>}

      {/* Sticky footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(10,10,10,0.97)", borderTop: "1px solid var(--border)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 50, backdropFilter: "blur(12px)" }}>
        <p style={{ fontWeight: 800, fontSize: 22 }}>${service?.price ?? 0}</p>
        <button
          onClick={submit}
          disabled={!canBook}
          style={{
            background: canBook ? "var(--orange)" : "var(--border)",
            color: canBook ? "#000" : "var(--muted)",
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
