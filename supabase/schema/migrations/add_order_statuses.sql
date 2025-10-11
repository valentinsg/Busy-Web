-- Add 'shipped' and 'completed' statuses to orders
-- Run this in Supabase SQL Editor

-- Drop the existing check constraint
alter table public.orders drop constraint if exists orders_status_check;

-- Add new check constraint with all statuses
alter table public.orders 
  add constraint orders_status_check 
  check (status in ('pending', 'paid', 'shipped', 'completed', 'cancelled'));

-- Add triggers for shipped and completed notifications
create or replace function public.notify_order_shipped()
returns trigger
language plpgsql
security definer
as $$
begin
  if OLD.status != 'shipped' and NEW.status = 'shipped' then
    perform public.create_notification(
      'new_order',
      '📦 Orden Enviada',
      'Orden #' || substring(NEW.id::text, 1, 8) || ' está en camino',
      jsonb_build_object('order_id', NEW.id, 'total', NEW.total),
      '/admin/orders/' || NEW.id
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trigger_notify_order_shipped on public.orders;
create trigger trigger_notify_order_shipped
  after update on public.orders
  for each row
  execute function public.notify_order_shipped();

create or replace function public.notify_order_completed()
returns trigger
language plpgsql
security definer
as $$
begin
  if OLD.status != 'completed' and NEW.status = 'completed' then
    perform public.create_notification(
      'new_order',
      '✅ Orden Completada',
      'Orden #' || substring(NEW.id::text, 1, 8) || ' fue completada',
      jsonb_build_object('order_id', NEW.id, 'total', NEW.total),
      '/admin/orders/' || NEW.id
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trigger_notify_order_completed on public.orders;
create trigger trigger_notify_order_completed
  after update on public.orders
  for each row
  execute function public.notify_order_completed();
