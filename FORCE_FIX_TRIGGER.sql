-- =====================================================
-- FIX DEFINITIVO: Eliminar TODO lo relacionado con triggers de blacktop
-- Ejecutar este SQL en Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Eliminar TODOS los triggers en la tabla teams que contengan "blacktop"
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'teams' 
        AND trigger_name LIKE '%blacktop%'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON public.teams CASCADE';
    END LOOP;
END $$;

-- 2. Eliminar TODAS las funciones que contengan "blacktop" y "notification"
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name LIKE '%blacktop%notification%'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || r.routine_name || ' CASCADE';
    END LOOP;
END $$;

-- 3. Verificación: Listar todos los triggers en teams
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'teams'
ORDER BY trigger_name;

-- 4. Verificación: Listar funciones relacionadas con blacktop
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%blacktop%'
ORDER BY routine_name;

-- Si las verificaciones no devuelven resultados = ✅ TODO LIMPIO
