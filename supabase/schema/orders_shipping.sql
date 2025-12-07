-- Migration: Add shipping fields to orders table for Envia.com integration
-- Safe to run multiple times (idempotent)

-- Add shipping address as JSONB (stores full address object)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_address jsonb;

-- Add carrier information
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS carrier text;

-- Add tracking number from shipping provider
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tracking_number text;

-- Add URL to shipping label PDF
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS label_url text;

-- Add shipping status (separate from order status)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_status text DEFAULT 'pending';

-- Add shipping provider order/shipment ID (for API reference)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipment_id text;

-- Add actual shipping cost charged (may differ from estimate)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_cost_actual numeric(12,2);

-- Add shipped_at timestamp
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipped_at timestamptz;

-- Add delivered_at timestamp
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- Create index for shipping status queries
CREATE INDEX IF NOT EXISTS idx_orders_shipping_status ON public.orders(shipping_status);

-- Create index for tracking number lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);

-- Add constraint for shipping_status values
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND constraint_type = 'CHECK'
      AND constraint_name = 'orders_shipping_status_check'
  ) THEN
    ALTER TABLE public.orders DROP CONSTRAINT orders_shipping_status_check;
  END IF;
EXCEPTION WHEN undefined_object THEN
  NULL;
END $$;

ALTER TABLE public.orders
ADD CONSTRAINT orders_shipping_status_check
CHECK (shipping_status IS NULL OR shipping_status IN (
  'pending',      -- Waiting for label generation
  'label_created', -- Label generated, ready to ship
  'shipped',      -- Package handed to carrier
  'in_transit',   -- In transit
  'out_for_delivery', -- Out for delivery
  'delivered',    -- Delivered
  'failed',       -- Delivery failed
  'returned'      -- Returned to sender
));

-- Comment on columns for documentation
COMMENT ON COLUMN public.orders.shipping_address IS 'Full shipping address as JSON: {street, city, state, postal_code, country, phone, name}';
COMMENT ON COLUMN public.orders.carrier IS 'Shipping carrier name (e.g., andreani, oca, correo_argentino)';
COMMENT ON COLUMN public.orders.tracking_number IS 'Tracking number from carrier';
COMMENT ON COLUMN public.orders.label_url IS 'URL to download shipping label PDF';
COMMENT ON COLUMN public.orders.shipping_status IS 'Current shipping status';
COMMENT ON COLUMN public.orders.shipment_id IS 'Envia.com shipment ID for API reference';
COMMENT ON COLUMN public.orders.shipping_cost_actual IS 'Actual shipping cost charged by carrier';
COMMENT ON COLUMN public.orders.shipped_at IS 'Timestamp when package was shipped';
COMMENT ON COLUMN public.orders.delivered_at IS 'Timestamp when package was delivered';
