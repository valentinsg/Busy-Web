-- Expenses and cost tracking for financial reports
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null, -- supplier, fixed_cost, marketing, shipping, taxes, other
  supplier_id uuid references public.suppliers(id) on delete set null,
  description text,
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  incurred_at timestamptz not null default now(),
  channel text, -- optional: web, instagram, mercado_libre, feria, other
  metadata jsonb
);

alter table public.expenses enable row level security;
create policy if not exists expenses_read for select on public.expenses using (true);

create index if not exists idx_expenses_category on public.expenses(category);
create index if not exists idx_expenses_supplier on public.expenses(supplier_id);
create index if not exists idx_expenses_incurred_at on public.expenses(incurred_at);
create index if not exists idx_expenses_metadata_gin on public.expenses using gin (metadata);
