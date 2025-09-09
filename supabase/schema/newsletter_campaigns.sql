create table if not exists public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  subject text not null,
  content text not null, -- markdown/plain for ahora
  status text not null default 'draft', -- draft | scheduled | sending | sent | failed
  target_status text[] not null default '{"subscribed"}', -- e.g., ["subscribed"]
  target_tags text[] not null default '{}',
  scheduled_at timestamptz,
  sent_count int not null default 0,
  error text
);

create index if not exists idx_campaigns_status on public.newsletter_campaigns(status);
create index if not exists idx_campaigns_scheduled on public.newsletter_campaigns(scheduled_at);
