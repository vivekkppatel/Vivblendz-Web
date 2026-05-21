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
  const [amount, setAmount] = useState(String(booking.amount_paid ?? ""));

  async function markDone() {
    setLoading(true);
    await fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "completed",
        amount_paid: amount ? parseFloat(amount) : null,
      }),
    });
    setLoading(false);
    onComplete(booking.id);
  }

  return (
    <div
      style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
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
      <div className="flex items-center gap-3 justify-end">
        <div className="text-right">
          <p className="text-sm font-medium">{booking.service_name}</p>
          <p style={{ color: "var(--muted)" }} className="text-xs">
            {booking.duration_minutes} min
          </p>
        </div>
        {/* Amount paid input */}
        <div style={{ display: "flex", alignItems: "center", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 10px", width: 90 }}>
          <span style={{ color: "var(--muted)", fontSize: 13, marginRight: 2 }}>$</span>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 13, width: "100%", fontWeight: 600 }}
          />
        </div>
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
      </div>
    </div>
  );
}

export default function BookingList({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings);

  function markComplete(id: string) {
    setBookings(bs => bs.filter(b => b.id !== id));
  }

  if (bookings.length === 0) return null;

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
      {bookings.map(b => (
        <BookingRow key={b.id} booking={b} onComplete={markComplete} />
      ))}
    </div>
  );
}
