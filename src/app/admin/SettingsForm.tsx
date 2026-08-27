"use client";
import { useState } from "react";
import type { WeekSchedule } from "@/lib/getSettings";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS: Record<string, string> = {
  sunday: "Sun", monday: "Mon", tuesday: "Tue", wednesday: "Wed",
  thursday: "Thu", friday: "Fri", saturday: "Sat",
};

type Setter = React.Dispatch<React.SetStateAction<WeekSchedule>>;

const FALLBACK_DAY = { open: false, times: ["12:00", "17:00"] as [string, string] };

function toggleDay(set: Setter, day: string) {
  set(h => {
    const current = h[day] ?? FALLBACK_DAY;
    return { ...h, [day]: { ...current, open: !current.open } };
  });
}

function setTime(set: Setter, day: string, idx: 0 | 1, val: string) {
  set(h => {
    const current = h[day] ?? FALLBACK_DAY;
    const times = [...current.times] as [string, string];
    times[idx] = val;
    return { ...h, [day]: { ...current, times } };
  });
}

/** The day rows, shared by the regular and off-day schedules. */
function DayRows({ schedule, set }: { schedule: WeekSchedule; set: Setter }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {DAYS.map(day => (
        <div key={day} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => toggleDay(set, day)}
            style={{
              width: 42, height: 24, borderRadius: 12, border: "none", flexShrink: 0,
              background: schedule[day]?.open ? "var(--accent)" : "var(--border)",
              cursor: "pointer", position: "relative", transition: "background 0.2s",
            }}
            aria-label={`Toggle ${day}`}
          >
            <span style={{
              position: "absolute", top: 3,
              left: schedule[day]?.open ? 21 : 3,
              width: 18, height: 18, borderRadius: "50%", background: "#fff",
              transition: "left 0.2s", display: "block",
            }} />
          </button>
          <span style={{ color: schedule[day]?.open ? "var(--text)" : "var(--muted)", fontSize: 13, width: 34, flexShrink: 0 }}>
            {DAY_LABELS[day]}
          </span>
          {schedule[day]?.open ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="time"
                value={schedule[day].times[0]}
                onChange={e => setTime(set, day, 0, e.target.value)}
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4, padding: "4px 8px", fontSize: 13, outline: "none" }}
              />
              <span style={{ color: "var(--muted)" }}>&ndash;</span>
              <input
                type="time"
                value={schedule[day].times[1]}
                onChange={e => setTime(set, day, 1, e.target.value)}
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4, padding: "4px 8px", fontSize: 13, outline: "none" }}
              />
            </div>
          ) : (
            <span style={{ color: "var(--muted)", fontSize: 13 }}>Closed</span>
          )}
        </div>
      ))}
    </div>
  );
}

type Props = {
  initialAddress: string;
  initialPhone: string;
  initialHours: WeekSchedule;
  initialOffDayHours: WeekSchedule;
  initialAfterHoursEnd: string;
  initialAfterHoursEnabled: boolean;
};

export default function SettingsForm({
  initialAddress,
  initialPhone,
  initialHours,
  initialOffDayHours,
  initialAfterHoursEnd,
  initialAfterHoursEnabled,
}: Props) {
  const [address, setAddress] = useState(initialAddress);
  const [phone, setPhone] = useState(initialPhone);
  const [hours, setHours] = useState<WeekSchedule>(initialHours);
  const [offDayHours, setOffDayHours] = useState<WeekSchedule>(initialOffDayHours);
  const [afterHoursEnd, setAfterHoursEnd] = useState(initialAfterHoursEnd);
  const [afterHoursEnabled, setAfterHoursEnabled] = useState(initialAfterHoursEnabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setSaving(true);
    setErr("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address, phone, hours, offDayHours, afterHoursEnd, afterHoursEnabled,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setErr("Failed to save. Try again.");
    }
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, marginTop: 40 }}>
      <h2 style={{ color: "var(--accent-text)", letterSpacing: "0.15em", fontSize: 12, marginBottom: 24, fontWeight: 600 }}>
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
        <label style={{ color: "var(--muted)", fontSize: 11, display: "block", marginBottom: 14, letterSpacing: "0.1em", fontWeight: 600 }}>SHOP HOURS</label>
        <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -8, marginBottom: 14, lineHeight: 1.5 }}>
          Your normal working days. Basic Haircut ($35) is bookable in these hours.
        </p>
        <DayRows schedule={hours} set={setHours} />
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "28px 0 24px" }} />

      <div style={{ marginBottom: 24 }}>
        <label style={{ color: "var(--muted)", fontSize: 11, display: "block", marginBottom: 14, letterSpacing: "0.1em", fontWeight: 600 }}>AFTER-HOURS ($55)</label>
        <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -8, marginBottom: 14, lineHeight: 1.5 }}>
          Picks up when you close and runs until the time below, on days you&rsquo;re open.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => setAfterHoursEnabled(v => !v)}
            style={{
              width: 42, height: 24, borderRadius: 12, border: "none", flexShrink: 0,
              background: afterHoursEnabled ? "var(--accent)" : "var(--border)",
              cursor: "pointer", position: "relative", transition: "background 0.2s",
            }}
            aria-label="Toggle after-hours booking"
          >
            <span style={{
              position: "absolute", top: 3, left: afterHoursEnabled ? 21 : 3,
              width: 18, height: 18, borderRadius: "50%", background: "#fff",
              transition: "left 0.2s", display: "block",
            }} />
          </button>
          {afterHoursEnabled ? (
            <>
              <span style={{ color: "var(--text)", fontSize: 13 }}>Open until</span>
              <input
                type="time"
                value={afterHoursEnd}
                onChange={e => setAfterHoursEnd(e.target.value)}
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4, padding: "4px 8px", fontSize: 13, outline: "none" }}
              />
            </>
          ) : (
            <span style={{ color: "var(--muted)", fontSize: 13 }}>Not offered</span>
          )}
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "28px 0 24px" }} />

      <div style={{ marginBottom: 24 }}>
        <label style={{ color: "var(--muted)", fontSize: 11, display: "block", marginBottom: 14, letterSpacing: "0.1em", fontWeight: 600 }}>OFF-DAY HOURS ($60)</label>
        <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -8, marginBottom: 14, lineHeight: 1.5 }}>
          Only applies to days closed above. Turn on the days you&rsquo;ll take an off-day
          booking and set the window.
        </p>
        <DayRows schedule={offDayHours} set={setOffDayHours} />
      </div>

      {err && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{err}</p>}

      <button
        onClick={save}
        disabled={saving}
        style={{
          background: saved ? "var(--ok)" : "var(--accent)",
          color: "var(--on-accent)", border: "none", borderRadius: 6,
          padding: "10px 28px", fontWeight: 700, fontSize: 14,
          cursor: saving ? "not-allowed" : "pointer", transition: "background 0.2s",
        }}
      >
        {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}
