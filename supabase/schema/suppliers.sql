-- Suppliers management and purchase history
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  -- New fields for richer supplier management
  category text,
  product_tags text[] default '{}',
  reference_price text,
  minimum_order_quantity int,
  delivery_time_days int,
  payment_terms text,
  tags text[] default '{}',
  status text not null default 'active', -- active | inactive
  reliability_rating int, -- 1..5
  created_at timestamptz not null default now()
);

alter table public.suppliers enable row level security;
drop policy if exists suppliers_read on public.suppliers;
create policy suppliers_read on public.suppliers for select using (true);

create index if not exists idx_suppliers_name on public.suppliers(name);
create index if not exists idx_suppliers_category on public.suppliers(category);
create index if not exists idx_suppliers_status on public.suppliers(status);
create index if not exists idx_suppliers_reliability on public.suppliers(reliability_rating);

-- Ensure columns exist when updating an existing database
alter table public.suppliers add column if not exists category text;
alter table public.suppliers add column if not exists product_tags text[] default '{}'::text[];
alter table public.suppliers add column if not exists reference_price text;
alter table public.suppliers add column if not exists minimum_order_quantity int;
alter table public.suppliers add column if not exists delivery_time_days int;
alter table public.suppliers add column if not exists payment_terms text;
alter table public.suppliers add column if not exists tags text[] default '{}'::text[];
alter table public.suppliers add column if not exists status text default 'active';
alter table public.suppliers add column if not exists reliability_rating int;

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
drop policy if exists product_suppliers_read on public.product_suppliers;
create policy product_suppliers_read on public.product_suppliers for select using (true);

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
drop policy if exists supplier_purchases_read on public.supplier_purchases;
create policy supplier_purchases_read on public.supplier_purchases for select using (true);

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
drop policy if exists supplier_purchase_items_read on public.supplier_purchase_items;
create policy supplier_purchase_items_read on public.supplier_purchase_items for select using (true);

create index if not exists idx_supplier_purchase_items_purchase on public.supplier_purchase_items(purchase_id);
create index if not exists idx_supplier_purchase_items_product on public.supplier_purchase_items(product_id);
