-- Process order on approved payment: transactional stock decrement and status update
-- This function assumes order_items rows exist with (product_id, variant_size, quantity, unit_price)
create or replace function public.process_order_paid(p_order_id uuid, p_payment_id text)
returns void
language plpgsql
as $$
begin
  -- lock order row to prevent concurrent updates
  perform 1 from public.orders where id = p_order_id for update;

  -- only process if order is in created or pending
  if exists (
    select 1 from public.orders where id = p_order_id and status in ('created','pending')
  ) then
    -- decrement stock per item
    for r in
      select oi.product_id, oi.variant_size, oi.quantity
      from public.order_items oi where oi.order_id = p_order_id
    loop
      perform public.decrement_product_stock(r.product_id, r.variant_size, r.quantity);
    end loop;

    -- mark as paid
    update public.orders
      set status='paid', payment_id=p_payment_id, paid_at=now(), updated_at=now()
      where id = p_order_id;
  end if;
end;
$$;
