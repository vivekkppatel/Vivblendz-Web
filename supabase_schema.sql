-- Run this in your Supabase SQL Editor before deploying.
-- Go to: supabase.com → your project → SQL Editor → New query
-- Safe to re-run: every statement is idempotent.

-- =====================================================
-- bookings
-- =====================================================
create table if not exists bookings (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  service_id       text not null,
  service_name     text not null,
  date             date not null,
  time             text not null,
  duration_minutes integer not null,
  client_name      text not null,
  client_email     text not null,
  client_phone     text not null,
  status           text not null default 'confirmed',
  amount_paid      numeric
);

-- Added after the first release: the admin dashboard records what was
-- actually collected when a booking is marked done.
alter table bookings add column if not exists amount_paid numeric;

-- The admin dashboard marks finished bookings 'completed', so the
-- allowed set is confirmed / cancelled / completed.
alter table bookings drop constraint if exists bookings_status_check;
alter table bookings add constraint bookings_status_check
  check (status in ('confirmed', 'cancelled', 'completed'));

-- Index for fast availability lookups
create index if not exists bookings_date_status_idx on bookings (date, status);

-- Two people confirming the same slot at the same moment is a race the
-- application cannot win on its own. This is what actually decides it: only
-- one confirmed booking may hold a given date and time. Cancelled and
-- completed rows are excluded so a freed slot can be booked again.
create unique index if not exists bookings_one_per_slot_idx
  on bookings (date, time)
  where status = 'confirmed';

-- Disable public row access (we use the service role key from the server)
alter table bookings enable row level security;

-- =====================================================
-- shop_settings — address, phone, and weekly hours,
-- editable from /admin without a redeploy.
-- =====================================================
create table if not exists shop_settings (
  id      integer primary key default 1,
  address text  not null default '',
  phone   text  not null default '',
  hours   jsonb not null default '{}'::jsonb,
  constraint shop_settings_singleton check (id = 1)
);

-- Off-day and after-hours booking, both editable at /admin.
--   off_day_hours       availability on days the regular schedule is closed
--   after_hours_end     how late after-hours bookings may run
--   after_hours_enabled whether after-hours booking is offered at all
alter table shop_settings add column if not exists off_day_hours jsonb
  not null default '{}'::jsonb;
alter table shop_settings add column if not exists after_hours_end text
  not null default '20:00';
alter table shop_settings add column if not exists after_hours_enabled boolean
  not null default true;

alter table shop_settings enable row level security;

-- Seed the single settings row. Edit these values at /admin afterwards.
insert into shop_settings (id, address, phone, hours, off_day_hours) values (
  1,
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
  }'::jsonb,
  '{
    "sunday":    {"open": true,  "times": ["12:00", "17:00"]},
    "monday":    {"open": true,  "times": ["12:00", "17:00"]},
    "tuesday":   {"open": false, "times": ["12:00", "17:00"]},
    "wednesday": {"open": false, "times": ["12:00", "17:00"]},
    "thursday":  {"open": false, "times": ["12:00", "17:00"]},
    "friday":    {"open": false, "times": ["12:00", "17:00"]},
    "saturday":  {"open": false, "times": ["12:00", "17:00"]}
  }'::jsonb
) on conflict (id) do nothing;

-- Databases seeded before off-day booking existed have an empty object here.
update shop_settings set off_day_hours = '{
    "sunday":    {"open": true,  "times": ["12:00", "17:00"]},
    "monday":    {"open": true,  "times": ["12:00", "17:00"]},
    "tuesday":   {"open": false, "times": ["12:00", "17:00"]},
    "wednesday": {"open": false, "times": ["12:00", "17:00"]},
    "thursday":  {"open": false, "times": ["12:00", "17:00"]},
    "friday":    {"open": false, "times": ["12:00", "17:00"]},
    "saturday":  {"open": false, "times": ["12:00", "17:00"]}
  }'::jsonb
where id = 1 and off_day_hours = '{}'::jsonb;
