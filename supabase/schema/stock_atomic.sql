-- Improved stock decrement function with row-level locking to prevent race conditions
-- This replaces the basic decrement_product_stock function

CREATE OR REPLACE FUNCTION public.decrement_product_stock(
  p_product_id text,
  p_size text,
  p_qty integer
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_stock integer;
  v_new_stock integer;
  v_size_stock integer;
  v_result jsonb;
BEGIN
  IF p_qty IS NULL OR p_qty <= 0 THEN
    RETURN jsonb_build_object('success', true, 'message', 'No quantity to decrement');
  END IF;

  -- Lock and update size-specific stock if size is provided
  IF p_size IS NOT NULL THEN
    -- Lock the row for update to prevent race conditions
    SELECT stock INTO v_size_stock
    FROM public.product_sizes
    WHERE product_id = p_product_id AND size = p_size
    FOR UPDATE;

    IF v_size_stock IS NOT NULL THEN
      v_new_stock := GREATEST(0, v_size_stock - p_qty);

      UPDATE public.product_sizes
      SET stock = v_new_stock,
          updated_at = now()
      WHERE product_id = p_product_id AND size = p_size;
    END IF;
  END IF;

  -- Lock and update aggregate stock on products table
  SELECT stock INTO v_current_stock
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF v_current_stock IS NOT NULL THEN
    v_new_stock := GREATEST(0, COALESCE(v_current_stock, 0) - p_qty);

    UPDATE public.products
    SET stock = v_new_stock
    WHERE id = p_product_id;
  END IF;

  v_result := jsonb_build_object(
    'success', true,
    'product_id', p_product_id,
    'size', p_size,
    'quantity_decremented', p_qty,
    'previous_stock', v_current_stock,
    'new_stock', v_new_stock
  );

  RETURN v_result;
END;
$$;

-- Improved increment function for refunds/cancellations
CREATE OR REPLACE FUNCTION public.increment_product_stock(
  p_product_id text,
  p_size text,
  p_qty integer
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_stock integer;
  v_new_stock integer;
  v_result jsonb;
BEGIN
  IF p_qty IS NULL OR p_qty <= 0 THEN
    RETURN jsonb_build_object('success', true, 'message', 'No quantity to increment');
  END IF;

  -- Lock and update size-specific stock if size is provided
  IF p_size IS NOT NULL THEN
    UPDATE public.product_sizes
    SET stock = stock + p_qty,
        updated_at = now()
    WHERE product_id = p_product_id AND size = p_size;
  END IF;

  -- Lock and update aggregate stock
  SELECT stock INTO v_current_stock
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  v_new_stock := COALESCE(v_current_stock, 0) + p_qty;

  UPDATE public.products
  SET stock = v_new_stock
  WHERE id = p_product_id;

  v_result := jsonb_build_object(
    'success', true,
    'product_id', p_product_id,
    'size', p_size,
    'quantity_incremented', p_qty,
    'previous_stock', v_current_stock,
    'new_stock', v_new_stock
  );

  RETURN v_result;
END;
$$;

-- Improved process_order_paid with better error handling and logging
CREATE OR REPLACE FUNCTION public.process_order_paid(
  p_order_id uuid,
  p_payment_id text
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_status text;
  v_item record;
  v_stock_result jsonb;
  v_items_processed integer := 0;
  v_result jsonb;
BEGIN
  -- Lock order row to prevent concurrent updates
  SELECT status INTO v_order_status
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF v_order_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- Only process if order is in created or pending status
  IF v_order_status NOT IN ('created', 'pending') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order already processed',
      'current_status', v_order_status
    );
  END IF;

  -- Decrement stock for each item
  FOR v_item IN
    SELECT oi.product_id, oi.variant_size, oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    v_stock_result := public.decrement_product_stock(
      v_item.product_id,
      v_item.variant_size,
      v_item.quantity
    );
    v_items_processed := v_items_processed + 1;
  END LOOP;

  -- Mark order as paid
  UPDATE public.orders
  SET
    status = 'paid',
    payment_id = p_payment_id,
    paid_at = now(),
    updated_at = now()
  WHERE id = p_order_id;

  v_result := jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'payment_id', p_payment_id,
    'items_processed', v_items_processed,
    'new_status', 'paid'
  );

  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.decrement_product_stock(text, text, integer) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.increment_product_stock(text, text, integer) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.process_order_paid(uuid, text) TO authenticated, anon, service_role;
