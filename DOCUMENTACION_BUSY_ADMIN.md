# Documentación Interna: Panel Admin de Busy

## 1. Introducción

### ¿Qué es Busy?

Busy es una marca argentina de cultura urbana fundada en Mar del Plata que combina moda, contenido y comunidad. Más que una marca de ropa, Busy representa un ecosistema creativo que une streetwear con cultura, música, básquet y generación de conversación.

**Pilares del negocio:**

- **Ecommerce**: Venta de productos propios (drops) y reventa de streetwear premium
- **Blacktop**: Organización de torneos de básquet 3x3 y 4x4, con seguimiento de equipos, jugadores y estadísticas
- **Contenidos**: Blog, playlists curadas en Spotify, podcast, y gestión de propuestas de artistas
- **Comunidad**: Newsletter, eventos y construcción de una comunidad auténtica alrededor de la cultura urbana

### ¿Para qué existe el Admin?

El panel de administración es la herramienta central que permite gestionar todas las operaciones del negocio de forma unificada. Desde aquí se controla:

- **Inventario**: Productos, stock, categorías, promociones
- **Ventas**: Pedidos, clientes, canales de venta (web, Instagram, Mercado Libre, ferias, manuales)
- **Marketing**: Blog, newsletter, campañas, popups, cupones, playlists
- **Blacktop**: Torneos, equipos, jugadores, partidos, estadísticas
- **Operaciones**: Proveedores, compras, gastos, configuración general

### ¿Quién lo usa?

El admin está diseñado para ser usado por:

- **Equipo de operaciones**: Gestión de inventario, pedidos y logística
- **Equipo de marketing**: Creación de contenido, campañas y gestión de newsletter
- **Equipo de ventas**: Seguimiento de pedidos, clientes y canales de venta
- **Equipo de Blacktop**: Organización de torneos y seguimiento de partidos
- **Administradores**: Configuración general y reportes

---

## 2. Stack Técnico

### Arquitectura General

El proyecto está construido con tecnologías modernas que permiten escalabilidad y mantenibilidad:

**Frontend:**
- **Next.js 14** (App Router): Framework React con renderizado del lado del servidor
- **TypeScript**: Tipado estático para mayor seguridad y mantenibilidad
- **Tailwind CSS**: Estilos utilitarios para diseño responsive
- **Componentes UI**: Sistema de componentes reutilizables basado en shadcn/ui

**Backend y Base de Datos:**
- **Supabase**: Base de datos PostgreSQL como servicio principal
  - Autenticación integrada
  - Row Level Security (RLS) para seguridad
  - APIs REST y GraphQL automáticas
  - Funciones serverless (Edge Functions)

**Almacenamiento de Media:**
- **Cloudflare R2 / S3**: Almacenamiento de imágenes y archivos multimedia
  - Productos, blog, Blacktop, Busy Files
  - CDN integrado para entrega rápida

**Integraciones Externas:**
- **Mercado Pago**: Procesamiento de pagos online
  - Webhooks para actualización automática de pedidos
  - Preferencias de pago y seguimiento de transacciones
- **Envia**: Gestión de envíos y etiquetas de correo
- **Spotify API**: Integración con playlists

**Notificaciones:**
- Sistema propio de notificaciones push
- Email notifications para eventos importantes
- Notificaciones específicas de Blacktop

---

## 3. Estructura de Datos (Supabase)

La base de datos está organizada en áreas funcionales que reflejan las diferentes partes del negocio. A continuación, se describen los grupos principales y sus tablas clave.

### 3.1. Ecommerce

Este grupo maneja todo lo relacionado con la venta de productos online y offline.

#### Tablas Principales

**`products`**
- Almacena el catálogo completo de productos
- Campos clave: `id` (texto), `name`, `price`, `currency`, `images`, `colors`, `sizes`, `stock`, `category`, `sku`
- Soporta variantes por color y talle
- Incluye campos de marketing: `tags`, `rating`, `reviews`, `badge_text`, `discount_percentage`
- Estados: `is_active` (visible/oculto), `imported` (productos importados vs propios)

**`product_sizes`**
- Control de stock por producto y talle
- Relación: `product_id` + `size` (clave primaria compuesta)
- Campo `stock` se actualiza automáticamente al procesar pedidos

**`product_categories`**
- Categorización de productos (hoodies, t-shirts, accessories, etc.)
- Campos: `slug`, `name`, `description`, `display_order`, `is_active`

**`orders`**
- Registro central de todos los pedidos (web, manual, Instagram, Mercado Libre, ferias)
- Campos clave: `id`, `customer_id`, `channel`, `status`, `total`, `subtotal`, `discount`, `shipping`, `tax`
- Estados: `pending`, `paid`, `shipped`, `completed`, `cancelled`
- Canales: `web`, `instagram`, `mercado_libre`, `feria`, `manual`, `other`
- Métodos de pago: `card`, `transfer`, `cash`, `other`
- Integración con Mercado Pago: `payment_id`, `preference_id`
- Envíos: `shipping_address` (JSONB), `carrier`, `tracking_number`, `shipping_status`

**`order_items`**
- Detalle de productos en cada pedido
- Campos: `order_id`, `product_id`, `product_name`, `variant_color`, `variant_size`, `quantity`, `unit_price`, `total`
- Permite rastrear qué productos se vendieron y en qué variantes

