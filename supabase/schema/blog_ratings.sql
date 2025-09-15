-- Blog ratings table
create table if not exists public.blog_ratings (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  rating int not null check (rating between 1 and 5),
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_blog_ratings_slug on public.blog_ratings(slug);
create unique index if not exists ux_blog_ratings_slug_iphash on public.blog_ratings(slug, ip_hash) where ip_hash is not null;

-- RLS optional: allow anon inserts only via edge function or service key; keep disabled by default
-- alter table public.blog_ratings enable row level security;
