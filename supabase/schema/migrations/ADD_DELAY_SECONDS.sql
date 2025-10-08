-- Agregar delay_seconds (la única columna que falta)
ALTER TABLE public.popovers ADD COLUMN IF NOT EXISTS delay_seconds integer DEFAULT 0 NOT NULL;

-- Verificar
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'popovers'
  AND column_name = 'delay_seconds';
