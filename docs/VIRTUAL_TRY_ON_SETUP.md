# Virtual Try-On Setup Guide

## Probador Virtual con Google Vertex AI

Este documento explica cómo configurar el probador virtual de Busy Streetwear usando Google Vertex AI Virtual Try-On API.

---

## Requisitos

### 1. Google Cloud Project

1. Crear o seleccionar un proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Habilitar billing en el proyecto
3. Habilitar la **Vertex AI API**:
   ```
   https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com
   ```

### 2. Service Account

1. Ir a **IAM & Admin > Service Accounts**
2. Crear una nueva service account con nombre `virtual-try-on`
3. Asignar el rol **Vertex AI User** (`roles/aiplatform.user`)
4. Crear una key JSON y descargarla

### 3. Variables de Entorno

Agregar al archivo `.env.local`:

```env
# Google Cloud - Virtual Try-On
GOOGLE_CLOUD_PROJECT_ID=tu-proyecto-id
GOOGLE_CLOUD_REGION=us-central1
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}

# Feature flag
VIRTUAL_TRY_ON_ENABLED=true
```

> **Nota:** El JSON de la service account debe estar en una sola línea (minificado).

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  VirtualTryOnButton  →  VirtualTryOnModal                   │
│       ↓                      ↓                               │
│  Click handler         Upload image                          │
│                        Consent checkbox                      │
│                        Generate request                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  API Route (Next.js)                         │
├─────────────────────────────────────────────────────────────┤
│  POST /api/virtual-try-on                                   │
│       ↓                                                      │
│  Validate images                                             │
│  Convert URLs to base64                                      │
│  Call Vertex AI                                              │
│  Return generated images                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Google Vertex AI                                │
├─────────────────────────────────────────────────────────────┤
│  Model: virtual-try-on-preview-08-04                        │
│  Input: person image + product image                        │
│  Output: 1-4 generated images                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Archivos Creados

```
types/
  └── virtual-try-on.ts          # Tipos TypeScript

lib/virtual-try-on/
  ├── config.ts                  # Configuración centralizada
  └── client.ts                  # Cliente API Vertex AI

app/api/virtual-try-on/
  └── route.ts                   # API endpoint

components/shop/
  ├── virtual-try-on-button.tsx  # Botón para activar modal
  └── virtual-try-on-modal.tsx   # Modal con flujo completo
```

---

## Integración en Producto

Para agregar el botón de probador virtual a la página de producto:

```tsx
// En components/shop/product-detail.tsx o add-to-cart.tsx

import { VirtualTryOnButton } from "@/components/shop/virtual-try-on-button"

// Dentro del componente, después del botón "Agregar al carrito":
<VirtualTryOnButton
  productId={product.id}
  productImage={product.images[0]}
  productName={product.name}
  disabled={!product.images?.length}
/>
```

---

## Flujo de Usuario

1. **Upload**: Usuario sube una foto de sí mismo
2. **Consent**: Acepta términos de procesamiento de imagen
3. **Processing**: Se envía a Vertex AI (5-15 segundos)
4. **Result**: Ve la imagen generada con la prenda
5. **Actions**: Puede descargar, compartir o agregar al carrito

---

## Costos Estimados

| Operación | Costo aproximado |
|-----------|------------------|
| Por imagen generada | ~$0.02 - $0.05 USD |
| Rate limit | 10 req/min, 100 req/día |

> Los costos pueden variar. Consultar [Vertex AI Pricing](https://cloud.google.com/vertex-ai/pricing).

---

## Dependencias Requeridas

```bash
pnpm add google-auth-library
```

---

## Próximos Pasos

1. [ ] Configurar Google Cloud Project
2. [ ] Crear Service Account y descargar JSON
3. [ ] Agregar variables de entorno
4. [ ] Instalar `google-auth-library`
5. [ ] Integrar botón en página de producto
6. [ ] Crear bucket en Supabase para historial (opcional)
7. [ ] Agregar analytics de uso

---

## Troubleshooting

### Error: "El probador virtual no está disponible"
- Verificar que `VIRTUAL_TRY_ON_ENABLED=true` en `.env.local`

### Error: "Error de autenticación con Google Cloud"
- Verificar que el JSON de service account es válido
- Verificar que la service account tiene el rol `Vertex AI User`

### Error: "Formato no soportado"
- Solo se aceptan: JPEG, PNG, WebP
- Máximo 10MB por imagen

### Imágenes de baja calidad
- Usar fotos de cuerpo completo o medio cuerpo
- Buena iluminación
- Fondo simple
- Postura de frente

---

## Referencias

- [Google Vertex AI Virtual Try-On Docs](https://cloud.google.com/vertex-ai/generative-ai/docs/image/generate-virtual-try-on-images)
- [Virtual Try-On API Reference](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/virtual-try-on-api)
