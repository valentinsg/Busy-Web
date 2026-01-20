/**
 * Tipos TypeScript para integración con Airtable
 *
 * Estos tipos representan los objetos que vienen de Airtable
 * y los que el frontend consume después de transformación.
 */

// ============================================================================
// Base: Marketing & Contenido
// ============================================================================

export type CampaignType =
  | 'Email'
  | 'Social Media'
  | 'Promoción'
  | 'Lanzamiento'
  | 'Evento'
  | 'Otro'

export type CampaignStatus =
  | 'Idea'
  | 'Planificando'
  | 'Activa'
  | 'Pausada'
  | 'Finalizada'
  | 'Cancelada'

export interface Campaign {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  startDate: string | null
  endDate: string | null
  objective: string | null
  budget: number | null
  actualSpend: number | null
  targetMetrics: string | null
  actualMetrics: string | null
  relatedProductIds: string[] // IDs de productos en Supabase
  contentPiecesIds: string[]
  channels: string[]
  responsible: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type ContentPieceType =
  | 'Post Instagram'
  | 'Story'
  | 'Reel'
  | 'TikTok'
  | 'Email'
  | 'Banner Web'
  | 'Blog'
  | 'Video'
  | 'Otro'

export type ContentPieceStatus =
  | 'Idea'
  | 'En Producción'
  | 'Programado'
  | 'Publicado'
  | 'Archivado'

export interface ContentPiece {
  id: string
  title: string
  type: ContentPieceType
  status: ContentPieceStatus
  campaignId: string | null
  channelId: string | null
  scheduledDate: string | null
  publishedDate: string | null
  url: string | null
  content: string | null
  hashtags: string[]
  mentions: string[]
  assetUrls: string[] // URLs de attachments
  productIds: string[] // IDs de productos en Supabase
  metrics: string | null
  responsible: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type ChannelType =
  | 'Instagram'
  | 'TikTok'
  | 'Facebook'
  | 'Email'
  | 'Web'
  | 'WhatsApp'
  | 'YouTube'
  | 'Otro'

export interface Channel {
  id: string
  name: string
  type: ChannelType
  handle: string | null
  active: boolean
  followers: number | null
  description: string | null
  responsible: string | null
  createdAt: string
}

// ============================================================================
// Base: Colaboraciones & Partners
// ============================================================================

export type TalentType =
  | 'Modelo'
  | 'Influencer'
  | 'Atleta'
  | 'Artista'
  | 'Otro'

export type TalentSpecialty =
  | 'Fotografía'
  | 'Video'
  | 'Modelaje'
  | 'Contenido'
  | 'Otro'

export type TalentStatus =
  | 'Activo'
  | 'Inactivo'
  | 'En Evaluación'

export interface Talent {
  id: string
  name: string
  instagram: string | null
  email: string | null
  phone: string | null
  city: string | null
  types: TalentType[]
  specialty: TalentSpecialty | null
  preferredSize: string | null
  rating: number | null
  status: TalentStatus
  agreementIds: string[]
  notes: string | null
  createdAt: string
}

export type InfluencerNiche =
  | 'Streetwear'
  | 'Lifestyle'
  | 'Fitness'
  | 'Música'
  | 'Gaming'
  | 'Otro'

export type AudienceSize =
  | 'Nano (1K-10K)'
  | 'Micro (10K-100K)'
  | 'Mid (100K-1M)'
  | 'Macro (1M+)'

export type InfluencerStatus =
  | 'Activo'
  | 'Inactivo'
  | 'En Negociación'

export interface Influencer {
  id: string
  name: string
  instagram: string | null
  tiktok: string | null
  email: string | null
  agency: string | null
  instagramFollowers: number | null
  tiktokFollowers: number | null
  niches: InfluencerNiche[]
  audienceSize: AudienceSize | null
  engagementRate: number | null
  postRate: number | null
  storyRate: number | null
  reelRate: number | null
  rating: number | null
  status: InfluencerStatus
  agreementIds: string[]
  notes: string | null
  createdAt: string
}

export type SponsorType =
  | 'Marca'
  | 'Evento'
  | 'Organización'
  | 'Otro'

export type SponsorIndustry =
  | 'Streetwear'
  | 'Deportes'
  | 'Música'
  | 'Tecnología'
  | 'Otro'

export type SponsorStatus =
  | 'Activo'
  | 'Inactivo'
  | 'En Negociación'
  | 'Finalizado'

export interface Sponsor {
  id: string
  name: string
  type: SponsorType
  primaryContact: string | null
  email: string | null
  phone: string | null
  website: string | null
  industry: SponsorIndustry | null
  agreementValue: number | null
  status: SponsorStatus
  agreementIds: string[]
  notes: string | null
  createdAt: string
}

export type AgreementType =
  | 'Colaboración'
  | 'Sponsor'
  | 'Modelo'
  | 'Evento'
  | 'Otro'

export type PaymentMethod =
  | 'Pago Único'
  | 'Mensual'
  | 'Por Pieza'
  | 'Por Métricas'
  | 'Otro'

export type AgreementStatus =
  | 'Borrador'
  | 'En Negociación'
  | 'Activo'
  | 'Completado'
  | 'Cancelado'

export interface Agreement {
  id: string
  name: string
  type: AgreementType
  talentId: string | null
  influencerId: string | null
  sponsorId: string | null
  campaignId: string | null // Referencia a campaña en Airtable
  eventId: string | null // Referencia a evento en Airtable
  startDate: string | null
  endDate: string | null
  totalValue: number | null
  paymentMethod: PaymentMethod | null
  deliverables: string | null
  terms: string | null
  status: AgreementStatus
  documentUrls: string[]
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Base: Eventos
// ============================================================================

export type EventType =
  | 'Torneo Blacktop'
  | 'Lanzamiento'
  | 'Pop-up'
  | 'Feria'
  | 'Concierto'
  | 'Otro'

export type EventStatus =
  | 'Planificando'
  | 'Confirmado'
  | 'En Curso'
  | 'Finalizado'
  | 'Cancelado'

export interface Event {
  id: string
  name: string
  type: EventType
  startDate: string | null
  endDate: string | null
  location: string | null
  city: string | null
  description: string | null
  status: EventStatus
  budget: number | null
  actualSpend: number | null
  expectedAttendees: number | null
  actualAttendees: number | null
  tournamentId: string | null // ID del torneo en Supabase
  campaignId: string | null // ID de campaña en Airtable
  sponsorIds: string[]
  taskIds: string[]
  postEventMetricsId: string | null
  responsible: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type TaskStatus =
  | 'Pendiente'
  | 'En Progreso'
  | 'Completada'
  | 'Cancelada'

export type TaskPriority =
  | 'Baja'
  | 'Media'
  | 'Alta'
  | 'Crítica'

export interface Task {
  id: string
  title: string
  eventId: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assignedTo: string | null
  description: string | null
  completed: boolean
  completedDate: string | null
  notes: string | null
  createdAt: string
}

export interface PostEventMetrics {
  id: string
  eventId: string
  measurementDate: string | null
  attendees: number | null
  eventSales: number | null
  productsSold: number | null
  newInstagramFollowers: number | null
  newNewsletterSubscribers: number | null
  socialEngagement: number | null
  reach: number | null
  roi: number | null
  notes: string | null
  createdAt: string
}

// ============================================================================
// Tipos de respuesta de API
// ============================================================================

export interface AirtableListResponse<T> {
  items: T[]
  total: number
  page?: number
  pageSize?: number
}

export interface AirtableItemResponse<T> {
  item: T
}

// ============================================================================
// Tipos para filtros y queries
// ============================================================================

export interface CampaignFilters {
  status?: CampaignStatus[]
  type?: CampaignType[]
  startDateFrom?: string
  startDateTo?: string
  search?: string
}

export interface ContentPieceFilters {
  status?: ContentPieceStatus[]
  type?: ContentPieceType[]
  campaignId?: string
  channelId?: string
  search?: string
}

export interface EventFilters {
  status?: EventStatus[]
  type?: EventType[]
  startDateFrom?: string
  startDateTo?: string
  search?: string
}

