-- Shop settings table to keep editable configuration from the Admin UI
create table if not exists public.shop_settings (
  id bigint primary key generated always as identity,
  shipping_flat_rate numeric not null default 20000,
  shipping_free_threshold numeric not null default 80000,
  updated_at timestamp with time zone not null default now()
);

-- Only a single row is expected; enforce at most one row via unique always true condition
create unique index if not exists shop_settings_singleton on public.shop_settings ((true));

-- RLS
alter table public.shop_settings enable row level security;
-- Allow read for anon (site needs to compute totals server-side)
create policy if not exists shop_settings_read on public.shop_settings for select using (true);
-- Updates/inserts are handled by service key only (no policy for public).
