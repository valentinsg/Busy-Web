create table if not exists public.popovers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  discount_code text,
  enabled boolean not null default true,
  priority int not null default 0,
  start_at timestamptz,
  end_at timestamptz,
  sections text[] default '{}', -- e.g. ['home','products','blog']
  paths text[] default '{}',    -- e.g. ['/products', '/blog'] - prefix match
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_popovers_enabled on public.popovers(enabled);
create index if not exists idx_popovers_window on public.popovers(start_at, end_at);
create index if not exists idx_popovers_priority on public.popovers(priority desc);

-- simple updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_popovers_set_updated_at on public.popovers;
create trigger trg_popovers_set_updated_at
before update on public.popovers
for each row execute function public.set_updated_at();
