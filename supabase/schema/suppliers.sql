-- Suppliers management and purchase history
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.suppliers enable row level security;
create policy if not exists suppliers_read for select on public.suppliers using (true);

create index if not exists idx_suppliers_name on public.suppliers(name);

-- Relation between products and suppliers with last known cost
create table if not exists public.product_suppliers (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  last_cost numeric(12,2),
  currency text default 'USD',
  lead_time_days int,
  unique(product_id, supplier_id)
);

alter table public.product_suppliers enable row level security;
create policy if not exists product_suppliers_read for select on public.product_suppliers using (true);

create index if not exists idx_product_suppliers_product on public.product_suppliers(product_id);
create index if not exists idx_product_suppliers_supplier on public.product_suppliers(supplier_id);

-- Purchase orders to suppliers
create table if not exists public.supplier_purchases (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  status text not null default 'ordered', -- ordered, received, cancelled
  currency text not null default 'USD',
  subtotal numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  placed_at timestamptz not null default now(),
  received_at timestamptz,
  notes text
);

alter table public.supplier_purchases enable row level security;
create policy if not exists supplier_purchases_read for select on public.supplier_purchases using (true);

create index if not exists idx_supplier_purchases_supplier on public.supplier_purchases(supplier_id);
create index if not exists idx_supplier_purchases_status on public.supplier_purchases(status);
create index if not exists idx_supplier_purchases_placed_at on public.supplier_purchases(placed_at);

-- Items in a supplier purchase
create table if not exists public.supplier_purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.supplier_purchases(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  quantity int not null check (quantity > 0),
  unit_cost numeric(12,2) not null,
  total_cost numeric(12,2) not null
);

alter table public.supplier_purchase_items enable row level security;
create policy if not exists supplier_purchase_items_read for select on public.supplier_purchase_items using (true);

create index if not exists idx_supplier_purchase_items_purchase on public.supplier_purchase_items(purchase_id);
create index if not exists idx_supplier_purchase_items_product on public.supplier_purchase_items(product_id);
