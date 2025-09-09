-- Related products for upselling and cross-selling
create table if not exists public.related_products (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  related_product_id text not null references public.products(id) on delete cascade,
  relation_type text not null check (relation_type in ('upsell','cross_sell','accessory','manual')),
  weight numeric(6,3) not null default 1.0,
  created_at timestamptz not null default now(),
  unique(product_id, related_product_id)
);

alter table public.related_products enable row level security;
create policy if not exists related_products_read for select on public.related_products using (true);

create index if not exists idx_related_products_product on public.related_products(product_id);
create index if not exists idx_related_products_related on public.related_products(related_product_id);
create index if not exists idx_related_products_type on public.related_products(relation_type);
