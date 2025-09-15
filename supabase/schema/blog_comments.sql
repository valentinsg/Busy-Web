-- Blog comments table
create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  email text not null,
  message text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_blog_comments_slug on public.blog_comments(slug);
create index if not exists idx_blog_comments_approved on public.blog_comments(approved);

-- RLS optional; keep disabled by default and write through server key
-- alter table public.blog_comments enable row level security;
