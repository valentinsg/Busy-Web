# Fix: Tabla blacktop_notifications faltante

## Problema
Error al registrar equipos: `relation "blacktop_notifications" does not exist`

## Solución

### Opción 1: Ejecutar SQL directamente en Supabase Dashboard

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a SQL Editor
3. Copia y pega el contenido de `supabase/schema/blacktop_notifications.sql`
4. Ejecuta el script

### Opción 2: Usando Supabase CLI

```bash
# Si tienes Supabase CLI instalado
supabase db push
```

### Opción 3: Ejecutar desde código (temporal)

Puedes ejecutar el SQL directamente desde un script Node.js temporal:

```bash
node scripts/create-blacktop-notifications-table.js
```

## Verificación

Después de ejecutar el SQL, verifica que la tabla existe:

```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'blacktop_notifications';
```

## Qué hace el script

1. **Crea la tabla `blacktop_notifications`** con:
   - Tipos: `blacktop_team_registration`, `blacktop_match_upcoming`, `blacktop_match_result`, `blacktop_tournament_update`
   - Prioridades: `low`, `medium`, `high`, `critical`
   - Metadata en JSON
   - Estado de lectura

2. **Crea índices** para performance

3. **Configura RLS** (Row Level Security)

4. **Crea función helper** `create_blacktop_notification()`

5. **Crea trigger automático** para notificar cuando se registra un nuevo equipo

## Después de ejecutar

El registro de equipos debería funcionar correctamente y crear notificaciones automáticamente.
