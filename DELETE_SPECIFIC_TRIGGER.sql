-- =====================================================
-- Eliminar el trigger específico que está causando el error
-- =====================================================

-- Eliminar el trigger problemático
DROP TRIGGER IF EXISTS trigger_team_registration ON public.teams;

-- Eliminar la función asociada
DROP FUNCTION IF EXISTS public.notify_team_registration();

-- Verificar que se eliminó
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'teams'
AND trigger_name = 'trigger_team_registration';

-- Si no devuelve resultados = ✅ Trigger eliminado exitosamente
