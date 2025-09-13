-- Authors table for blog posts
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  avatar_url text,
  bio text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.authors enable row level security;

-- Read policy (public read). You can later restrict to authenticated only if you prefer.
drop policy if exists authors_read on public.authors;
create policy authors_read on public.authors
for select
using (true);

create index if not exists idx_authors_active on public.authors (active);
create index if not exists idx_authors_created_at on public.authors (created_at);
