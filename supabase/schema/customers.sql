-- Customers table for ranking and segmentation
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  full_name text,
  phone text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

alter table public.customers enable row level security;

-- Allow read by default (you can tighten later). Writes should be done by service role/admin APIs.
create policy if not exists customers_read for select on public.customers using (true);

create index if not exists idx_customers_email on public.customers (email);
create index if not exists idx_customers_created_at on public.customers (created_at);