**`customers`**
- Base de datos de clientes
- Campos: `id`, `email` (único), `full_name`, `phone`, `tags` (array)
- Se crea automáticamente al hacer una compra o suscribirse al newsletter
- Campo `last_seen_at` para tracking de actividad

**`promotions`**
- Sistema flexible de promociones
- Tipos: `nxm` (NxM), `percentage_off`, `fixed_amount`, `combo`, `bundle`, `nth_unit_discount`
- Configuración mediante JSONB (`config`)
- Filtrado por SKUs: `eligible_skus`, `sku_match_type` (exact/prefix)
- Límites: `max_uses_per_customer`, `max_total_uses`, `current_uses`
- Rangos de fechas: `starts_at`, `ends_at`
- Prioridad para aplicar múltiples promociones

**`coupons`**
- Cupones de descuento simples
- Campos: `code` (clave primaria), `percent`, `active`, `max_uses`, `used_count`, `expires_at`

**`suppliers`**
- Proveedores y fabricantes
- Campos: `name`, `contact_name`, `contact_email`, `contact_phone`, `category`, `product_tags`
- Información comercial: `reference_price`, `minimum_order_quantity`, `delivery_time_days`, `payment_terms`
- Rating de confiabilidad: `reliability_rating`

**`supplier_purchases`**
- Registro de compras a proveedores
- Estados: `ordered`, `received`
- Campos financieros: `subtotal`, `shipping`, `tax`, `total`, `currency`

**`supplier_purchase_items`**
- Detalle de productos en cada compra a proveedor
- Relación con `products` para actualizar stock

**`expenses`**
- Gastos operativos del negocio
- Campos: `category`, `supplier_id` (opcional), `description`, `amount`, `currency`, `incurred_at`, `channel`
- Metadata JSONB para información adicional

**`shop_settings`**
- Configuración global de la tienda
- Campos: `shipping_flat_rate`, `shipping_free_threshold`, `mar_del_plata_rate`
- Configuración de envío gratis: `free_shipping_enabled`, `free_shipping_message`
- Tarifas por provincia: `province_rates` (JSONB)
- Modo especial: `christmas_mode`

**`related_products`**
- Productos relacionados para cross-sell y upsell
- Tipos de relación: `upsell`, `cross_sell`, `accessory`, `manual`
- Campo `weight` para ordenar recomendaciones

**`product_views`**
- Tracking de interacciones con productos
- Acciones: `view`, `click`, `add_to_cart`, `purchase`
- Campos: `product_id`, `customer_id`, `session_id`, `source`, `occurred_at`
- Permite analizar comportamiento de usuarios

**`webhook_events`**
- Registro de eventos de webhooks (principalmente Mercado Pago)
- Campos: `payment_id`, `event_type`, `raw` (JSONB con payload completo)
- Permite debugging y auditoría de pagos

**`orders_tmp`**
- Tabla temporal para almacenar estados intermedios de pagos de Mercado Pago
- Se usa durante el proceso de checkout antes de crear la orden final
- Campos: `session_id`, `payment_id`, `status`, `status_detail`, `preference_id`, `raw`

### 3.2. Marketing

Este grupo gestiona contenido, comunicación y engagement con la comunidad.

#### Tablas Principales

**`newsletter_subscribers`**
- Base de suscriptores al newsletter
- Campos: `email` (clave primaria), `status` (pending/subscribed/unsubscribed), `tags` (array)
- Token para confirmación de suscripción

**`newsletter_campaigns`**
- Campañas de email marketing
- Campos: `name`, `subject`, `content`, `status` (draft/scheduled/sending/sent/failed)
- Segmentación: `target_status`, `target_tags` (arrays)
- Programación: `scheduled_at`
- Métricas: `sent_count`, `delivered_count`, `opened_count`, `clicked_count`, `bounced_count`, `unsubscribed_count`
- CTAs: `cta_text`, `cta_url`

**`newsletter_campaign_recipients`**
- Lista de destinatarios por campaña
- Estados: `ready`, `sent`, `failed`
- Tracking: `sent_at`, `error_message`

**`newsletter_campaign_events`**
- Eventos de tracking de campañas (opens, clicks, bounces)
- Campos: `campaign_id`, `email`, `event_type`, `link_url`, `user_agent`, `ip_address`
- Metadata JSONB para información adicional

**`popovers`**
- Popups modales configurables para el sitio web
- Tipos: `simple`, `discount`, `email-gate`, `newsletter`, `custom`
- Configuración: `title`, `body`, `image_url`, `discount_code`, `cta_text`, `cta_url`
- Segmentación: `sections` (array de rutas), `paths` (array de URLs)
- Timing: `start_at`, `end_at`, `delay_seconds`
- Persistencia: `persist_dismissal` (recordar si el usuario cerró el popup)

**`playlists`**
- Playlists curadas de Spotify
- Campos: `slug` (único), `title`, `description`, `spotify_url`, `cover_image`, `genre`
- Estados: `is_published`, `order_index`

**`artist_submissions`**
- Propuestas de artistas para incluir en playlists
- Campos: `artist_name`, `email`, `phone`, `spotify_artist_url`, `track_url`, `genre`
- Redes sociales: `social_instagram`, `social_youtube`
- Estados: `pending`, `reviewed`, `approved`, `rejected`
- Campo `admin_notes` para feedback interno

**`blog_comments`**
- Comentarios en artículos del blog
- Campos: `slug` (del artículo), `name`, `email`, `message`, `approved` (moderación)

