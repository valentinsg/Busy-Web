-- Migration: Add ON UPDATE CASCADE to product_sizes foreign key
-- This allows changing product IDs without breaking references

-- Drop the existing foreign key constraint
ALTER TABLE public.product_sizes 
DROP CONSTRAINT IF EXISTS product_sizes_product_id_fkey;

-- Re-add the foreign key with ON UPDATE CASCADE
ALTER TABLE public.product_sizes
ADD CONSTRAINT product_sizes_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;
