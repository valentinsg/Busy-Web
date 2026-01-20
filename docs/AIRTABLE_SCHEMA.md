# Esquema de Airtable para Busy

## Arquitectura General

Airtable actúa como **capa operativa** para Marketing, Colaboraciones y Eventos. Supabase sigue siendo el **source of truth** para datos transaccionales (productos, pedidos, stock, clientes).

---

## Base 1: Marketing & Contenido

### Tabla: Campañas

**Propósito:** Gestión de campañas de marketing (email, social media, promociones, lanzamientos).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ID` | Auto Number | ID único de la campaña (generado automáticamente) |
| `Nombre` | Single Line Text | Nombre de la campaña (ej: "Drop Verano 2025", "Black Friday 2024") |
| `Tipo` | Single Select | Tipo de campaña: `Email`, `Social Media`, `Promoción`, `Lanzamiento`, `Evento`, `Otro` |
| `Estado` | Single Select | Estado: `Idea`, `Planificando`, `Activa`, `Pausada`, `Finalizada`, `Cancelada` |
| `Fecha Inicio` | Date | Fecha de inicio de la campaña |
| `Fecha Fin` | Date | Fecha de finalización (opcional) |
| `Objetivo` | Long Text | Objetivo principal de la campaña |
| `Presupuesto` | Currency | Presupuesto asignado (ARS) |
| `Gasto Real` | Currency | Gasto real acumulado |
| `Métricas Objetivo` | Long Text | KPIs objetivo (ej: "1000 clicks, 50 conversiones") |
| `Métricas Real` | Long Text | Métricas actuales (actualizado manualmente o vía webhook) |
| `Productos Relacionados` | Link to Records (Products) | Productos de Supabase que participan (usar IDs como texto y hacer lookup) |
| `Piezas de Contenido` | Link to Records (Piezas de Contenido) | Piezas asociadas a esta campaña |
| `Canales` | Multiple Selects | Canales donde se ejecuta: `Email`, `Instagram`, `TikTok`, `Facebook`, `Web`, `WhatsApp` |
| `Responsable` | Single Select | Persona responsable (ej: "Marketing", "Valentín", "Agustín") |
| `Notas` | Long Text | Notas internas |
| `Creado` | Created Time | Timestamp de creación |
| `Actualizado` | Last Modified Time | Última modificación |

**Relaciones:**
- `Piezas de Contenido` → Tabla "Piezas de Contenido"
- `Productos Relacionados` → Referencia externa a Supabase (guardar como texto: `product_id`)

---

### Tabla: Piezas de Contenido

**Propósito:** Gestión de piezas de contenido (posts, stories, reels, emails, banners, etc.).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ID` | Auto Number | ID único |
| `Título` | Single Line Text | Título de la pieza |
| `Tipo` | Single Select | Tipo: `Post Instagram`, `Story`, `Reel`, `TikTok`, `Email`, `Banner Web`, `Blog`, `Video`, `Otro` |
| `Estado` | Single Select | Estado del workflow: `Idea`, `En Producción`, `Programado`, `Publicado`, `Archivado` |
| `Campaña` | Link to Records (Campañas) | Campaña asociada (opcional) |
| `Canal` | Link to Records (Canales) | Canal donde se publica |
| `Fecha Programada` | Date | Fecha/hora programada para publicación |
| `Fecha Publicación` | Date | Fecha real de publicación |
| `URL` | URL | Link a la pieza publicada |
| `Contenido` | Long Text | Texto/copy de la pieza |
| `Hashtags` | Multiple Selects | Hashtags a usar (predefinidos o libres) |
| `Menciones` | Multiple Selects | Cuentas a mencionar (@busy_streetwear, influencers, etc.) |
| `Assets` | Attachments | Imágenes/videos de la pieza |
| `Productos Mencionados` | Multiple Selects | IDs de productos de Supabase (texto) |
| `Métricas` | Long Text | Métricas post-publicación (likes, views, clicks, etc.) |
| `Responsable` | Single Select | Persona responsable |
| `Notas` | Long Text | Notas internas |
| `Creado` | Created Time | Timestamp |
| `Actualizado` | Last Modified Time | Última modificación |

**Relaciones:**
- `Campaña` → Tabla "Campañas"
- `Canal` → Tabla "Canales"

