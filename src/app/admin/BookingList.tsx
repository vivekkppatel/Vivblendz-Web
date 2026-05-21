"use client";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import type { Booking } from "@/lib/supabase";

function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function BookingRow({ booking, onComplete }: { booking: Booking; onComplete: (id: string) => void }) {
  const [loading, setLoading] = useState(false);
  const done = booking.status === "completed";

  async function markDone() {
    setLoading(true);
    await fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    setLoading(false);
    onComplete(booking.id);
  }

  return (
    <div
      style={{
        background: done ? "transparent" : "var(--surface)",
        borderBottom: "1px solid var(--border)",
        opacity: done ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
      className="p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
    >
      <div className="flex gap-4 items-center min-w-[200px]">
        <div>
          <p className="font-bold text-sm">{format(parseISO(booking.date), "EEE, MMM d")}</p>
          <p style={{ color: "var(--orange)" }} className="text-sm font-semibold">
            {fmt12(booking.time)}
          </p>
        </div>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{booking.client_name}</p>
        <p style={{ color: "var(--muted)" }} className="text-xs">
          {booking.client_phone} &nbsp;·&nbsp; {booking.client_email}
        </p>
      </div>
      <div className="text-right flex items-center gap-4 justify-end">
        <div>
          <p className="text-sm font-medium">{booking.service_name}</p>
          <p style={{ color: "var(--muted)" }} className="text-xs">
            {booking.duration_minutes} min
          </p>
        </div>
        {done ? (
          <span style={{ color: "#22c55e", fontSize: 20 }}>✓</span>
        ) : (
          <button
            onClick={markDone}
            disabled={loading}
            style={{
              background: "transparent",
              border: "1px solid #22c55e",
              color: "#22c55e",
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "…" : "✓ Done"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function BookingList({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings);

  function markComplete(id: string) {
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: "completed" as const } : b));
  }

  const active = bookings.filter(b => b.status === "confirmed");
  const completed = bookings.filter(b => b.status === "completed");

  if (bookings.length === 0) return null;

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
      {active.map(b => (
        <BookingRow key={b.id} booking={b} onComplete={markComplete} />
      ))}
      {completed.map(b => (
        <BookingRow key={b.id} booking={b} onComplete={markComplete} />
      ))}
    </div>
  );
}