**`blog_ratings`**
- Ratings de artículos del blog (1-5 estrellas)
- Campos: `slug`, `rating`, `ip_hash` (para evitar duplicados), `user_agent`

**`authors`**
- Autores del blog
- Campos: `name`, `email` (único), `avatar_url`, `bio`, `active`

**`faqs`**
- Preguntas frecuentes
- Campos: `question`, `answer`, `category`, `sort_order`, `is_active`

### 3.3. Blacktop

Este grupo gestiona los torneos de básquet, equipos, jugadores y estadísticas.

#### Tablas Principales

**`tournaments`**
- Torneos de básquet 3x3 o 4x4
- Campos: `name`, `slug` (único), `description`, `location`, `date`
- Configuración: `max_teams`, `players_per_team_min`, `players_per_team_max`
- Registro: `registration_open`, `registration_start`, `registration_end`
- Formato: `format_type` (groups_playoff/single_elimination/round_robin/custom)
- Configuración de grupos: `num_groups`, `teams_per_group`, `teams_advance_per_group`
- Playoffs: `playoff_format` (single_elimination/double_elimination), `third_place_match`
- Partidos: `period_duration_minutes`, `periods_count`, `playoff_period_duration_minutes`, `playoff_periods_count`
- Golden point: `golden_point_enabled`
- Estados: `tournament_status` (draft/groups/playoffs/finished), `status` (in_progress/finished)
- Ganadores: `mvp_player_id`, `champion_team_id`
- Branding: `primary_color`, `accent_color`, `banner_url`, `flyer_images` (array)
- Contenido: `prizes_title`, `prizes_description`, `rules_content`, `rules_url`
- Configuración avanzada: `format_config` (JSONB)

**`teams`**
- Equipos registrados en torneos
- Campos: `tournament_id`, `name`, `captain_name`, `captain_instagram`, `captain_email`, `captain_phone`
- Estados: `status` (pending/approved/rejected), `is_confirmed`
- Consentimientos: `accept_image_rights`, `accept_rules`
- Grupo: `group_id`, `group_name`, `group_position`
- Media: `logo_url`, `notes`

**`players`**
- Jugadores de los equipos
- Campos: `tournament_id`, `team_id`, `full_name`, `instagram_handle`, `email`, `photo_url`
- Información: `position`, `is_captain`
- Consentimiento: `consent_media`

**`matches`**
- Partidos de los torneos
- Campos: `tournament_id`, `team_a_id`, `team_b_id`, `team_a_score`, `team_b_score`, `winner_id`
- Fase: `phase` (groups/quarterfinals/semifinals/third_place/final), `round`, `match_number`
- Grupo: `group_id` (para fase de grupos)
- Estados: `status` (pending/live/halftime/finished/cancelled)
- Timing: `scheduled_time`, `started_at`, `paused_at`, `finished_at`
- Partido en vivo: `current_period`, `elapsed_seconds`
- Estadísticas: `fouls_a`, `fouls_b`
- Notas: `notes`

**`groups`**
- Grupos dentro de un torneo (para fase de grupos)
- Campos: `tournament_id`, `name`, `display_name`, `order_index`

**`player_match_stats`**
- Estadísticas individuales por partido
- Campos: `match_id`, `player_id`, `points`, `assists`, `rebounds`, `steals`, `blocks`, `turnovers`
- MVP: `is_mvp` (boolean)

**`team_match_stats`**
- Estadísticas de equipo por partido
- Campos: `match_id`, `team_id`, `points`, `assists`, `rebounds`, `steals`, `blocks`, `turnovers`

**`player_profiles`**
- Perfiles consolidados de jugadores (acumula datos de todos los torneos)
- Campos: `instagram_handle` (único), `display_name`, `bio`
- Estadísticas acumuladas: `total_tournaments`, `total_points`, `total_mvps`

**`tournament_media`**
- Galería de imágenes y videos de torneos
- Campos: `tournament_id`, `url`, `type` (image/video), `caption`, `display_order`

**`blacktop_notifications`**
- Notificaciones específicas de Blacktop
- Tipos: `blacktop_team_registration`, `blacktop_match_upcoming`, `blacktop_match_result`, `blacktop_tournament_update`
- Campos: `title`, `message`, `metadata` (JSONB), `action_url`
- Estados: `read`, `read_at`, `expires_at`

### 3.4. Infraestructura de Notificaciones

Sistema centralizado de notificaciones para diferentes eventos del negocio.

#### Tablas Principales

**`notifications`**
- Notificaciones generales del sistema
- Tipos: `new_order`, `pending_transfer`, `artist_submission`, `low_stock`, `newsletter_subscription`, `order_cancelled`, `payment_error`, `weekly_report`, `monthly_report`, `newsletter_reminder`
- Campos: `type`, `priority` (low/medium/high/critical), `title`, `message`, `metadata` (JSONB), `action_url`
- Estados: `read`, `read_at`, `expires_at`

**`notification_preferences`**
- Preferencias de notificación por tipo
- Campos: `notification_type` (único), `enabled`, `push_enabled`, `email_enabled`, `priority`, `config` (JSONB)
- Permite configurar qué notificaciones se envían y por qué canal

**`notification_logs`**
- Log de envío de notificaciones
- Campos: `notification_id`, `channel` (push/email/sms), `status` (pending/sent/failed/expired), `error_message`, `sent_at`

