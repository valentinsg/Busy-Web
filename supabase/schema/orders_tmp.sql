  -- Temporary orders snapshot table for Mercado Pago webhook
  -- Stores latest payment state per session_id to be consumed by /api/mp/order-status

  create table if not exists public.orders_tmp (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    session_id text not null,
    payment_id text,
    status text,
    status_detail text,
    preference_id text,
    merchant_order_id text,
    raw jsonb
  );

  -- Composite index to efficiently get last record by session
  create index if not exists idx_orders_tmp_session_created_at
    on public.orders_tmp (session_id, created_at desc);
