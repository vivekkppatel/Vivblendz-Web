# VivBlendz

VivBlendz is a full-stack barbershop booking app built for a solo barber. Clients can browse services, pick a date and time, and book an appointment in under 60 seconds — no account needed. The barber gets an email notification for every new booking and manages everything from a private admin dashboard.

**Client side:**
- Browse services and pricing
- Pick available time slots on a weekly calendar
- Enter contact info and book instantly
- Confirmation email sent automatically
- Pay in shop via Cash, Zelle, Cash App, or Venmo

**Admin side (`/admin`):**
- See today's appointments and upcoming bookings at a glance
- Update shop hours day-by-day with toggle switches
- Change address and phone number without touching code

## Stack

- Next.js 16 (App Router)
- Supabase (bookings + settings)
- Resend (email confirmations)
- Vercel (hosting)

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with these keys:

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
OWNER_EMAIL=vivblendz@gmail.com
ADMIN_PASSWORD=
```

## Admin Dashboard

Go to `/admin` and enter your `ADMIN_PASSWORD`. From there you can:

- View today's bookings and upcoming appointments
- Toggle days open/closed and set hours
- Update your address and phone number

## Switching Locations

When you move between home and college, edit two lines in `src/config/shop.ts`:

```ts
const ACTIVE_LOCATION = "home"; // or "college"
const ACTIVE_SCHEDULE = "home"; // or "college"
```

Or just update your hours directly from the admin dashboard — no code needed.

## Supabase Schema

Run this in your Supabase SQL editor:

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  service_id text not null,
  service_name text not null,
  date text not null,
  time text not null,
  duration_minutes int not null,
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  status text default 'confirmed'
);

create table shop_settings (
  id int primary key default 1,
  address text not null default '',
  phone text not null default '',
  hours jsonb not null default '{}'::jsonb,
  check (id = 1)
);

insert into shop_settings (id, address, phone, hours) values (1,
  'Your Address Here',
  '(555) 000-0000',
  '{
    "sunday":    {"open": false, "times": ["12:00", "17:00"]},
    "monday":    {"open": false, "times": ["12:00", "17:00"]},
    "tuesday":   {"open": true,  "times": ["12:00", "17:00"]},
    "wednesday": {"open": true,  "times": ["12:00", "17:00"]},
    "thursday":  {"open": true,  "times": ["12:00", "17:00"]},
    "friday":    {"open": true,  "times": ["12:00", "17:00"]},
    "saturday":  {"open": true,  "times": ["12:00", "17:00"]}
  }'::jsonb
);
```

## Deploy

Push to GitHub, then import on [vercel.com](https://vercel.com). Add all environment variables in Vercel project settings before deploying.
