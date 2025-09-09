-- Line items for orders
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  product_name text, -- denormalized snapshot for historical display
  variant_color text,
  variant_size text,
  quantity int not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  total numeric(12,2) not null,
  created_at timestamptz not null default now()
);

alter table public.order_items enable row level security;
create policy if not exists order_items_read for select on public.order_items using (true);

create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_product on public.order_items(product_id);
