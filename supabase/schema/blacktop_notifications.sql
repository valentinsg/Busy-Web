-- =====================================================
-- BLACKTOP NOTIFICATIONS SYSTEM
-- Sistema de notificaciones para torneos Blacktop
-- =====================================================

-- Tabla de notificaciones de Blacktop
create table if not exists public.blacktop_notifications (
  id uuid primary key default gen_random_uuid(),
  
  -- Tipo de notificación
  type text not null check (type in (
    'blacktop_team_registration',
    'blacktop_match_upcoming',
    'blacktop_match_result',
    'blacktop_tournament_update'
  )),
  
  -- Prioridad
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  
  -- Contenido
  title text not null,
  message text not null,
  
  -- Metadata (JSON con datos específicos del evento)
  metadata jsonb default '{}'::jsonb,
  
  -- Link de acción (ej: /admin/blacktop/[tournamentId])
  action_url text,
  
  -- Estado
  read boolean not null default false,
  read_at timestamptz,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

-- Índices para performance
create index if not exists idx_blacktop_notifications_type on public.blacktop_notifications(type);
create index if not exists idx_blacktop_notifications_priority on public.blacktop_notifications(priority);
create index if not exists idx_blacktop_notifications_read on public.blacktop_notifications(read);
create index if not exists idx_blacktop_notifications_created_at on public.blacktop_notifications(created_at desc);

-- RLS: Solo admins pueden ver notificaciones
alter table public.blacktop_notifications enable row level security;

create policy blacktop_notifications_admin_only 
  on public.blacktop_notifications 
  for all 
  using (true);

-- =====================================================
-- HELPER FUNCTION
-- =====================================================

-- Función para crear notificación de Blacktop
create or replace function public.create_blacktop_notification(
  p_type text,
  p_title text,
  p_message text,
  p_metadata jsonb default '{}'::jsonb,
  p_action_url text default null,
  p_priority text default 'medium'
) returns uuid
language plpgsql
security definer
as $$
declare
  v_notification_id uuid;
begin
  -- Crear notificación
  insert into public.blacktop_notifications (type, priority, title, message, metadata, action_url)
  values (p_type, p_priority, p_title, p_message, p_metadata, p_action_url)
  returning id into v_notification_id;
  
  return v_notification_id;
end;
$$;

-- =====================================================
-- TRIGGER: Nueva inscripción de equipo
-- NOTA: Deshabilitado porque las notificaciones se crean desde el código
-- =====================================================

-- Eliminar trigger si existe (las notificaciones se manejan desde la API)
drop trigger if exists trigger_notify_blacktop_team_registration on public.teams;

-- Función comentada - no se usa porque las notificaciones se crean manualmente
-- create or replace function public.notify_blacktop_team_registration()
-- returns trigger
-- language plpgsql
-- security definer
-- as $$
-- declare
--   v_tournament_name text;
-- begin
--   -- Obtener nombre del torneo
--   select name into v_tournament_name
--   from public.tournaments
--   where id = NEW.tournament_id;
--   
--   -- Insertar directamente en blacktop_notifications
--   insert into public.blacktop_notifications (type, priority, title, message, metadata, action_url)
--   values (
--     'blacktop_team_registration',
--     'medium',
--     '🏀 Nueva Inscripción: ' || NEW.name,
--     'Equipo inscrito en ' || coalesce(v_tournament_name, 'torneo') || ' - Capitán: ' || NEW.captain_name,
--     jsonb_build_object(
--       'team_id', NEW.id,
--       'team_name', NEW.name,
--       'tournament_id', NEW.tournament_id,
--       'tournament_name', v_tournament_name,
--       'captain_name', NEW.captain_name,
--       'captain_instagram', NEW.captain_instagram
--     ),
--     '/admin/blacktop/' || NEW.tournament_id
--   );
--   
--   return NEW;
-- end;
-- $$;

-- =====================================================
-- VIEWS
-- =====================================================

-- Vista: Notificaciones no leídas de Blacktop
create or replace view public.blacktop_unread_notifications as
select *
from public.blacktop_notifications
where read = false
order by priority desc, created_at desc;

-- Comentarios
comment on table public.blacktop_notifications is 'Notificaciones del sistema Blacktop';
comment on function public.create_blacktop_notification is 'Crea una notificación de Blacktop';
