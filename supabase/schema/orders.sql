-- Orders for both online and manual channels
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  channel text not null check (channel in ('web','instagram','mercado_libre','feria','manual','marketplace','grupo_wsp','other')),
  status text not null default 'paid', -- e.g., paid, pending, refunded, cancelled
  currency text not null default 'USD',
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  notes text,
  placed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;
create policy if not exists orders_read for select on public.orders using (true);

create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_channel on public.orders(channel);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_placed_at on public.orders(placed_at);

-- Ensure new barter flag exists (idempotent)
alter table public.orders add column if not exists is_barter boolean not null default false;

-- Update channel check constraint to include marketplace and grupo_wsp (safe pattern)
-- Drop previous constraint if present and recreate
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'orders' and constraint_type = 'CHECK' and constraint_name = 'orders_channel_check'
  ) then
    alter table public.orders drop constraint orders_channel_check;
  end if;
exception when undefined_object then
  null;
end $$;

alter table public.orders
  add constraint orders_channel_check
  check (channel in ('web','instagram','mercado_libre','feria','manual','marketplace','grupo_wsp','other'));
