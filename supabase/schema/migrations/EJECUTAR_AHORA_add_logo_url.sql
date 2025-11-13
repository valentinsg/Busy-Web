-- =====================================================
-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR
-- =====================================================
-- Este script agrega la columna logo_url a la tabla teams
-- que es necesaria para el registro de equipos con foto

-- 1. Agregar columna logo_url a la tabla teams
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Agregar comentario para documentar el campo
COMMENT ON COLUMN teams.logo_url IS 'URL del logo o foto del equipo subido a Supabase Storage';

-- 3. Verificar que la columna se creó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'teams' AND column_name = 'logo_url';

-- =====================================================
-- RESULTADO ESPERADO:
-- column_name | data_type | is_nullable
-- logo_url    | text      | YES
-- =====================================================
