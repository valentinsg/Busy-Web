-- Agregar campo discount_percent a popovers para especificar el % de descuento
ALTER TABLE public.popovers ADD COLUMN IF NOT EXISTS discount_percent integer DEFAULT 10 CHECK (discount_percent BETWEEN 1 AND 100);

COMMENT ON COLUMN public.popovers.discount_percent IS 'Percentage discount for the coupon code (1-100)';

-- Verificar
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'popovers'
  AND column_name = 'discount_percent';
