create table if not exists public.newsletter_subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Public can subscribe (insert) by default; you can tighten later if needed
drop policy if exists newsletter_read on public.newsletter_subscribers;
drop policy if exists newsletter_subscribe on public.newsletter_subscribers;
create policy newsletter_read on public.newsletter_subscribers for select using (true);
create policy newsletter_subscribe on public.newsletter_subscribers for insert with check (true);

-- Advanced fields for admin features
alter table public.newsletter_subscribers
  add column if not exists status text not null default 'pending', -- pending | subscribed | unsubscribed
  add column if not exists token text, -- confirmation token for opt-in
  add column if not exists tags text[] not null default '{}';

-- Useful indexes
create index if not exists idx_newsletter_status on public.newsletter_subscribers (status);
create index if not exists idx_newsletter_created_at on public.newsletter_subscribers (created_at desc);
create index if not exists idx_newsletter_tags on public.newsletter_subscribers using gin (tags);
