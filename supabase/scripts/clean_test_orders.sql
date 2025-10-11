-- Script para limpiar órdenes de prueba
-- ADVERTENCIA: Este script eliminará TODAS las órdenes y datos relacionados
-- Usar solo en desarrollo o cuando estés seguro de que no hay órdenes reales

-- Eliminar todos los items de órdenes
DELETE FROM order_items;

-- Eliminar todas las órdenes
DELETE FROM orders;

-- Opcional: Eliminar todos los clientes (descomentar si es necesario)
-- DELETE FROM customers;

-- Resetear las estadísticas de clientes (si existe la tabla)
-- DELETE FROM customer_stats;

-- Mensaje de confirmación
SELECT 'Base de datos de órdenes limpiada exitosamente' as message;
