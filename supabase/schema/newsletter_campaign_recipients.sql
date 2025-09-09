create table if not exists public.newsletter_campaign_recipients (
  campaign_id uuid references public.newsletter_campaigns(id) on delete cascade,
  email text not null,
  status text not null default 'pending', -- pending | ready | skipped
  reason text,
  created_at timestamptz not null default now(),
  primary key (campaign_id, email)
);

create index if not exists idx_campaign_recipients_campaign on public.newsletter_campaign_recipients(campaign_id);
