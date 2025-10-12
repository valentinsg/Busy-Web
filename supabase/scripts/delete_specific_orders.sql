-- Script para eliminar órdenes específicas de prueba
-- PASO 1: Ver todas las órdenes para identificar las de prueba
-- Descomenta la siguiente línea para ver todas las órdenes:
-- SELECT id, total, status, placed_at, customer_id FROM orders ORDER BY placed_at DESC;

-- PASO 2: Ver órdenes por fecha específica (ejemplo: 9 de octubre de 2025)
-- Descomenta para ver órdenes de una fecha específica:
-- SELECT id, total, status, placed_at FROM orders 
-- WHERE DATE(placed_at) = '2025-10-09' 
-- ORDER BY placed_at DESC;

-- PASO 3: ELIMINAR órdenes por fecha específica
-- ADVERTENCIA: Esto eliminará TODAS las órdenes de la fecha especificada
-- Reemplaza '2025-10-09' con la fecha que necesites

-- Primero eliminar los items de las órdenes
DELETE FROM order_items 
WHERE order_id IN (
  SELECT id FROM orders 
  WHERE DATE(placed_at) = '2025-10-09'
);

-- Luego eliminar las órdenes
DELETE FROM orders 
WHERE DATE(placed_at) = '2025-10-09';

-- ALTERNATIVA: Eliminar por IDs específicos
-- Si prefieres eliminar órdenes específicas por ID, usa esto en su lugar:
/*
DELETE FROM order_items 
WHERE order_id IN ('ORDER_ID_1', 'ORDER_ID_2');

DELETE FROM orders 
WHERE id IN ('ORDER_ID_1', 'ORDER_ID_2');
*/

-- PASO 4: Verificar que se eliminaron
SELECT 
  COUNT(*) as total_orders,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders
FROM orders;

-- Ver resumen de órdenes por fecha
SELECT 
  DATE(placed_at) as fecha,
  COUNT(*) as cantidad_ordenes,
  SUM(total) as total_ventas
FROM orders 
GROUP BY DATE(placed_at)
ORDER BY fecha DESC;
