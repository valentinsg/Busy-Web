-- =====================================================
-- NOTIFICATIONS SYSTEM
-- Sistema completo de notificaciones personalizadas
-- =====================================================

-- Tabla principal de notificaciones
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  
  -- Tipo de notificación
  type text not null check (type in (
    'new_order',
    'pending_transfer',
    'artist_submission',
    'low_stock',
    'newsletter_subscription',
    'order_cancelled',
    'payment_error',
    'weekly_report',
    'monthly_report',
    'newsletter_reminder'
  )),
  
  -- Prioridad
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  
  -- Contenido
  title text not null,
  message text not null,
  
  -- Metadata (JSON con datos específicos del evento)
  metadata jsonb default '{}'::jsonb,
  
  -- Link de acción (ej: /admin/orders/[orderId])
  action_url text,
  
  -- Estado
  read boolean not null default false,
  read_at timestamptz,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  expires_at timestamptz -- Opcional: auto-eliminar notificaciones antiguas
);

-- Índices para performance
create index if not exists idx_notifications_type on public.notifications(type);
create index if not exists idx_notifications_priority on public.notifications(priority);
create index if not exists idx_notifications_read on public.notifications(read);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);
create index if not exists idx_notifications_expires_at on public.notifications(expires_at) where expires_at is not null;

-- RLS: Solo admins pueden ver notificaciones
alter table public.notifications enable row level security;

-- Drop policy if exists and recreate
do $$ 
begin
  drop policy if exists notifications_admin_only on public.notifications;
exception when undefined_object then
  null;
end $$;

create policy notifications_admin_only 
  on public.notifications 
  for all 
  using (true); -- Ajustar según tu auth

-- =====================================================
-- PREFERENCIAS DE NOTIFICACIONES
-- =====================================================

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  
  -- Tipo de notificación
  notification_type text not null unique check (notification_type in (
    'new_order',
    'pending_transfer',
    'artist_submission',
    'low_stock',
    'newsletter_subscription',
    'order_cancelled',
    'payment_error',
    'weekly_report',
    'monthly_report',
    'newsletter_reminder'
  )),
  
  -- Canales habilitados
  enabled boolean not null default true,
  push_enabled boolean not null default true,
  email_enabled boolean not null default false, -- Para futuro
  
  -- Configuración específica
  config jsonb default '{}'::jsonb, -- Ej: { "stock_threshold": 5 }
  
  updated_at timestamptz not null default now()
);

-- Agregar columna priority a preferences (ANTES de insertar datos)
alter table public.notification_preferences 
  add column if not exists priority text not null default 'medium' 
  check (priority in ('low', 'medium', 'high', 'critical'));

-- Insertar preferencias por defecto
insert into public.notification_preferences (notification_type, enabled, push_enabled, priority, config)
values
  ('new_order', true, true, 'high', '{}'),
  ('pending_transfer', true, true, 'high', '{}'),
  ('artist_submission', true, true, 'medium', '{}'),
  ('low_stock', true, true, 'high', '{"threshold": 5}'),
  ('newsletter_subscription', true, true, 'low', '{}'),
  ('order_cancelled', true, true, 'medium', '{}'),
  ('payment_error', true, true, 'high', '{}'),
  ('weekly_report', true, false, 'low', '{"day": "monday"}'),
  ('monthly_report', true, false, 'low', '{"day": 1}'),
  ('newsletter_reminder', true, false, 'low', '{"days_since_last": 7}')
on conflict (notification_type) do nothing;

-- =====================================================
-- PUSH SUBSCRIPTIONS (Web Push API)
-- =====================================================

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  
  -- Subscription data (del browser)
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  
  -- Metadata
  user_agent text,
  last_used_at timestamptz not null default now(),
  
  created_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_endpoint on public.push_subscriptions(endpoint);

alter table public.push_subscriptions enable row level security;

-- Drop policy if exists and recreate
do $$ 
begin
  drop policy if exists push_subscriptions_admin_only on public.push_subscriptions;
exception when undefined_object then
  null;
end $$;

create policy push_subscriptions_admin_only 
  on public.push_subscriptions 
  for all 
  using (true);

