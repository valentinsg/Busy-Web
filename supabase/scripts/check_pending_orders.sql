-- Script para verificar órdenes pendientes en la base de datos

-- Ver todas las órdenes pendientes
SELECT 
  id,
  status,
  total,
  placed_at,
  LEFT(notes, 50) as notes_preview
FROM orders 
WHERE status = 'pending'
ORDER BY placed_at DESC;

-- Contar órdenes por status
SELECT 
  status,
  COUNT(*) as count
FROM orders
GROUP BY status;

-- Ver TODAS las órdenes (últimas 10)
SELECT 
  id,
  status,
  total,
  placed_at
FROM orders
ORDER BY placed_at DESC
LIMIT 10;
