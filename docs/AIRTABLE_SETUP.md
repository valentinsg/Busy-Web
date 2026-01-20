# Setup de Integración Airtable

## Resumen

Esta integración conecta Airtable con Next.js para gestionar operaciones de Marketing, Colaboraciones y Eventos, mientras Supabase sigue siendo el source of truth para datos transaccionales.

---

## Instalación

### 1. Instalar Dependencias

```bash
pnpm add airtable @tanstack/react-query @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. Configurar Variables de Entorno

Agregar al `.env.local`:

```env
# Airtable API Key (obtener en: https://airtable.com/create/tokens)
AIRTABLE_API_KEY=pat_xxxxx

# Base IDs (encontrar en URL de Airtable: airtable.com/app_XXXXX/...)
AIRTABLE_BASE_MARKETING=app_xxxxx
AIRTABLE_BASE_COLLABORATIONS=app_xxxxx
AIRTABLE_BASE_EVENTS=app_xxxxx

# Webhook secret (generar token seguro, ej: openssl rand -hex 32)
AIRTABLE_WEBHOOK_SECRET_TOKEN=your-secret-token-here
```

### 3. Crear Bases en Airtable

Seguir el esquema detallado en `docs/AIRTABLE_SCHEMA.md` para crear las 3 bases:

1. **Marketing & Contenido**
   - Tabla: Campañas
   - Tabla: Piezas de Contenido
   - Tabla: Canales

2. **Colaboraciones & Partners**
   - Tabla: Modelos/Talentos
   - Tabla: Influencers
   - Tabla: Sponsors
   - Tabla: Acuerdos

3. **Eventos**
   - Tabla: Eventos
   - Tabla: Tareas
   - Tabla: Métricas Post-Evento

### 4. Obtener Base IDs

1. Abrir cada base en Airtable
2. Ir a **Help → API documentation**
3. Copiar el **Base ID** (formato: `app_xxxxx`)
4. Pegar en las variables de entorno correspondientes

### 5. Generar API Token

1. Ir a https://airtable.com/create/tokens
2. Crear nuevo token con scopes:
   - `data.records:read` (para todas las bases)
   - `data.records:write` (opcional, si quieres escribir desde Next.js)
3. Copiar el token (formato: `pat_xxxxx`)
4. Pegar en `AIRTABLE_API_KEY`

---

## Verificación

### Probar la Integración

1. Iniciar el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

2. Ir a `/admin/marketing/campaigns`
3. Deberías ver la lista de campañas desde Airtable

### Debugging

Si no ves datos:

1. Verificar que las variables de entorno estén cargadas:
   ```bash
   # En el servidor, agregar console.log temporal
   console.log(process.env.AIRTABLE_API_KEY)
   ```

2. Verificar permisos del API token en Airtable

3. Revisar la consola del navegador y logs del servidor

---

## Configurar Webhooks (Opcional)

### Para Automatizaciones

1. En Airtable, ir a **Settings → Webhooks**
2. Click en **Create webhook**
3. Configurar:
   - **Table**: Campañas
   - **Event types**: `tableChanged`
   - **URL**: `https://tu-dominio.com/api/airtable/webhook?token=SECRET_TOKEN`
   - **Method**: POST
4. Guardar

### Probar Webhook

1. Cambiar el estado de una campaña en Airtable
2. Verificar logs del servidor para ver si llegó el webhook
3. Verificar que se creó/actualizó la promoción en Supabase (si aplica)

---

## Estructura de Archivos Creados

```
lib/airtable/
  client.ts                    # SDK de Airtable

types/
  airtable.ts                  # Tipos TypeScript

app/api/airtable/
  campaigns/
    route.ts                   # GET /api/airtable/campaigns
  content-pieces/
    route.ts                   # GET /api/airtable/content-pieces
  events/
    route.ts                   # GET /api/airtable/events
  webhook/
    route.ts                   # POST /api/airtable/webhook

hooks/
  use-airtable-campaigns.ts    # React Query hooks para campañas
  use-airtable-content-pieces.ts # React Query hooks para contenido

app/admin/marketing/
  campaigns/
    page.tsx                   # Lista de campañas
  content/
    page.tsx                   # Kanban de contenido

components/providers/
  query-provider.tsx           # React Query provider

docs/
  AIRTABLE_SCHEMA.md           # Esquema completo de Airtable
  AIRTABLE_INTEGRATION.md      # Guía de integración
  AIRTABLE_SETUP.md            # Este archivo
```

---

## Próximos Pasos

1. ✅ Configurar bases en Airtable según el esquema
2. ✅ Probar las páginas de Campañas y Contenido
3. ⏳ Agregar página de Eventos
4. ⏳ Implementar dashboards 360
5. ⏳ Agregar más automatizaciones según necesidades

---

## Troubleshooting

### Error: "Failed to fetch campaigns"

**Causas posibles:**
- API key incorrecta o sin permisos
- Base ID incorrecto
- Tabla no existe o tiene nombre diferente

**Solución:**
1. Verificar que el nombre de la tabla en Airtable coincida exactamente con el código
2. Verificar permisos del API token
3. Revisar logs del servidor para ver el error exacto

### Webhook no funciona

**Causas posibles:**
- URL incorrecta o inaccesible
- Token no coincide
- Webhook no está configurado correctamente

**Solución:**
1. Verificar que la URL sea accesible públicamente (usar ngrok en desarrollo)
2. Verificar que el token en la URL coincida con `AIRTABLE_WEBHOOK_SECRET_TOKEN`
3. Revisar logs del servidor

### Datos no se actualizan

**Causas posibles:**
- Cache de React Query
- Filtros incorrectos

**Solución:**
1. Invalidar cache manualmente:
   ```tsx
   queryClient.invalidateQueries({ queryKey: ["airtable", "campaigns"] })
   ```
2. Verificar que los filtros sean correctos
3. Refrescar la página

---

## Recursos

- [Documentación de Airtable API](https://airtable.com/developers/web/api/introduction)
- [React Query Docs](https://tanstack.com/query/latest)
- [dnd-kit Docs](https://docs.dndkit.com/)

