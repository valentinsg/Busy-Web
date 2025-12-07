-- Add is_active column to products table for soft delete / visibility toggle
-- Default is true so existing products remain visible

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create index for filtering active products
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- Comment for documentation
COMMENT ON COLUMN public.products.is_active IS 'Whether the product is visible in the store. False = hidden/deactivated.';