**`push_subscriptions`**
- Suscripciones para notificaciones push del navegador
- Campos: `endpoint` (único), `p256dh`, `auth` (tokens de Web Push API), `user_agent`, `last_used_at`

### 3.5. Scripts/Guiones

Sistema de gestión de guiones para producción de contenido de video.

#### Tablas Principales

**`script_projects`**
- Proyectos de guiones (agrupa múltiples guiones)
- Campos: `team_id` (usuario del equipo), `name`, `description`, `created_by`

**`scripts`**
- Guiones individuales
- Campos: `project_id`, `team_id`, `title`, `slug` (único), `status` (idea/outline/draft/review/approved/published)
- Metadata: `category`, `tags` (array), `platform`, `est_duration_seconds`, `cover_asset_url`
- Contenido: `mdx` (Markdown con JSX), `mdx_frontmatter` (JSONB)
- Versionado: `version` (entero)
- Autores: `created_by`, `updated_by`
- Búsqueda: `search_index` (tsvector para búsqueda full-text)

**`script_scenes`**
- Escenas dentro de un guion
- Campos: `script_id`, `idx` (orden), `heading`, `objective`, `dialogue_mdx`, `broll_notes`
- Producción: `duration_seconds`, `shot_type`, `location`, `props`

**`script_versions`**
- Historial de versiones de guiones
- Campos: `script_id`, `version` (número), `mdx`, `mdx_frontmatter`, `created_by`

**`script_assets`**
- Archivos multimedia asociados a guiones
- Campos: `script_id`, `name`, `url`, `kind` (tipo de archivo), `size_bytes`, `created_by`

**`script_comments`**
- Comentarios y feedback en guiones
- Campos: `script_id`, `author_id`, `body`, `resolved` (boolean)

### 3.6. Otras Tablas

**`virtual_try_on_sessions`**
- Sesiones de prueba virtual de productos (tecnología de IA)
- Campos: `user_id`, `product_id`, `product_name`, `product_image_url`, `person_image_url`
- Estados: `pending`, `processing`, `completed`, `failed`
- Resultados: `generated_images` (JSONB array), `processing_time_ms`, `error_message`

---

## 4. Estructura del Admin

El panel de administración está organizado en secciones principales que reflejan las áreas funcionales del negocio. Cada sección contiene múltiples pantallas para gestionar diferentes aspectos.

### 4.1. Dashboard

**Ruta:** `/admin`

**Descripción:** Pantalla principal con visión general del negocio.

**Componentes:**
- **Dashboard Cards**: KPIs principales (ventas, pedidos, productos, etc.)
- **Balance KPIs**: Balance total del negocio con contador de pedidos
- **Top Products**: Productos más vendidos
- **Latest Blog**: Últimos artículos del blog
- **Accesos rápidos**: Enlaces a acciones comunes (nuevo producto, nuevo artículo, nueva campaña, analíticas)

**Tablas relacionadas:**
- `orders` (agregaciones)
- `products` (top vendidos)
- `blog` (últimos artículos)

### 4.2. Inventario

**Ruta base:** `/admin/products`

#### Productos (`/admin/products`)

**Descripción:** Lista completa de productos con vista de cards.

**Funcionalidades:**
- Ver todos los productos (activos e inactivos)
- Toggle de visibilidad (`is_active`)
- Toggle de destacado (`featured` tag)
- Acceso rápido a edición

**Tablas:**
- `products` (lectura)
- `products` (escritura: `is_active`, `tags`)

#### Crear/Editar Producto (`/admin/products/new`, `/admin/products/[id]`)

**Descripción:** Formulario completo para crear o editar productos.

**Funcionalidades:**
- Información básica: nombre, precio, SKU, descripción
- Variantes: colores, talles, stock por talle
- Media: subida de imágenes (R2)
- Categorización: categoría, tags
- Marketing: badge, descuento, rating, reviews
- Medidas: `measurements_by_size` (JSONB)
- Beneficios y cuidados: `benefits` (JSONB), `care_instructions`
- Peso: para cálculo de envío

**Tablas:**
- `products` (lectura/escritura)
- `product_sizes` (escritura)
- `product_categories` (lectura)

#### Categorías (`/admin/categories`)

**Descripción:** Gestión de categorías de productos.

**Funcionalidades:**
- Lista de categorías
- Crear/editar/eliminar categorías
- Orden de visualización (`display_order`)
- Activar/desactivar categorías

**Tablas:**
- `product_categories` (lectura/escritura)

#### Stock (`/admin/stock`)

**Descripción:** Vista consolidada de stock por producto y talle.

**Funcionalidades:**
- Ver stock actual de todos los productos
- Actualizar stock manualmente
- Filtrar por bajo stock

**Tablas:**
- `product_sizes` (lectura/escritura)
- `products` (lectura)

#### Promociones (`/admin/promotions`)

**Descripción:** Gestión de promociones y descuentos.

**Funcionalidades:**
- Lista de promociones activas e inactivas
- Crear nueva promoción (`/admin/promotions/new`)
- Configurar tipo de promoción (NxM, porcentaje, monto fijo, combo, bundle)
- Filtrar productos por SKU (exacto o prefijo)
- Establecer límites de uso
- Programar fechas de inicio y fin
- Prioridad para aplicar múltiples promociones

**Tablas:**
- `promotions` (lectura/escritura)

### 4.3. Marketing

