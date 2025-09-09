-- Track product views and clicks for recommendation popularity
create table if not exists public.product_views (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  session_id text, -- anonymous tracking key
  source text, -- page, email, campaign name
  action text not null check (action in ('view','click','add_to_cart','purchase')),
  occurred_at timestamptz not null default now(),
  metadata jsonb
);

alter table public.product_views enable row level security;
create policy if not exists product_views_read for select on public.product_views using (true);

create index if not exists idx_product_views_product on public.product_views(product_id);
create index if not exists idx_product_views_customer on public.product_views(customer_id);
create index if not exists idx_product_views_action on public.product_views(action);
create index if not exists idx_product_views_occurred_at on public.product_views(occurred_at);
create index if not exists idx_product_views_metadata_gin on public.product_views using gin (metadata);
