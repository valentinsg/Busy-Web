-- Alter orders table to support MP workflow
-- Keeps idempotency and is safe to run multiple times
alter table if exists public.orders
  alter column currency set default 'ARS';

-- add columns if not exists
alter table if exists public.orders
  add column if not exists preference_id text,
  add column if not exists payment_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists status text;

-- Normalize status domain via check, but do it safely by recreating constraint
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema='public' and table_name='orders' and constraint_type='CHECK' and constraint_name='orders_status_check'
  ) then
    alter table public.orders drop constraint orders_status_check;
  end if;
exception when undefined_object then null;
end $$;

alter table public.orders
  add constraint orders_status_check
  check (status in ('created','pending','paid','rejected','refunded','cancelled'));