-- =====================================================
-- NOTIFICATION LOGS (Auditoría)
-- =====================================================

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid references public.notifications(id) on delete cascade,
  
  -- Resultado del envío
  channel text not null check (channel in ('push', 'email', 'sms')),
  status text not null check (status in ('pending', 'sent', 'failed', 'expired')),
  error_message text,
  
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notification_logs_notification_id on public.notification_logs(notification_id);
create index if not exists idx_notification_logs_status on public.notification_logs(status);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Función para crear notificación
create or replace function public.create_notification(
  p_type text,
  p_title text,
  p_message text,
  p_metadata jsonb default '{}'::jsonb,
  p_action_url text default null
) returns uuid
language plpgsql
security definer
as $$
declare
  v_notification_id uuid;
  v_priority text;
  v_enabled boolean;
begin
  -- Obtener preferencias
  select priority, enabled into v_priority, v_enabled
  from public.notification_preferences
  where notification_type = p_type;
  
  -- Si está deshabilitado, no crear
  if not v_enabled then
    return null;
  end if;
  
  -- Crear notificación
  insert into public.notifications (type, priority, title, message, metadata, action_url)
  values (p_type, coalesce(v_priority, 'medium'), p_title, p_message, p_metadata, p_action_url)
  returning id into v_notification_id;
  
  return v_notification_id;
end;
$$;

-- Función para marcar como leída
create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language sql
security definer
as $$
  update public.notifications
  set read = true, read_at = now()
  where id = p_notification_id;
$$;

-- Función para limpiar notificaciones antiguas (ejecutar con cron)
create or replace function public.cleanup_old_notifications()
returns void
language sql
security definer
as $$
  delete from public.notifications
  where (expires_at is not null and expires_at < now())
     or (read = true and read_at < now() - interval '30 days');
$$;

-- =====================================================
-- TRIGGERS AUTOMÁTICOS
-- =====================================================

-- Trigger: Nueva orden
create or replace function public.notify_new_order()
returns trigger
language plpgsql
security definer
as $$
declare
  v_customer_name text;
