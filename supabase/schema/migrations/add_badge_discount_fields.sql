-- Migration: Add badge and discount fields to products table
-- Date: 2025-10-04
-- Description: Adds custom badge and discount functionality to products

-- Add badge and discount columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS badge_text text,
ADD COLUMN IF NOT EXISTS badge_variant text DEFAULT 'default',
ADD COLUMN IF NOT EXISTS discount_percentage integer,
ADD COLUMN IF NOT EXISTS discount_active boolean DEFAULT false;

-- Add check constraint to ensure discount_percentage is between 0 and 100
ALTER TABLE public.products 
ADD CONSTRAINT discount_percentage_range 
CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100));

-- Add comment to columns for documentation
COMMENT ON COLUMN public.products.badge_text IS 'Custom badge text to display on product card (e.g., "2x1", "NUEVO", "OFERTA")';
COMMENT ON COLUMN public.products.badge_variant IS 'Badge style variant: default, destructive, secondary, outline';
COMMENT ON COLUMN public.products.discount_percentage IS 'Discount percentage (0-100)';
COMMENT ON COLUMN public.products.discount_active IS 'Whether the discount is currently active';

-- Create index for filtering products with active discounts
CREATE INDEX IF NOT EXISTS idx_products_discount_active ON public.products (discount_active) WHERE discount_active = true;

-- Create index for products with badges
CREATE INDEX IF NOT EXISTS idx_products_badge_text ON public.products (badge_text) WHERE badge_text IS NOT NULL;
