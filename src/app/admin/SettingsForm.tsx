"use client";
import { useState } from "react";
import type { WeekSchedule } from "@/lib/getSettings";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS: Record<string, string> = {
  sunday: "Sun", monday: "Mon", tuesday: "Tue", wednesday: "Wed",
  thursday: "Thu", friday: "Fri", saturday: "Sat",
};

type Props = {
  initialAddress: string;
  initialPhone: string;
  initialHours: WeekSchedule;
};

export default function SettingsForm({ initialAddress, initialPhone, initialHours }: Props) {
  const [address, setAddress] = useState(initialAddress);
  const [phone, setPhone] = useState(initialPhone);
  const [hours, setHours] = useState<WeekSchedule>(initialHours);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setSaving(true);
    setErr("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, phone, hours }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setErr("Failed to save. Try again.");
    }
  }

  function toggleDay(day: string) {
    setHours(h => ({ ...h, [day]: { ...h[day], open: !h[day].open } }));
  }

  function setTime(day: string, idx: 0 | 1, val: string) {
    setHours(h => {
      const times = [...h[day].times] as [string, string];
      times[idx] = val;
      return { ...h, [day]: { ...h[day], times } };
    });
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, marginTop: 40 }}>
      <h2 style={{ color: "var(--orange)", letterSpacing: "0.15em", fontSize: 12, marginBottom: 24, fontWeight: 600 }}>
        SHOP SETTINGS
      </h2>

      <div style={{ marginBottom: 20 }}>
        <label style={{ color: "var(--muted)", fontSize: 11, display: "block", marginBottom: 6, letterSpacing: "0.1em", fontWeight: 600 }}>ADDRESS</label>
        <input
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, padding: "10px 14px", fontSize: 14, outline: "none" }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ color: "var(--muted)", fontSize: 11, display: "block", marginBottom: 6, letterSpacing: "0.1em", fontWeight: 600 }}>PHONE</label>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, padding: "10px 14px", fontSize: 14, outline: "none" }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ color: "var(--muted)", fontSize: 11, display: "block", marginBottom: 14, letterSpacing: "0.1em", fontWeight: 600 }}>HOURS</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {DAYS.map(day => (
            <div key={day} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => toggleDay(day)}
                style={{
                  width: 42, height: 24, borderRadius: 12, border: "none", flexShrink: 0,
                  background: hours[day]?.open ? "var(--orange)" : "var(--border)",
                  cursor: "pointer", position: "relative", transition: "background 0.2s",
                }}
                aria-label={`Toggle ${day}`}
              >
                <span style={{
                  position: "absolute", top: 3,
                  left: hours[day]?.open ? 21 : 3,
                  width: 18, height: 18, borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s", display: "block",
                }} />
              </button>
              <span style={{ color: hours[day]?.open ? "var(--text)" : "var(--muted)", fontSize: 13, width: 34, flexShrink: 0 }}>
                {DAY_LABELS[day]}
              </span>
              {hours[day]?.open ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="time"
                    value={hours[day].times[0]}
                    onChange={e => setTime(day, 0, e.target.value)}
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4, padding: "4px 8px", fontSize: 13, outline: "none" }}
                  />
                  <span style={{ color: "var(--muted)" }}>–</span>
                  <input
                    type="time"
                    value={hours[day].times[1]}
                    onChange={e => setTime(day, 1, e.target.value)}
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4, padding: "4px 8px", fontSize: 13, outline: "none" }}
                  />
                </div>
              ) : (
                <span style={{ color: "var(--muted)", fontSize: 13 }}>Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {err && <p style={{ color: "#ff4444", fontSize: 13, marginBottom: 12 }}>{err}</p>}

      <button
        onClick={save}
        disabled={saving}
        style={{
          background: saved ? "#22c55e" : "var(--orange)",
          color: "#000", border: "none", borderRadius: 6,
          padding: "10px 28px", fontWeight: 700, fontSize: 14,
          cursor: saving ? "not-allowed" : "pointer", transition: "background 0.2s",
        }}
      >
        {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}