**Ruta base:** `/admin/blog`, `/admin/newsletter`, `/admin/playlists`, etc.

#### Blog (`/admin/blog`)

**Descripción:** Gestión de artículos del blog.

**Funcionalidades:**
- Lista de artículos
- Crear nuevo artículo (`/admin/blog/new`)
- Editar artículo (`/admin/blog/edit/[slug]`)
- Editor MDX con frontmatter
- Gestión de autores

**Tablas:**
- `blog` (tabla implícita, probablemente archivos MDX o similar)
- `authors` (lectura)
- `blog_comments` (lectura)
- `blog_ratings` (lectura)

#### Newsletter (`/admin/newsletter`)

**Descripción:** Gestión de suscriptores y campañas de email.

**Subsecciones:**

**Suscriptores (`/admin/newsletter`):**
- Lista de suscriptores
- Estados: pending, subscribed, unsubscribed
- Tags para segmentación
- Exportar lista

**Tablas:** `newsletter_subscribers` (lectura/escritura)

**Campañas (`/admin/newsletter/campaigns`):**
- Lista de campañas
- Crear nueva campaña (`/admin/newsletter/campaigns/new`)
- Editar campaña (`/admin/newsletter/campaigns/[id]/edit`)
- Vista de campaña (`/admin/newsletter/campaigns/[id]`)
- Segmentación por status y tags
- Programación de envío
- Métricas: enviados, entregados, abiertos, clicks, bounces

**Tablas:**
- `newsletter_campaigns` (lectura/escritura)
- `newsletter_campaign_recipients` (lectura/escritura)
- `newsletter_campaign_events` (lectura)
- `newsletter_subscribers` (lectura)

#### Playlists (`/admin/playlists`)

**Descripción:** Gestión de playlists curadas de Spotify.

**Funcionalidades:**
- Lista de playlists
- Crear nueva playlist (`/admin/playlists/new`)
- Editar playlist (`/admin/playlists/edit/[id]`)
- Campos: título, descripción, URL de Spotify, imagen de portada, género
- Publicar/ocultar playlists
- Orden de visualización

**Tablas:**
- `playlists` (lectura/escritura)

#### Propuestas de Artistas (`/admin/artist-submissions`)

**Descripción:** Revisión de propuestas de artistas para incluir en playlists.

**Funcionalidades:**
- Lista de propuestas pendientes
- Ver detalles: artista, email, teléfono, URL de Spotify, track, género, redes sociales
- Cambiar estado: pending → reviewed → approved/rejected
- Agregar notas internas

**Tablas:**
- `artist_submissions` (lectura/escritura)

#### Blacktop (`/admin/blacktop`)

**Descripción:** Gestión completa de torneos de básquet.

**Subsecciones:**

**Lista de Torneos (`/admin/blacktop`):**
- Ver todos los torneos
- Crear nuevo torneo (`/admin/blacktop/new`)
- Filtrar por estado (draft, groups, playoffs, finished)

**Tablas:** `tournaments` (lectura)

**Vista de Torneo (`/admin/blacktop/[id]`):**
- Información general del torneo
- Configuración de formato (grupos, playoffs)
- Equipos registrados
- Fixture (partidos programados)
- Estadísticas y rankings
- Galería de medios

**Tablas:**
- `tournaments` (lectura/escritura)
- `teams` (lectura/escritura)
- `players` (lectura/escritura)
- `matches` (lectura/escritura)
- `groups` (lectura/escritura)
- `player_match_stats` (lectura/escritura)
- `team_match_stats` (lectura/escritura)
- `tournament_media` (lectura/escritura)

**Editar Torneo (`/admin/blacktop/[id]/edit`):**
- Formulario completo de edición
- Configuración de formato y reglas
- Branding (colores, banner, flyers)

**Tablas:** `tournaments` (escritura)

#### Popups (`/admin/popovers`)

**Descripción:** Gestión de popups modales del sitio web.

**Funcionalidades:**
- Lista de popups
- Crear nuevo popup (`/admin/popovers/new`)
- Configurar tipo (simple, descuento, email-gate, newsletter, custom)
- Segmentación por secciones y rutas
- Programación de fechas
- Delay de aparición
- Persistencia de cierre

**Tablas:**
- `popovers` (lectura/escritura)

#### Cupones (`/admin/coupons`)

**Descripción:** Gestión de cupones de descuento.

**Funcionalidades:**
- Lista de cupones
- Crear nuevo cupón (`/admin/coupons/new`)
- Configurar porcentaje de descuento
- Límite de usos
- Fecha de expiración
- Activar/desactivar cupones

**Tablas:**
- `coupons` (lectura/escritura)

#### Busy Files (`/admin/files`)

**Descripción:** Sistema de gestión de archivos multimedia.

**Subsecciones:**

**Uploader (`/admin/files`):**
- Subida de archivos a R2
- Organización por carpetas/tags
- Vista previa de imágenes

**Tablas:** (probablemente tabla `files` o similar, no visible en schema pero referenciada)

**Ver Files (`/admin/files/entries`):**
- Lista de archivos subidos
- Editar metadata (`/admin/files/entries/[id]/edit`)
- Eliminar archivos

#### Guiones (`/admin/scripts`)

**Descripción:** Sistema de gestión de guiones para producción de video.

**Funcionalidades:**
- Lista de guiones
- Ver guion (`/admin/scripts/[id]`)
- Editor MDX con preview
- Gestión de escenas
- Versiones del guion
- Assets multimedia
- Comentarios y feedback

