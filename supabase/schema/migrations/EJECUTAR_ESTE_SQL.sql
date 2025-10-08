-- =====================================================
-- EJECUTAR ESTE SQL EN SUPABASE SQL EDITOR
-- =====================================================
-- Este script agrega TODAS las columnas faltantes a la tabla popovers
-- Es seguro ejecutarlo múltiples veces (solo agrega lo que falta)

-- 1. Agregar columna delay_seconds
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'delay_seconds'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN delay_seconds integer DEFAULT 0 NOT NULL;
    RAISE NOTICE 'Columna delay_seconds agregada';
  ELSE
    RAISE NOTICE 'Columna delay_seconds ya existe';
  END IF;
END $$;

-- 2. Agregar columna type
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN type text DEFAULT 'simple' NOT NULL;
    RAISE NOTICE 'Columna type agregada';
  ELSE
    RAISE NOTICE 'Columna type ya existe';
  END IF;
END $$;

-- 3. Agregar columna require_email
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'require_email'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN require_email boolean DEFAULT false NOT NULL;
    RAISE NOTICE 'Columna require_email agregada';
  ELSE
    RAISE NOTICE 'Columna require_email ya existe';
  END IF;
END $$;

-- 4. Agregar columna show_newsletter
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'show_newsletter'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN show_newsletter boolean DEFAULT false NOT NULL;
    RAISE NOTICE 'Columna show_newsletter agregada';
  ELSE
    RAISE NOTICE 'Columna show_newsletter ya existe';
  END IF;
END $$;

-- 5. Agregar columna cta_text
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'cta_text'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN cta_text text;
    RAISE NOTICE 'Columna cta_text agregada';
  ELSE
    RAISE NOTICE 'Columna cta_text ya existe';
  END IF;
END $$;

-- 6. Agregar columna cta_url
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'cta_url'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN cta_url text;
    RAISE NOTICE 'Columna cta_url agregada';
  ELSE
    RAISE NOTICE 'Columna cta_url ya existe';
  END IF;
END $$;

-- Agregar comentarios
COMMENT ON COLUMN public.popovers.delay_seconds IS 'Seconds to wait before showing the popover (0 = immediate, recommended 3-5 seconds)';
COMMENT ON COLUMN public.popovers.type IS 'Popover type: simple, discount, email-gate, newsletter, custom';
COMMENT ON COLUMN public.popovers.require_email IS 'Require email before showing discount code';
COMMENT ON COLUMN public.popovers.show_newsletter IS 'Show newsletter subscription form';
COMMENT ON COLUMN public.popovers.cta_text IS 'Call to action button text';
COMMENT ON COLUMN public.popovers.cta_url IS 'Call to action button URL';

-- Verificar todas las columnas
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'popovers'
ORDER BY ordinal_position;
