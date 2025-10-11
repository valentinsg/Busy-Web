-- =====================================================
-- UPDATE NOTIFICATION TRIGGERS WITH PAYMENT INFO
-- Agregar payment_method y status al metadata
-- =====================================================

-- Trigger: Nueva orden (ACTUALIZADO con payment_method y status)
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
        'customer_name', v_customer_name,
        'payment_method', NEW.payment_method,
        'status', NEW.status
      ),
      '/admin/orders/' || NEW.id
    );
  end if;
  return NEW;
end;
$$;

-- Recrear trigger
drop trigger if exists trigger_notify_new_order on public.orders;
create trigger trigger_notify_new_order
  after insert on public.orders
  for each row
  execute function public.notify_new_order();

-- =====================================================
-- HABILITAR EMAILS PARA TODOS LOS TIPOS IMPORTANTES
-- =====================================================

UPDATE notification_preferences 
SET email_enabled = true 
WHERE notification_type IN (
  'new_order',
  'pending_transfer',
  'artist_submission',
  'low_stock',
  'order_cancelled',
  'newsletter_subscription'
);

-- Verificar estado
SELECT 
  notification_type,
  enabled,
  push_enabled,
  email_enabled,
  priority
FROM notification_preferences
ORDER BY 
  CASE priority
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  notification_type;