**Tablas:**
- `scripts` (lectura/escritura)
- `script_scenes` (lectura/escritura)
- `script_versions` (lectura/escritura)
- `script_assets` (lectura/escritura)
- `script_comments` (lectura/escritura)
- `script_projects` (lectura)

### 4.4. Ventas

**Ruta base:** `/admin/orders`, `/admin/analytics`, `/admin/customers`

#### Inteligencia Comercial (`/admin/analytics`)

**Descripción:** Dashboard de analíticas y métricas de negocio.

**Funcionalidades:**
- Métricas de ventas (ingresos, pedidos, promedio)
- Productos más populares
- Ranking de clientes
- Análisis de canales de venta
- Gráficos de tendencias

**Tablas:**
- `orders` (agregaciones)
- `order_items` (agregaciones)
- `products` (agregaciones)
- `customers` (agregaciones)
- `product_views` (agregaciones)

#### Pedidos (`/admin/orders`)

**Descripción:** Gestión completa de pedidos.

**Funcionalidades:**
- Lista de todos los pedidos
- Filtros: estado, canal, método de pago
- Vista expandible con detalles completos
- Información de cliente
- Items del pedido
- Resumen financiero (subtotal, descuento, envío, total)
- Notas del pedido
- Estadísticas rápidas (ingresos, pagados, pendientes, promedio)

**Tablas:**
- `orders` (lectura)
- `order_items` (lectura)
- `customers` (lectura)

#### Detalle de Pedido (`/admin/orders/[id]`)

**Descripción:** Vista detallada de un pedido específico.

**Funcionalidades:**
- Información completa del pedido
- Items con variantes
- Datos de envío
- Historial de estados
- Actualizar estado manualmente
- Generar etiqueta de envío (integración con Envia)

**Tablas:**
- `orders` (lectura/escritura)
- `order_items` (lectura)
- `customers` (lectura)

#### Transferencias Pendientes (`/admin/orders/pending`)

**Descripción:** Vista filtrada de pedidos pendientes con método de pago "transferencia".

**Funcionalidades:**
- Lista de transferencias pendientes de confirmación
- Marcar como pagado
- Rechazar pedido

**Tablas:**
- `orders` (lectura/escritura, filtro: `status='pending' AND payment_method='transfer'`)

#### Ventas Manuales (`/admin/sales/manual`)

**Descripción:** Crear pedidos manualmente (para ventas fuera de la web).

**Funcionalidades:**
- Formulario para crear pedido manual
- Seleccionar productos y variantes
- Calcular totales
- Asignar cliente (existente o nuevo)
- Seleccionar canal (Instagram, Mercado Libre, feria, manual, etc.)
- Método de pago
- Notas adicionales

**Tablas:**
- `orders` (escritura)
- `order_items` (escritura)
- `customers` (lectura/escritura)
- `products` (lectura)
- `product_sizes` (lectura/escritura - actualización de stock)

#### Ranking de Clientes (`/admin/customers/ranking`)

**Descripción:** Ranking de clientes por volumen de compras.

**Funcionalidades:**
- Lista ordenada por total gastado
- Métricas por cliente: total de pedidos, monto total, promedio por pedido
- Ver historial de pedidos de un cliente

**Tablas:**
- `customers` (lectura)
- `orders` (agregaciones por `customer_id`)

### 4.5. Operaciones

**Ruta base:** `/admin/suppliers`, `/admin/expenses`, `/admin/settings`

#### Proveedores (`/admin/suppliers`)

**Descripción:** Gestión de proveedores y fabricantes.

**Funcionalidades:**
- Lista de proveedores
- Crear/editar proveedor
- Información de contacto
- Categorización y tags
- Información comercial (precios de referencia, MOQ, tiempos de entrega)
- Rating de confiabilidad

**Tablas:**
- `suppliers` (lectura/escritura)

#### Compras a Proveedores (`/admin/suppliers/purchases`)

**Descripción:** Registro de compras a proveedores.

**Funcionalidades:**
- Lista de compras
- Crear nueva compra
- Agregar items (productos y cantidades)
- Estados: ordered, received
- Actualizar stock al recibir compra

**Tablas:**
- `supplier_purchases` (lectura/escritura)
- `supplier_purchase_items` (lectura/escritura)
- `products` (lectura)
- `product_sizes` (escritura - actualización de stock)
- `suppliers` (lectura)

#### Gastos (`/admin/expenses`)

**Descripción:** Registro de gastos operativos.

**Funcionalidades:**
- Lista de gastos
- Crear nuevo gasto
- Categorización
- Asociar a proveedor (opcional)
- Canal de gasto
- Metadata adicional

**Tablas:**
- `expenses` (lectura/escritura)
- `suppliers` (lectura)

#### FAQs (`/admin/faqs`)

**Descripción:** Gestión de preguntas frecuentes.

**Funcionalidades:**
- Lista de FAQs
- Crear/editar/eliminar FAQ
- Categorización
- Orden de visualización
- Activar/desactivar

**Tablas:**
- `faqs` (lectura/escritura)

#### Configuración (`/admin/settings`)

**Descripción:** Configuración general de la tienda.

**Funcionalidades:**
- Tarifas de envío: tarifa plana, umbral de envío gratis, tarifa Mar del Plata
- Tarifas por provincia
- Carrier por defecto
- Modo especial (ej: navidad)
- Mensaje de envío gratis

