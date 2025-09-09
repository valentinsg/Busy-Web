create table if not exists public.coupons (
  code text primary key,
  percent int not null check (percent between 1 and 100),
  active boolean not null default true,
  max_uses int,
  used_count int not null default 0,
  expires_at timestamptz
);

create index if not exists idx_coupons_active on public.coupons(active);
create index if not exists idx_coupons_expires on public.coupons(expires_at);
