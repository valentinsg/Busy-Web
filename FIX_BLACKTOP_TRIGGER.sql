-- =====================================================
-- FIX: Eliminar trigger problemático de blacktop_notifications
-- Ejecutar este SQL en Supabase Dashboard > SQL Editor
-- =====================================================

-- Eliminar el trigger que está causando el error
drop trigger if exists trigger_notify_blacktop_team_registration on public.teams;

-- Eliminar la función si existe
drop function if exists public.notify_blacktop_team_registration();

-- Verificar que se eliminó correctamente
select 
  trigger_name, 
  event_object_table, 
  action_statement
from information_schema.triggers
where trigger_name = 'trigger_notify_blacktop_team_registration';

-- Si no devuelve resultados, el trigger fue eliminado exitosamente