---

### Tabla: Canales

**Propósito:** Catálogo de canales de marketing y sus configuraciones.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ID` | Auto Number | ID único |
| `Nombre` | Single Line Text | Nombre del canal (ej: "Instagram Principal", "TikTok", "Email Marketing") |
| `Tipo` | Single Select | Tipo: `Instagram`, `TikTok`, `Facebook`, `Email`, `Web`, `WhatsApp`, `YouTube`, `Otro` |
| `Handle/URL` | Single Line Text | Handle (@busy_streetwear) o URL del canal |
| `Activo` | Checkbox | Si el canal está activo |
| `Seguidores` | Number | Número de seguidores (actualizado manualmente) |
| `Descripción` | Long Text | Descripción del canal |
| `Responsable` | Single Select | Persona responsable |
| `Creado` | Created Time | Timestamp |

---

## Base 2: Colaboraciones & Partners

### Tabla: Modelos/Talentos

**Propósito:** Base de datos de modelos y talentos que trabajan con Busy.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ID` | Auto Number | ID único |
| `Nombre` | Single Line Text | Nombre completo |
| `Instagram` | Single Line Text | Handle de Instagram (@usuario) |
| `Email` | Email | Email de contacto |
| `Teléfono` | Phone | Teléfono |
| `Ciudad` | Single Line Text | Ciudad de residencia |
| `Tipo` | Multiple Selects | Tipo: `Modelo`, `Influencer`, `Atleta`, `Artista`, `Otro` |
| `Especialidad` | Single Select | Especialidad: `Fotografía`, `Video`, `Modelaje`, `Contenido`, `Otro` |
| `Talla Preferida` | Single Select | Talla que usa (XS, S, M, L, XL) |
| `Rating` | Number (1-5) | Rating interno (1-5 estrellas) |
| `Estado` | Single Select | Estado: `Activo`, `Inactivo`, `En Evaluación` |
| `Acuerdos` | Link to Records (Acuerdos) | Acuerdos asociados |
| `Notas` | Long Text | Notas internas |
| `Creado` | Created Time | Timestamp |

**Relaciones:**
- `Acuerdos` → Tabla "Acuerdos"

---

### Tabla: Influencers

**Propósito:** Base de datos de influencers y creadores de contenido.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ID` | Auto Number | ID único |
| `Nombre` | Single Line Text | Nombre o nombre artístico |
| `Instagram` | Single Line Text | Handle de Instagram |
| `TikTok` | Single Line Text | Handle de TikTok (opcional) |
| `Email` | Email | Email de contacto |
| `Agencia` | Single Line Text | Agencia que representa (si aplica) |
| `Seguidores Instagram` | Number | Número de seguidores en Instagram |
| `Seguidores TikTok` | Number | Número de seguidores en TikTok |
| `Nicho` | Multiple Selects | Nicho: `Streetwear`, `Lifestyle`, `Fitness`, `Música`, `Gaming`, `Otro` |
| `Audiencia` | Single Select | Tamaño de audiencia: `Nano (1K-10K)`, `Micro (10K-100K)`, `Mid (100K-1M)`, `Macro (1M+)` |
| `Engagement Rate` | Percent | Tasa de engagement estimada |
| `Tarifa Post` | Currency | Tarifa por post (ARS) |
| `Tarifa Story` | Currency | Tarifa por story (ARS) |
| `Tarifa Reel` | Currency | Tarifa por reel (ARS) |
| `Rating` | Number (1-5) | Rating interno |
| `Estado` | Single Select | Estado: `Activo`, `Inactivo`, `En Negociación` |
| `Acuerdos` | Link to Records (Acuerdos) | Acuerdos asociados |
| `Notas` | Long Text | Notas internas |
| `Creado` | Created Time | Timestamp |

**Relaciones:**
- `Acuerdos` → Tabla "Acuerdos"

---

### Tabla: Sponsors

**Propósito:** Patrocinadores y marcas colaboradoras.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ID` | Auto Number | ID único |
| `Nombre` | Single Line Text | Nombre de la marca/sponsor |
| `Tipo` | Single Select | Tipo: `Marca`, `Evento`, `Organización`, `Otro` |
| `Contacto Principal` | Single Line Text | Nombre del contacto |
| `Email` | Email | Email de contacto |
| `Teléfono` | Phone | Teléfono |
| `Website` | URL | Website |
| `Industria` | Single Select | Industria: `Streetwear`, `Deportes`, `Música`, `Tecnología`, `Otro` |
| `Valor del Acuerdo` | Currency | Valor total del acuerdo (ARS) |
| `Estado` | Single Select | Estado: `Activo`, `Inactivo`, `En Negociación`, `Finalizado` |
| `Acuerdos` | Link to Records (Acuerdos) | Acuerdos asociados |
| `Notas` | Long Text | Notas internas |
| `Creado` | Created Time | Timestamp |

