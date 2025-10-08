-- =====================================================
-- COPIAR Y EJECUTAR TODO ESTE SQL EN SUPABASE
-- =====================================================

-- Agregar TODAS las columnas faltantes de una vez
ALTER TABLE public.popovers 
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'simple' NOT NULL,
  ADD COLUMN IF NOT EXISTS require_email boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS show_newsletter boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS cta_text text,
  ADD COLUMN IF NOT EXISTS cta_url text,
  ADD COLUMN IF NOT EXISTS delay_seconds integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS paths text[] DEFAULT '{}';

-- Verificar que todas las columnas existen
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'popovers'
ORDER BY ordinal_position;