begin
  -- Solo notificar órdenes pagadas
  if NEW.status = 'paid' then
    -- Obtener nombre del cliente si existe
    if NEW.customer_id is not null then
      select full_name into v_customer_name
      from public.customers
      where id = NEW.customer_id;
    end if;
    
    perform public.create_notification(
      'new_order',
      '🛍️ Nueva Orden #' || substring(NEW.id::text, 1, 8),
      case 
        when v_customer_name is not null then
          v_customer_name || ' - Total: ' || NEW.currency || ' ' || NEW.total || ' - Canal: ' || NEW.channel
        else
          'Total: ' || NEW.currency || ' ' || NEW.total || ' - Canal: ' || NEW.channel
      end,
      jsonb_build_object(
        'order_id', NEW.id,
        'total', NEW.total,
        'channel', NEW.channel,
        'customer_id', NEW.customer_id,
        'customer_name', v_customer_name
      ),
      '/admin/orders/' || NEW.id
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trigger_notify_new_order on public.orders;
create trigger trigger_notify_new_order
  after insert on public.orders
  for each row
  execute function public.notify_new_order();

-- Trigger: Transferencia pendiente
create or replace function public.notify_pending_transfer()
returns trigger
language plpgsql
security definer
as $$
declare
  v_customer_name text;
begin
  if NEW.payment_method = 'transfer' and NEW.status = 'pending' then
    -- Obtener nombre del cliente si existe
    if NEW.customer_id is not null then
      select full_name into v_customer_name
      from public.customers
      where id = NEW.customer_id;
    end if;
    
    perform public.create_notification(
      'pending_transfer',
      '💳 Transferencia Pendiente',
      case 
        when v_customer_name is not null then
          v_customer_name || ' - Orden #' || substring(NEW.id::text, 1, 8) || ' esperando confirmación'
        else
          'Orden #' || substring(NEW.id::text, 1, 8) || ' esperando confirmación'
      end,
      jsonb_build_object(
        'order_id', NEW.id, 
        'total', NEW.total,
        'customer_name', v_customer_name
      ),
      '/admin/orders/' || NEW.id
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trigger_notify_pending_transfer on public.orders;
create trigger trigger_notify_pending_transfer
  after insert or update on public.orders
  for each row
  execute function public.notify_pending_transfer();

-- Trigger: Nueva propuesta de artista
create or replace function public.notify_artist_submission()
returns trigger
language plpgsql
security definer
as $$
begin
  perform public.create_notification(
    'artist_submission',
    '🎵 Nueva Propuesta de Artista',
    NEW.artist_name || ' quiere colaborar - Género: ' || coalesce(NEW.genre, 'N/A'),
    jsonb_build_object(
      'submission_id', NEW.id,
      'artist_name', NEW.artist_name,
      'email', NEW.email,
      'genre', NEW.genre
    ),
    '/admin/artist-submissions'
  );
  return NEW;
end;
$$;

drop trigger if exists trigger_notify_artist_submission on public.artist_submissions;
create trigger trigger_notify_artist_submission
  after insert on public.artist_submissions
  for each row
  execute function public.notify_artist_submission();

-- Trigger: Stock bajo
create or replace function public.notify_low_stock()
returns trigger
language plpgsql
security definer
as $$
declare
  v_threshold int;
begin
  -- Obtener threshold de config
  select (config->>'threshold')::int into v_threshold
  from public.notification_preferences
  where notification_type = 'low_stock';
  
  v_threshold := coalesce(v_threshold, 5);
  
  -- Solo notificar si cruza el threshold (de arriba hacia abajo)
  if OLD.stock > v_threshold and NEW.stock <= v_threshold then
    perform public.create_notification(
      'low_stock',
      '⚠️ Stock Bajo: ' || NEW.name,
      'Solo quedan ' || NEW.stock || ' unidades',
      jsonb_build_object(
        'product_id', NEW.id,
        'product_name', NEW.name,
        'stock', NEW.stock,
        'sku', NEW.sku
      ),
      '/admin/products/' || NEW.id
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trigger_notify_low_stock on public.products;
create trigger trigger_notify_low_stock
  after update on public.products
  for each row
  when (OLD.stock is distinct from NEW.stock)
  execute function public.notify_low_stock();

-- Trigger: Nueva suscripción newsletter
create or replace function public.notify_newsletter_subscription()
returns trigger
language plpgsql
security definer
as $$
begin
  if NEW.status = 'subscribed' then
    perform public.create_notification(
      'newsletter_subscription',
      '📧 Nueva Suscripción Newsletter',
      NEW.email || ' se suscribió',
      -- newsletter_subscribers no tiene columna id; usar email en metadata
      jsonb_build_object('email', NEW.email, 'subscriber_email', NEW.email),
      '/admin/newsletter'
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trigger_notify_newsletter_subscription on public.newsletter_subscribers;
create trigger trigger_notify_newsletter_subscription
  after insert on public.newsletter_subscribers
  for each row
  execute function public.notify_newsletter_subscription();

-- Trigger: Orden cancelada
create or replace function public.notify_order_cancelled()
returns trigger
language plpgsql
security definer
as $$
declare
  v_customer_name text;
begin
  if OLD.status != 'cancelled' and NEW.status = 'cancelled' then
    -- Obtener nombre del cliente si existe
    if NEW.customer_id is not null then
      select full_name into v_customer_name
      from public.customers
      where id = NEW.customer_id;
    end if;
    
    perform public.create_notification(
      'order_cancelled',
      '❌ Orden Cancelada',
      case 
        when v_customer_name is not null then
          v_customer_name || ' - Orden #' || substring(NEW.id::text, 1, 8) || ' fue cancelada'
        else
          'Orden #' || substring(NEW.id::text, 1, 8) || ' fue cancelada'
      end,
      jsonb_build_object(
        'order_id', NEW.id, 
        'total', NEW.total,
        'customer_name', v_customer_name
      ),
      '/admin/orders/' || NEW.id
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trigger_notify_order_cancelled on public.orders;
create trigger trigger_notify_order_cancelled
  after update on public.orders
  for each row
  when (OLD.status is distinct from NEW.status)
  execute function public.notify_order_cancelled();

-- =====================================================
-- VIEWS ÚTILES
-- =====================================================

-- Vista: Notificaciones no leídas
create or replace view public.unread_notifications as
select *
from public.notifications
where read = false
order by priority desc, created_at desc;

-- Vista: Resumen por tipo
create or replace view public.notification_summary as
select
  type,
  count(*) as total,
  count(*) filter (where read = false) as unread,
  max(created_at) as last_notification
from public.notifications
group by type;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

comment on table public.notifications is 'Notificaciones personalizadas del sistema';
comment on table public.notification_preferences is 'Preferencias de notificaciones por tipo';
comment on table public.push_subscriptions is 'Suscripciones Web Push API';
comment on table public.notification_logs is 'Log de envíos de notificaciones';

comment on function public.create_notification is 'Crea una notificación respetando preferencias';
comment on function public.mark_notification_read is 'Marca notificación como leída';
comment on function public.cleanup_old_notifications is 'Limpia notificaciones antiguas (ejecutar con cron)';
