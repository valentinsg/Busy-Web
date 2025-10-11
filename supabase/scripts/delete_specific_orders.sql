-- Script para eliminar órdenes específicas que quedaron atascadas
-- Reemplaza los IDs con los que necesites eliminar

-- Eliminar items de las órdenes específicas
DELETE FROM order_items 
WHERE order_id IN (
  SELECT id FROM orders 
  WHERE id LIKE '%3B3B7FC8%' OR id LIKE '%8C0A2634%'
);

-- Eliminar las órdenes específicas
DELETE FROM orders 
WHERE id LIKE '%3B3B7FC8%' OR id LIKE '%8C0A2634%';

-- Verificar que se eliminaron
SELECT COUNT(*) as remaining_pending_orders FROM orders WHERE status = 'pending';

-- Ver todas las órdenes pendientes restantes
SELECT id, total, status, placed_at FROM orders WHERE status = 'pending' ORDER BY placed_at DESC;
