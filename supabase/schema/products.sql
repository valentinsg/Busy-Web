-- Products table with per-size measurements stored as JSONB
create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric(10,2) not null,
  currency text not null default 'USD',
  images text[] not null default '{}',
  colors text[] not null default '{}',
  sizes text[] not null default '{}',
  measurements_by_size jsonb, -- { "S": { unit: "cm", chest: 50, length: 68, ... }, ... }
  category text not null,
  sku text not null,
  stock integer not null default 0,
  description text,
  -- Optional per-product UX fields
  benefits jsonb, -- [ { title: text, subtitle: text, icon: text } ]
  care_instructions text,
  imported boolean not null default false,
  tags text[] not null default '{}',
  rating numeric(3,2) not null default 0,
  reviews integer not null default 0,
  -- Badge and discount fields
  badge_text text, -- Custom badge text (e.g., "2x1", "NUEVO", "OFERTA")
  badge_variant text default 'default', -- Badge style: default, destructive, secondary, outline
  discount_percentage integer, -- Discount percentage (0-100)
  discount_active boolean default false, -- Whether discount is active
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.products enable row level security;

-- Basic RLS policies: allow read for everyone (public storefront), block mutations by default
create policy if not exists products_read for select on public.products using (true);

-- Optional: Allow authenticated users with a specific role to write (customize as needed)
-- create policy products_write for insert on public.products to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- create policy products_update for update on public.products to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- create policy products_delete for delete on public.products to authenticated using (auth.role() = 'authenticated');

-- Helpful indexes
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_price on public.products (price);
create index if not exists idx_products_rating on public.products (rating);
create index if not exists idx_products_tags_gin on public.products using gin (tags);
create index if not exists idx_products_colors_gin on public.products using gin (colors);
create index if not exists idx_products_sizes_gin on public.products using gin (sizes);
create index if not exists idx_products_measurements_gin on public.products using gin (measurements_by_size);
