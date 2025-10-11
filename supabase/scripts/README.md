# Scripts de Base de Datos

## Limpiar Órdenes de Prueba

Para limpiar todas las órdenes de prueba de la base de datos:

### Opción 1: Desde Supabase Dashboard
1. Ve a tu proyecto en Supabase Dashboard
2. Navega a SQL Editor
3. Copia y pega el contenido de `clean_test_orders.sql`
4. Ejecuta el script

### Opción 2: Desde línea de comandos (si tienes Supabase CLI)
```bash
supabase db execute --file supabase/scripts/clean_test_orders.sql
```

### ⚠️ ADVERTENCIA
Este script eliminará:
- Todas las órdenes (tabla `orders`)
- Todos los items de órdenes (tabla `order_items`)
- Opcionalmente, todos los clientes (si descomentas la línea)

**Solo usar en desarrollo o cuando estés seguro de que no hay datos reales.**

## Verificar datos después de limpiar

Puedes verificar que se limpiaron correctamente con:

```sql
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as total_order_items FROM order_items;
SELECT COUNT(*) as total_customers FROM customers;
```

Todos deberían retornar 0 (excepto customers si no lo eliminaste).