**Relaciones:**
- `Acuerdos` → Tabla "Acuerdos"

---

### Tabla: Acuerdos

**Propósito:** Contratos y acuerdos con modelos, influencers y sponsors.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ID` | Auto Number | ID único |
| `Nombre` | Single Line Text | Nombre del acuerdo (ej: "Colaboración Verano 2025 - @influencer") |
| `Tipo` | Single Select | Tipo: `Colaboración`, `Sponsor`, `Modelo`, `Evento`, `Otro` |
| `Modelo/Talento` | Link to Records (Modelos/Talentos) | Modelo asociado (opcional) |
| `Influencer` | Link to Records (Influencers) | Influencer asociado (opcional) |
| `Sponsor` | Link to Records (Sponsors) | Sponsor asociado (opcional) |
| `Campaña` | Link to Records (Campañas) | Campaña asociada (opcional, referencia a Base Marketing) |
| `Evento` | Link to Records (Eventos) | Evento asociado (opcional, referencia a Base Eventos) |
| `Fecha Inicio` | Date | Fecha de inicio del acuerdo |
| `Fecha Fin` | Date | Fecha de finalización |
| `Valor Total` | Currency | Valor total del acuerdo (ARS) |
| `Forma de Pago` | Single Select | Forma: `Pago Único`, `Mensual`, `Por Pieza`, `Por Métricas`, `Otro` |
| `Entregables` | Long Text | Lista de entregables acordados |
| `Términos` | Long Text | Términos y condiciones |
| `Estado` | Single Select | Estado: `Borrador`, `En Negociación`, `Activo`, `Completado`, `Cancelado` |
| `Documento` | Attachments | Contrato o documento firmado |
| `Notas` | Long Text | Notas internas |
| `Creado` | Created Time | Timestamp |
| `Actualizado` | Last Modified Time | Última modificación |

**Relaciones:**
- `Modelo/Talento` → Tabla "Modelos/Talentos"
- `Influencer` → Tabla "Influencers"
- `Sponsor` → Tabla "Sponsors"
- `Campaña` → Base "Marketing & Contenido" → Tabla "Campañas"
- `Evento` → Base "Eventos" → Tabla "Eventos"

---

## Base 3: Eventos

### Tabla: Eventos

**Propósito:** Gestión de eventos Busy y Blacktop.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ID` | Auto Number | ID único |
| `Nombre` | Single Line Text | Nombre del evento |
| `Tipo` | Single Select | Tipo: `Torneo Blacktop`, `Lanzamiento`, `Pop-up`, `Feria`, `Concierto`, `Otro` |
| `Fecha Inicio` | Date | Fecha y hora de inicio |
| `Fecha Fin` | Date | Fecha y hora de finalización |
| `Ubicación` | Single Line Text | Dirección o lugar del evento |
| `Ciudad` | Single Line Text | Ciudad |
| `Descripción` | Long Text | Descripción del evento |
| `Estado` | Single Select | Estado: `Planificando`, `Confirmado`, `En Curso`, `Finalizado`, `Cancelado` |
| `Presupuesto` | Currency | Presupuesto asignado (ARS) |
| `Gasto Real` | Currency | Gasto real acumulado |
| `Asistentes Esperados` | Number | Número estimado de asistentes |
| `Asistentes Reales` | Number | Número real de asistentes |
| `Torneo Relacionado` | Single Line Text | ID del torneo en Supabase (si es Blacktop) |
| `Campaña` | Single Line Text | ID de campaña en Airtable (si aplica) |
| `Sponsors` | Link to Records (Sponsors) | Sponsors del evento (referencia a Base Colaboraciones) |
| `Tareas` | Link to Records (Tareas) | Tareas asociadas |
| `Métricas Post-Evento` | Link to Records (Métricas Post-Evento) | Métricas del evento |
| `Responsable` | Single Select | Persona responsable |
| `Notas` | Long Text | Notas internas |
| `Creado` | Created Time | Timestamp |
| `Actualizado` | Last Modified Time | Última modificación |

