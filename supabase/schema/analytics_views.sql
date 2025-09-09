-- Aggregation views to power dashboard analytics

-- Customer stats: total spend, orders count, last purchase
create or replace view public.customer_stats as
select
  c.id as customer_id,
  c.email,
  c.full_name,
  count(o.id) as orders_count,
  coalesce(sum(o.total), 0)::numeric(14,2) as total_spent,
  max(o.placed_at) as last_purchase_at
from public.customers c
left join public.orders o on o.customer_id = c.id
group by c.id, c.email, c.full_name;

-- Product popularity combining views and sales
create or replace view public.product_popularity as
with views as (
  select
    pv.product_id,
    count(*) filter (where pv.action = 'view') as views,
    count(*) filter (where pv.action = 'click') as clicks,
    count(*) filter (where pv.action = 'add_to_cart') as add_to_carts,
    count(*) filter (where pv.action = 'purchase') as purchase_events
  from public.product_views pv
  group by pv.product_id
),
orders as (
  select
    oi.product_id,
    count(distinct oi.order_id) as orders_count,
    sum(oi.quantity) as quantity_sold,
    sum(oi.total) as revenue
  from public.order_items oi
  group by oi.product_id
)
select
  p.id as product_id,
  p.name,
  coalesce(v.views, 0) as views,
  coalesce(v.clicks, 0) as clicks,
  coalesce(v.add_to_carts, 0) as add_to_carts,
  coalesce(v.purchase_events, 0) as purchase_events,
  coalesce(o.orders_count, 0) as orders_count,
  coalesce(o.quantity_sold, 0) as quantity_sold,
  coalesce(o.revenue, 0)::numeric(14,2) as revenue
from public.products p
left join views v on v.product_id = p.id
left join orders o on o.product_id = p.id;

-- RLS for views (read-only)
alter view public.customer_stats owner to postgres;
alter view public.product_popularity owner to postgres;

-- Grant select to anon/authenticated roles by default; adjust as needed
grant select on public.customer_stats to anon, authenticated;
grant select on public.product_popularity to anon, authenticated;
