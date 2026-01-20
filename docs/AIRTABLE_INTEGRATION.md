# Guía de Integración Airtable con Next.js

## Resumen

Esta integración permite usar Airtable como capa operativa para Marketing, Colaboraciones y Eventos, mientras Supabase sigue siendo el source of truth para datos transaccionales.

---

## Configuración Inicial

### 1. Instalar Dependencias

```bash
pnpm add airtable @tanstack/react-query @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. Variables de Entorno

Agregar al `.env.local`:

```env
# Airtable API
AIRTABLE_API_KEY=pat_xxxxx

# Base IDs (encontrar en URL de Airtable: airtable.com/app_XXXXX/...)
AIRTABLE_BASE_MARKETING=app_xxxxx
AIRTABLE_BASE_COLLABORATIONS=app_xxxxx
AIRTABLE_BASE_EVENTS=app_xxxxx

# Webhook secret (generar token seguro)
AIRTABLE_WEBHOOK_SECRET_TOKEN=your-secret-token-here
```

### 3. Configurar QueryProvider

Agregar el `QueryProvider` al layout del admin:

```tsx
// app/admin/layout.tsx
import { QueryProvider } from "@/components/providers/query-provider"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {/* ... resto del layout */}
    </QueryProvider>
  )
}
```

### 4. Agregar Rutas al Sidebar

Actualizar `components/admin/admin-sidebar-menu.tsx` para incluir las nuevas secciones:

```tsx
// Dentro de la sección Marketing
<SidebarMenuItem>
  <Link href="/admin/marketing/campaigns" legacyBehavior>
    <SidebarMenuButton asChild>
      <a>Campañas</a>
    </SidebarMenuButton>
  </Link>
</SidebarMenuItem>

<SidebarMenuItem>
  <Link href="/admin/marketing/content" legacyBehavior>
    <SidebarMenuButton asChild>
      <a>Contenido</a>
    </SidebarMenuButton>
  </Link>
</SidebarMenuItem>
```

---

## Estructura de Archivos

```
lib/
  airtable/
    client.ts          # SDK de Airtable

types/
  airtable.ts         # Tipos TypeScript

app/api/
  airtable/
    campaigns/
      route.ts        # GET /api/airtable/campaigns
    content-pieces/
      route.ts        # GET /api/airtable/content-pieces
    events/
      route.ts        # GET /api/airtable/events
    webhook/
      route.ts        # POST /api/airtable/webhook

hooks/
  use-airtable-campaigns.ts
  use-airtable-content-pieces.ts

app/admin/
  marketing/
    campaigns/
      page.tsx        # Lista de campañas
    content/
      page.tsx        # Kanban de contenido

components/
  providers/
    query-provider.tsx
```

---

## Uso de los Hooks

### Campañas

```tsx
import { useCampaigns, useUpdateCampaignStatus } from "@/hooks/use-airtable-campaigns"

function MyComponent() {
  const { data: campaigns, isLoading } = useCampaigns({
    status: ["Activa"],
    type: ["Promoción"],
  })

  const updateStatus = useUpdateCampaignStatus()

  const handleActivate = async (id: string) => {
    await updateStatus.mutateAsync({ id, status: "Activa" })
  }

  // ...
}
```

### Piezas de Contenido

```tsx
import { useContentPieces, useUpdateContentPieceStatus } from "@/hooks/use-airtable-content-pieces"

function MyComponent() {
  const { data: pieces } = useContentPieces({
    campaignId: "rec_xxx",
    status: ["En Producción"],
  })

  const updateStatus = useUpdateContentPieceStatus()

  // ...
}
```

---

## Automatizaciones con Webhooks

### Configurar Webhook en Airtable

1. Ir a **Settings → Webhooks** en Airtable
2. Click en **Create webhook**
3. Configurar:
   - **Table**: Campañas
   - **Event types**: `tableChanged`
   - **URL**: `https://tu-dominio.com/api/airtable/webhook?token=SECRET_TOKEN`
   - **Method**: POST
   - **Headers**: (opcional)

### Flujo de Automatización

**Ejemplo: Campaña → Promoción en Supabase**

1. Usuario cambia estado de campaña a "Activa" en Airtable
2. Airtable envía webhook a `/api/airtable/webhook`
3. El endpoint procesa el cambio:
   - Obtiene la campaña desde Airtable
   - Si es tipo "Promoción", crea/actualiza promoción en Supabase
   - Si es tipo "Email" o "Social Media", puede crear popover

**Código del webhook** (`app/api/airtable/webhook/route.ts`):

```typescript
// Ya implementado - ver archivo para detalles
```

### Extender Automatizaciones

Para agregar más automatizaciones:

1. Identificar el evento en Airtable (ej: cambio de estado de Pieza de Contenido)
2. Agregar lógica en `processCampaignChanges` o crear nueva función
3. Actualizar Supabase según corresponda

