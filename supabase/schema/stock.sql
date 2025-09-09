-- Utility function to decrement stock safely
-- If size is provided, decrement from product_sizes; always also update products.stock if present
create or replace function public.decrement_product_stock(
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

  if p_size is not null then
    update public.product_sizes
      set stock = greatest(0, stock - p_qty),
          updated_at = now()
      where product_id = p_product_id and size = p_size;
  end if;

  -- Update aggregate stock on products if you use it
  update public.products
    set stock = greatest(0, coalesce(stock, 0) - p_qty)
    where id = p_product_id;
end;
$$;
