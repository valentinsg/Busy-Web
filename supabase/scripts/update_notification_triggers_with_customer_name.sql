-- =====================================================
-- ACTUALIZACIÓN DE TRIGGERS DE NOTIFICACIONES
-- Agregar nombre del cliente en notificaciones de órdenes
-- =====================================================

-- Trigger: Nueva orden (con nombre de cliente)
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

-- Trigger: Transferencia pendiente (con nombre de cliente)
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

-- Trigger: Orden cancelada (con nombre de cliente)
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

-- =====================================================
-- COMENTARIOS
-- =====================================================

comment on function public.notify_new_order is 'Notifica nueva orden con nombre del cliente si está disponible';
comment on function public.notify_pending_transfer is 'Notifica transferencia pendiente con nombre del cliente si está disponible';
comment on function public.notify_order_cancelled is 'Notifica orden cancelada con nombre del cliente si está disponible';
