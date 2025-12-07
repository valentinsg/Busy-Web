-- Migration: Add weight field to products table
-- Weight is stored in grams (integer)
-- Safe to run multiple times (idempotent)

-- Add weight column (nullable, in grams)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS weight integer;

-- Add comment for documentation
COMMENT ON COLUMN public.products.weight IS 'Product weight in grams. Used for shipping cost calculation. NULL means use default weight based on category.';

-- Create index for products with explicit weight (optional, for analytics)
CREATE INDEX IF NOT EXISTS idx_products_weight ON public.products(weight) WHERE weight IS NOT NULL;

-- Example: Update existing products with estimated weights based on category
-- Uncomment and run manually if you want to set initial weights
/*
UPDATE public.products SET weight = 220 WHERE category ILIKE '%remera%' AND weight IS NULL;
UPDATE public.products SET weight = 750 WHERE category ILIKE '%hoodie%' AND weight IS NULL;
UPDATE public.products SET weight = 750 WHERE category ILIKE '%buzo%' AND weight IS NULL;
UPDATE public.products SET weight = 500 WHERE category ILIKE '%pantalon%' AND weight IS NULL;
UPDATE public.products SET weight = 500 WHERE category ILIKE '%jogger%' AND weight IS NULL;
UPDATE public.products SET weight = 200 WHERE category ILIKE '%gorra%' AND weight IS NULL;
UPDATE public.products SET weight = 50 WHERE category ILIKE '%accesorio%' AND weight IS NULL;
*/
