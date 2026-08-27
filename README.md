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
CRON_SECRET=
```

See `.env.example` for what each key is and where to get it. All of these
must also be set in Vercel before the first deploy — the app reads Supabase
credentials at startup and the build fails without them.

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

Run [`supabase_schema.sql`](./supabase_schema.sql) in your Supabase SQL editor
(Dashboard -> SQL Editor -> New query -> paste -> Run). It creates the
`bookings` and `shop_settings` tables and is safe to re-run.

## Deploy

Push to GitHub, then import on [vercel.com](https://vercel.com). Add all environment variables in Vercel project settings before deploying.