**Ejemplo: Pieza de Contenido Publicada → Notificación**

```typescript
async function processContentPieceChanges(changedRecords: Record<string, any>) {
  for (const [recordId, change] of Object.entries(changedRecords)) {
    const current = change?.current
    const previous = change?.previous

    if (current?.fields?.["Estado"] === "Publicado" &&
        previous?.fields?.["Estado"] !== "Publicado") {
      // Crear notificación en Supabase
      await supabase.from("notifications").insert({
        type: "content_published",
        title: "Nueva pieza publicada",
        message: `Se publicó: ${current.fields["Título"]}`,
        // ...
      })
    }
  }
}
```

---

## Linkear Datos de Airtable con Supabase

### Mostrar Productos Relacionados

Cuando una campaña tiene `relatedProductIds`, puedes hacer lookup en Supabase:

```tsx
import { useCampaign } from "@/hooks/use-airtable-campaigns"
import { getProductsAsync } from "@/lib/repo/products"

function CampaignProducts({ campaignId }: { campaignId: string }) {
  const { data: campaign } = useCampaign(campaignId)
  const [products, setProducts] = React.useState([])

  React.useEffect(() => {
    if (campaign?.relatedProductIds?.length) {
      // Obtener productos de Supabase
      getProductsAsync({ ids: campaign.relatedProductIds }).then(setProducts)
    }
  }, [campaign])

  return (
    <div>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
```

### Linkear Torneos de Blacktop

Cuando un evento tiene `tournamentId`, puedes obtener el torneo de Supabase:

```tsx
import { useEvent } from "@/hooks/use-airtable-events" // crear hook similar
import { getServiceClient } from "@/lib/supabase/server"

async function getEventWithTournament(eventId: string) {
  const event = await getEvent(eventId)
  if (!event?.tournamentId) return event

  const supabase = getServiceClient()
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", event.tournamentId)
    .single()

  return { ...event, tournament }
}
```

---

## Dashboards 360 (Futuro)

### Dashboard de Campaña

Vista completa de una campaña con:
- Información de Airtable (campaña, piezas, canales)
- Productos relacionados de Supabase
- Métricas de ventas de Supabase (pedidos relacionados)
- Métricas de newsletter (si aplica)

**Implementación sugerida:**

```tsx
// app/admin/marketing/campaigns/[id]/page.tsx
export default function CampaignDashboard({ params }: { params: { id: string } }) {
  const { data: campaign } = useCampaign(params.id)
  const { data: contentPieces } = useContentPieces({ campaignId: params.id })
  const { data: products } = useProducts(campaign?.relatedProductIds)
  const { data: orders } = useOrders({ productIds: campaign?.relatedProductIds })

  // Agregar métricas, gráficos, etc.
}
```

### Dashboard de Producto

Vista de un producto con:
- Información de Supabase (producto, stock, pedidos)
- Campañas relacionadas de Airtable
- Piezas de contenido que lo mencionan

### Dashboard de Evento

Vista de un evento con:
- Información de Airtable (evento, tareas, métricas)
- Torneo relacionado de Supabase (si aplica)
- Ventas del evento (pedidos con canal "feria" o similar)

---

## Mejores Prácticas

### 1. Cacheo y Actualización

- React Query cachea automáticamente las queries
- Invalidar cache cuando se actualiza desde Airtable:
  ```tsx
  queryClient.invalidateQueries({ queryKey: ["airtable", "campaigns"] })
  ```

### 2. Manejo de Errores

- Siempre manejar errores en los hooks
- Mostrar mensajes claros al usuario
- Loggear errores para debugging

### 3. Performance

- Usar `pageSize` para limitar resultados
- Implementar paginación si hay muchos registros
- Usar `staleTime` apropiado en React Query

### 4. Seguridad

- Validar tokens de webhook
- Usar `assertAdmin` en todas las API routes
- No exponer API keys en el cliente

---

## Troubleshooting

### Error: "Failed to fetch campaigns"

- Verificar que `AIRTABLE_API_KEY` esté configurado
- Verificar que `AIRTABLE_BASE_MARKETING` sea correcto
- Verificar permisos de la API key en Airtable

### Webhook no se dispara

- Verificar que la URL sea accesible públicamente
- Verificar que el token coincida
- Revisar logs del servidor

### Datos no se actualizan

- Verificar que React Query esté invalidando cache
- Verificar que los filtros sean correctos
- Revisar la consola del navegador

---

## Próximos Pasos

1. ✅ Implementar páginas de Campañas y Contenido
2. ⏳ Agregar página de Eventos
3. ⏳ Implementar dashboards 360
4. ⏳ Agregar más automatizaciones
5. ⏳ Implementar sincronización bidireccional (opcional)

