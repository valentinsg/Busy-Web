-- Function to increment product stock (for order cancellations/refunds)
-- Mirrors decrement_product_stock but adds instead of subtracts
create or replace function public.increment_product_stock(
  p_product_id text,
  p_size text,
  p_qty integer
) returns void
language plpgsql
as $$
begin
  if p_qty is null or p_qty <= 0 then
    return;
  end if;

  -- If size is provided, increment size-specific stock in product_sizes
  if p_size is not null then
    update public.product_sizes
      set stock = stock + p_qty,
          updated_at = now()
      where product_id = p_product_id and size = p_size;
  end if;

  -- Always increment aggregate stock on products
  update public.products
    set stock = coalesce(stock, 0) + p_qty
    where id = p_product_id;
end;
$$;

-- Grant execute permission
grant execute on function public.increment_product_stock(text, text, integer) to authenticated, anon, service_role;
