-- Run this in your Supabase SQL Editor to create the bookings table.
-- Go to: supabase.com → your project → SQL Editor → New query

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
  status           text not null default 'confirmed' check (status in ('confirmed', 'cancelled'))
);

-- Index for fast availability lookups
create index if not exists bookings_date_status_idx on bookings (date, status);

-- Disable public row access (we use service role key from server)
alter table bookings enable row level security;