**Tablas:**
- `shop_settings` (lectura/escritura)

### 4.6. Notificaciones

**Ruta:** `/admin/notifications`

**Descripción:** Centro de notificaciones del sistema.

**Funcionalidades:**
- Lista de notificaciones no leídas
- Marcar como leída
- Filtrar por tipo y prioridad
- Acciones rápidas desde notificaciones (ej: ir a pedido pendiente)

**Tablas:**
- `notifications` (lectura/escritura)
- `blacktop_notifications` (lectura/escritura)

#### Preferencias de Notificaciones (`/admin/notifications/preferences`)

**Descripción:** Configurar qué notificaciones recibir y por qué canal.

**Funcionalidades:**
- Lista de tipos de notificación
- Activar/desactivar por tipo
- Configurar canales (push, email)
- Prioridad por tipo

**Tablas:**
- `notification_preferences` (lectura/escritura)

---

## 5. Relación entre Admin y Datos

### 5.1. Flujo de una Compra Online

**1. Cliente navega y agrega productos al carrito**
- `product_views` se actualiza con acciones `view`, `click`, `add_to_cart`

**2. Cliente procede al checkout**
- Se crea una preferencia en Mercado Pago
- Se guarda estado temporal en `orders_tmp` con `session_id`

**3. Cliente paga en Mercado Pago**
- Mercado Pago envía webhook a `/api/mp/webhook`
- Se registra evento en `webhook_events`

**4. Webhook procesa el pago aprobado**
- Se crea registro en `orders` con `status='paid'`
- Se crean registros en `order_items` con los productos comprados
- Se actualiza `product_sizes.stock` (se decrementa el stock)
- Se crea o actualiza registro en `customers`
- Se crea notificación en `notifications` (tipo `new_order`)

**5. Admin ve el pedido**
- En `/admin/orders` aparece el pedido con estado "Pagado"
- Admin puede actualizar estado a "Enviado" cuando se despacha
- Se genera etiqueta de envío (integración con Envia)
- Se actualiza `orders.shipping_status` y `orders.tracking_number`

**6. Cliente recibe el pedido**
- Admin marca como "Completado" en `/admin/orders/[id]`
- Se actualiza `orders.status='completed'` y `orders.delivered_at`

### 5.2. Flujo de una Campaña de Newsletter

**1. Admin crea campaña**
- Se crea registro en `newsletter_campaigns` con `status='draft'`
- Se configura contenido, segmentación (`target_status`, `target_tags`), y CTAs

**2. Admin programa o envía campaña**
- Se actualiza `status='scheduled'` o `status='sending'`
- Se consulta `newsletter_subscribers` según filtros
- Se crean registros en `newsletter_campaign_recipients` para cada destinatario

**3. Sistema envía emails**
- Se actualiza `newsletter_campaign_recipients.status='sent'` y `sent_at`
- Se incrementa `newsletter_campaigns.sent_count`

**4. Tracking de eventos**
- Cuando usuario abre email: se crea registro en `newsletter_campaign_events` con `event_type='open'`
- Cuando usuario hace click: se crea registro con `event_type='click'` y `link_url`
- Se actualizan contadores en `newsletter_campaigns`: `opened_count`, `clicked_count`

**5. Métricas en admin**
- En `/admin/newsletter/campaigns/[id]` se ven todas las métricas
- Gráficos de apertura y clicks por fecha

### 5.3. Flujo de un Torneo de Blacktop

**1. Admin crea torneo**
- Se crea registro en `tournaments` con `tournament_status='draft'`
- Se configura formato, fechas, reglas, branding

**2. Equipos se registran**
- Se crean registros en `teams` con `status='pending'`
- Admin aprueba equipos: `teams.status='approved'`
- Se crean registros en `players` para cada jugador

**3. Admin configura grupos y fixture**
- Se crean registros en `groups`
- Se asignan equipos a grupos: `teams.group_id`
- Se generan partidos en `matches` con `phase='groups'`

**4. Durante el torneo**
- Admin usa scorekeeper en vivo para actualizar `matches`
- Se actualizan `team_a_score`, `team_b_score`, `current_period`, `elapsed_seconds`
- Se registran estadísticas en `player_match_stats` y `team_match_stats`
- Se selecciona MVP: `player_match_stats.is_mvp=true`

**5. Avance a playoffs**
- Admin marca fase de grupos como completada
- Se actualiza `tournament_status='playoffs'`
- Se generan partidos de playoffs con `phase='quarterfinals'` o `semifinals'`
- Se actualiza `matches.winner_id` al finalizar cada partido

**6. Finalización**
- Se actualiza `tournament_status='finished'`
- Se guarda `tournament.mvp_player_id` y `tournament.champion_team_id`
- Se actualizan `player_profiles` con estadísticas acumuladas

### 5.4. Flujo de Integración con Mercado Pago

**1. Cliente inicia checkout**
- Frontend llama a `/api/mp/create-preference`
- Se crea preferencia en Mercado Pago
- Se guarda estado en `orders_tmp` con `session_id` y `preference_id`

**2. Cliente es redirigido a Mercado Pago**
- Paga en la plataforma de MP

**3. Mercado Pago envía webhook**
- POST a `/api/mp/webhook?token=SECRET`
- Se valida token de seguridad
- Se registra evento en `webhook_events`