**Relaciones:**
- `Tareas` → Tabla "Tareas"
- `Métricas Post-Evento` → Tabla "Métricas Post-Evento"
- `Sponsors` → Base "Colaboraciones & Partners" → Tabla "Sponsors"

---

### Tabla: Tareas

**Propósito:** Tareas y checklist para eventos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ID` | Auto Number | ID único |
| `Título` | Single Line Text | Título de la tarea |
| `Evento` | Link to Records (Eventos) | Evento asociado |
| `Estado` | Single Select | Estado: `Pendiente`, `En Progreso`, `Completada`, `Cancelada` |
| `Prioridad` | Single Select | Prioridad: `Baja`, `Media`, `Alta`, `Crítica` |
| `Fecha Límite` | Date | Fecha límite |
| `Asignado a` | Single Select | Persona asignada |
| `Descripción` | Long Text | Descripción detallada |
| `Completada` | Checkbox | Si está completada |
| `Fecha Completada` | Date | Fecha de completación |
| `Notas` | Long Text | Notas adicionales |
| `Creado` | Created Time | Timestamp |

**Relaciones:**
- `Evento` → Tabla "Eventos"

---

### Tabla: Métricas Post-Evento

**Propósito:** Métricas y resultados post-evento.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ID` | Auto Number | ID único |
| `Evento` | Link to Records (Eventos) | Evento asociado |
| `Fecha Medición` | Date | Fecha de la medición |
| `Asistentes` | Number | Número de asistentes |
| `Ventas en Evento` | Currency | Ventas realizadas en el evento (ARS) |
| `Productos Vendidos` | Number | Cantidad de productos vendidos |
| `Nuevos Seguidores Instagram` | Number | Nuevos seguidores ganados |
| `Nuevos Suscriptores Newsletter` | Number | Nuevos suscriptores |
| `Engagement Social` | Number | Engagement total en redes |
| `Alcance` | Number | Alcance total (impresiones) |
| `ROI` | Percent | ROI calculado |
| `Notas` | Long Text | Notas adicionales |
| `Creado` | Created Time | Timestamp |

**Relaciones:**
- `Evento` → Tabla "Eventos"

---

## Consideraciones de Integración

### Referencias Cruzadas entre Bases

- **Campañas → Eventos**: Usar campo de texto con ID del evento o crear tabla de unión en Supabase
- **Acuerdos → Campañas**: Link to Records funciona entre bases si están en el mismo workspace
- **Eventos → Sponsors**: Link to Records funciona entre bases

### Referencias a Supabase

- **Productos**: Guardar `product_id` (texto) y hacer lookup en Supabase desde Next.js
- **Torneos**: Guardar `tournament_id` (texto) y hacer lookup en Supabase
- **Pedidos**: Guardar `order_id` (texto) si se necesita referencia

### Campos Calculados

- **ROI en Métricas**: `(Ventas - Gasto Real) / Gasto Real * 100`
- **Engagement Rate en Influencers**: Calcular desde métricas de posts

---

## Configuración de Airtable

### Workspace Setup

1. Crear 3 bases en el mismo workspace de Airtable
2. Configurar permisos: Solo admins pueden editar, resto solo lectura
3. Habilitar API: Settings → API → Generate API token

### Variables de Entorno Necesarias

```env
AIRTABLE_API_KEY=pat_xxxxx
AIRTABLE_BASE_MARKETING=app_xxxxx
AIRTABLE_BASE_COLLABORATIONS=app_xxxxx
AIRTABLE_BASE_EVENTS=app_xxxxx
```

### Webhooks Setup

Configurar webhooks en Airtable para:
- Cambios en `Estado` de Campañas → Webhook a Next.js
- Cambios en `Estado` de Piezas de Contenido → Webhook a Next.js (opcional)
- Cambios en `Estado` de Eventos → Webhook a Next.js (opcional)

