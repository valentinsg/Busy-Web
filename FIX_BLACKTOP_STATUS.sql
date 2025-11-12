-- FIX: Actualizar constraint de status en matches
-- Ejecutar esto en Supabase SQL Editor

-- 1. Eliminar constraint viejo
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_status_check;

-- 2. Actualizar valores existentes
UPDATE public.matches SET status = 
  CASE 
    WHEN status = 'scheduled' THEN 'pending'
    WHEN status = 'in_progress' THEN 'live'
    WHEN status = 'completed' THEN 'finished'
    ELSE status
  END
WHERE status IN ('scheduled', 'in_progress', 'completed');

-- 3. Agregar constraint nuevo
ALTER TABLE public.matches 
  ADD CONSTRAINT matches_status_check 
  CHECK (status IN ('pending', 'live', 'halftime', 'finished', 'cancelled'));

-- 4. Verificar
SELECT DISTINCT status FROM public.matches;
