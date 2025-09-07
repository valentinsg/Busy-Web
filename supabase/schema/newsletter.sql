create table if not exists public.newsletter_subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Public can subscribe (insert) by default; you can tighten later if needed
create policy if not exists newsletter_read for select on public.newsletter_subscribers using (true);
create policy if not exists newsletter_subscribe for insert on public.newsletter_subscribers using (true) with check (true);
