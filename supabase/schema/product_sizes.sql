-- Per-size stock table
create table if not exists public.product_sizes (
  product_id text not null references public.products(id) on delete cascade,
  size text not null,
  stock integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (product_id, size)
);

-- Enable RLS
alter table public.product_sizes enable row level security;

-- Read for everyone (storefront needs to read stock)
create policy if not exists product_sizes_read for select on public.product_sizes using (true);

-- Optional write policies: by default keep locked; we'll write via Service Role in server actions
-- If later you want authenticated writes, create policies bound to your logic.

-- Helpful indexes
create index if not exists idx_product_sizes_product on public.product_sizes (product_id);
create index if not exists idx_product_sizes_size on public.product_sizes (size);
