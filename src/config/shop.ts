// ============================================================
// VivBlendz Shop Configuration
// Edit this file to customize your hours, services, and more.
// ============================================================

// -------------------------------------------------------
// Switch locations here — change ACTIVE_LOCATION to
// "home" or "college" whenever you move.
// -------------------------------------------------------
const LOCATIONS = {
  home: {
    address: "123 Main St, Your City, ST 00000",
    phone: "(555) 000-0000",
  },
  college: {
    address: "456 College Ave, Campus Town, ST 00000",
    phone: "(555) 000-0000",
  },
};

const ACTIVE_LOCATION: keyof typeof LOCATIONS = "home"; // <-- change this

export const SHOP = {
  name: "VivBlendz",
  tagline: "Premium cuts. Every time.",
  address: LOCATIONS[ACTIVE_LOCATION].address,
  phone: LOCATIONS[ACTIVE_LOCATION].phone,
  email: "info@vivblendz.com",

  // Your email address — booking notifications will be sent here
  ownerEmail: process.env.OWNER_EMAIL ?? "vivblendz@gmail.com",

  // Social links (set to "" to hide)
  instagram: "https://www.instagram.com/vivblendz.va?igsh=MTdpdHBnc2kzOWlkbw%3D%3D&utm_source=qr",
  facebook: "",
};

// -------------------------------------------------------
// Schedule presets — change ACTIVE_SCHEDULE to switch.
// Set open: false on days you're closed.
// times: ["09:00", "18:00"] means 9am–6pm (24-hour format).
// -------------------------------------------------------
export type DaySchedule = { open: boolean; times: [string, string] };
export type WeekSchedule = Record<string, DaySchedule>;

const SCHEDULES: Record<string, WeekSchedule> = {
  home: {
    sunday:    { open: false, times: ["12:00", "17:00"] },
    monday:    { open: false, times: ["12:00", "17:00"] },
    tuesday:   { open: true,  times: ["12:00", "17:00"] },
    wednesday: { open: true,  times: ["12:00", "17:00"] },
    thursday:  { open: true,  times: ["12:00", "17:00"] },
    friday:    { open: true,  times: ["12:00", "17:00"] },
    saturday:  { open: true,  times: ["12:00", "17:00"] },
  },
  college: {
    sunday:    { open: false, times: ["12:00", "17:00"] },
    monday:    { open: true,  times: ["10:00", "18:00"] },
    tuesday:   { open: true,  times: ["10:00", "18:00"] },
    wednesday: { open: false, times: ["10:00", "18:00"] },
    thursday:  { open: true,  times: ["10:00", "18:00"] },
    friday:    { open: true,  times: ["10:00", "18:00"] },
    saturday:  { open: true,  times: ["10:00", "18:00"] },
  },
};

const ACTIVE_SCHEDULE: keyof typeof SCHEDULES = "home"; // <-- change this

export const HOURS: WeekSchedule = SCHEDULES[ACTIVE_SCHEDULE];

// -------------------------------------------------------
// Appointment slot length (minutes)
// All bookings will use this slot size.
// -------------------------------------------------------
export const SLOT_DURATION_MINUTES = 45;

// -------------------------------------------------------
// Services
// Add, remove, or edit services here.
// duration is in minutes and will block that many slots.
// -------------------------------------------------------
/**
 * Which set of hours a service can be booked in.
 *
 *  regular — the shop hours below, the normal working day.
 *  after   — after the shop closes, up to the after-hours cutoff set in /admin.
 *  off     — days the shop is normally closed, using the off-day schedule in /admin.
 */
export type BookingWindow = "regular" | "after" | "off";

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  window: BookingWindow;
};

export const SERVICES: Service[] = [
  {
    id: "haircut",
    name: "Basic Haircut",
    description: "Classic cut, styled to your preference.",
    price: 35,
    duration: 45,
    window: "regular",
  },
  {
    id: "haircut-after-hours",
    name: "After-Hours Cut",
    description: "Same cut, booked after the shop closes for the day.",
    price: 55,
    duration: 45,
    window: "after",
  },
  {
    id: "haircut-off-day",
    name: "Off-Day Cut",
    description: "Same cut, booked on a day the shop is normally closed.",
    price: 60,
    duration: 45,
    window: "off",
  },
];

/** The service a booking row refers to, or null if it names an unknown one. */
export function serviceById(id: string): Service | null {
  return SERVICES.find((s) => s.id === id) ?? null;
}

// -------------------------------------------------------
// Defaults for the extra schedules. Both are editable at
// /admin and stored in Supabase; these only apply before
// anything has been saved there.
// -------------------------------------------------------

/** How late after-hours bookings can run, 24-hour time. */
export const DEFAULT_AFTER_HOURS_END = "20:00";

/** Availability on days the regular schedule is closed. */
export const DEFAULT_OFF_DAY_HOURS: WeekSchedule = {
  sunday:    { open: true,  times: ["12:00", "17:00"] },
  monday:    { open: true,  times: ["12:00", "17:00"] },
  tuesday:   { open: false, times: ["12:00", "17:00"] },
  wednesday: { open: false, times: ["12:00", "17:00"] },
  thursday:  { open: false, times: ["12:00", "17:00"] },
  friday:    { open: false, times: ["12:00", "17:00"] },
  saturday:  { open: false, times: ["12:00", "17:00"] },
};

// -------------------------------------------------------
// Admin password lives in the ADMIN_PASSWORD environment variable and is
// read through src/lib/adminAuth.ts. It is deliberately not defined here:
// this repository is public, so any default would be a published
// credential for /admin.
// -------------------------------------------------------
