-- Function to increment product stock (for order cancellations)
create or replace function increment_product_stock(
  p_product_id uuid,
  p_size text,
  p_qty integer
) returns void as $$
begin
  -- If size is provided, increment size-specific stock
  if p_size is not null and p_size != '' then
    update product_variants
    set stock = stock + p_qty
    where product_id = p_product_id and size = p_size;
  end if;
  
  -- Always increment total product stock
  update products
  set stock = stock + p_qty
  where id = p_product_id;
end;
$$ language plpgsql;

-- Grant execute permission
grant execute on function increment_product_stock(uuid, text, integer) to authenticated, anon;