**4. Webhook procesa según tipo de evento**
- Si `event_type='payment'` y `status='approved'`:
  - Se crea orden en `orders` con `status='paid'`
  - Se crean `order_items`
  - Se decrementa stock en `product_sizes`
  - Se crea/actualiza `customers`
  - Se crea notificación

**5. Admin ve el pedido**
- Aparece en `/admin/orders` con estado "Pagado"
- Se puede ver `payment_id` y `preference_id` para referencia

### 5.5. Flujo de Actualización de Stock

**Stock se actualiza automáticamente en estos casos:**

1. **Pedido pagado (webhook de Mercado Pago)**
   - Se decrementa `product_sizes.stock` según `order_items.quantity`

2. **Venta manual (`/admin/sales/manual`)**
   - Admin crea pedido manual
   - Se decrementa stock al confirmar

3. **Compra a proveedor recibida (`/admin/suppliers/purchases`)**
   - Admin marca compra como "received"
   - Se incrementa `product_sizes.stock` según `supplier_purchase_items.quantity`

4. **Actualización manual (`/admin/stock`)**
   - Admin actualiza stock directamente

**Notificaciones de bajo stock:**
- Si `product_sizes.stock` cae por debajo de un umbral, se crea notificación tipo `low_stock`

---

## 6. Glosario

### Términos del Ecommerce

**Drop**
- Lanzamiento de una colección limitada de productos. Los "drops" son productos propios de Busy, a diferencia de los productos de reventa.

**SKU (Stock Keeping Unit)**
- Código único que identifica un producto. Se usa para inventario y puede tener formato como "BSY-HOODIE-BLK-M" (Busy-Hoodie-Black-Medium).

**Variante**
- Combinación de atributos de un producto (color + talle). Ej: "Hoodie Negro Talle M" es una variante del producto "Hoodie".

**Canal de Venta**
- Origen de un pedido. Canales disponibles: `web` (tienda online), `instagram` (venta por Instagram), `mercado_libre` (Mercado Libre), `feria` (feria física), `manual` (venta manual registrada en admin), `other`.

**Estado de Pedido**
- `pending`: Pendiente de pago (transferencias)
- `paid`: Pagado y confirmado
- `shipped`: Enviado
- `completed`: Entregado al cliente
- `cancelled`: Cancelado

**Estado de Envío**
- `pending`: Pendiente de crear etiqueta
- `label_created`: Etiqueta creada
- `shipped`: En tránsito
- `in_transit`: En camino
- `out_for_delivery`: En reparto
- `delivered`: Entregado
- `failed`: Falló la entrega
- `returned`: Devuelto al remitente

**Promoción**
- Regla de descuento configurable. Tipos: NxM (ej: 2x1), porcentaje de descuento, monto fijo, combos, bundles.

**Cupón**
- Código de descuento simple con porcentaje fijo. Se aplica manualmente en checkout.

### Términos de Marketing

**Campaña**
- Envío masivo de emails a suscriptores del newsletter. Incluye segmentación, programación y tracking de métricas.

**Popover (Popup)**
- Modal que aparece en el sitio web. Puede ser simple, con descuento, con captura de email, o personalizado.

**Segmentación**
- Filtrado de audiencia por `status` (subscribed/pending/unsubscribed) y `tags` (arrays de etiquetas).

**Tags**
- Etiquetas para categorizar suscriptores, clientes o productos. Permiten segmentación y filtrado.

### Términos de Blacktop

**Torneo**
- Evento de básquet 3x3 o 4x4 organizado por Busy. Incluye fase de grupos y playoffs.

**Fase de Grupos**
- Primera fase del torneo donde equipos se dividen en grupos y juegan round-robin. Los mejores de cada grupo avanzan a playoffs.

**Playoffs**
- Fase eliminatoria del torneo (cuartos de final, semifinales, tercer puesto, final).

**Fixture**
- Calendario de partidos del torneo. Incluye fecha, hora, equipos y resultados.

**Scorekeeper**
- Herramienta en vivo para actualizar puntajes y estadísticas durante un partido. Permite pausar, reanudar y avanzar períodos.

**MVP (Most Valuable Player)**
- Jugador destacado de un partido. Se selecciona manualmente y se registra en `player_match_stats.is_mvp`.

**Golden Point**
- Regla opcional donde si un partido termina empatado, se juega un punto de oro para definir el ganador.

### Términos Técnicos

**MDX**
- Formato que combina Markdown con JSX. Se usa para artículos del blog y guiones, permitiendo componentes React dentro del contenido.

**Webhook**
- Notificación HTTP que envía un servicio externo (ej: Mercado Pago) cuando ocurre un evento. Permite integración en tiempo real.

**RLS (Row Level Security)**
- Política de seguridad de Supabase que controla qué registros puede ver/editar cada usuario según reglas definidas.

**JSONB**
- Tipo de dato de PostgreSQL que almacena JSON de forma binaria. Permite consultas eficientes y estructura flexible.

**tsvector**
- Tipo de dato de PostgreSQL para búsqueda full-text. Se usa en `scripts.search_index` para búsqueda rápida de guiones.

---

## Notas Finales

Esta documentación está diseñada para ser un recurso vivo que se actualiza conforme evoluciona el sistema. Si encuentras información desactualizada o tienes sugerencias de mejora, por favor actualiza este documento.

**Última actualización:** [Fecha de generación del documento]

**Mantenido por:** Equipo de desarrollo de Busy

