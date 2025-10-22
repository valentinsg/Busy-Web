-- Authors table for blog posts and admin users
create table if not exists public.authors (
  id text primary key, -- slug-like id (e.g., 'valentin-sg')
  name text not null,
  email text unique,
  avatar_url text,
  bio text,
  instagram text,
  twitter text,
  linkedin text,
  medium text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.authors enable row level security;

-- Read policy (public read for active authors)
drop policy if exists authors_read on public.authors;
create policy authors_read on public.authors
for select
using (active = true);

-- Admin users can update their own profile
drop policy if exists authors_update_own on public.authors;
create policy authors_update_own on public.authors
for update
using (auth.jwt() ->> 'email' = email);

-- Admin users can insert/update/delete (requires service role or custom function)
drop policy if exists authors_admin_all on public.authors;
create policy authors_admin_all on public.authors
for all
using (
  exists (
    select 1 from auth.users
    where auth.users.id = auth.uid()
    and auth.users.email in (
      'sanchezguevara.valentin@gmail.com',
      'agustinmancho5@gmail.com'
    )
  )
);

create index if not exists idx_authors_active on public.authors (active);
create index if not exists idx_authors_email on public.authors (email);
create index if not exists idx_authors_created_at on public.authors (created_at);
