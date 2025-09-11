create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  payment_id text not null,
  event_type text not null,
  raw jsonb,
  created_at timestamptz not null default now(),
  unique(payment_id, event_type)
);

alter table public.webhook_events enable row level security;
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'webhook_events'
      and policyname = 'webhook_events_read'
  ) then
    create policy webhook_events_read
      on public.webhook_events
      for select
      using (true);
  end if;
end
$$;
