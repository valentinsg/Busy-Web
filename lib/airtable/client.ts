/**
 * SDK de Airtable para Next.js
 *
 * Wrapper tipado sobre la API oficial de Airtable.
 * Maneja autenticación, transformación de datos y errores.
 */

import type {
  Agreement,
  Campaign,
  CampaignFilters,
  Channel,
  ContentPiece,
  ContentPieceFilters,
  Event,
  EventFilters,
  Influencer,
  PostEventMetrics,
  Sponsor,
  Talent,
  Task,
} from '@/types/airtable'
import Airtable from 'airtable'

// Configuración de bases
// Configuración de bases
function getBase(baseId: string | undefined, name: string) {
  if (!process.env.AIRTABLE_API_KEY) {
    throw new Error('AIRTABLE_API_KEY is not defined')
  }
  if (!baseId) {
    throw new Error(`Airtable Base ID for ${name} is not defined`)
  }
  return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(baseId)
}

function getMarketingBase() {
  return getBase(process.env.AIRTABLE_BASE_MARKETING, 'MARKETING')
}

function getCollaborationsBase() {
  return getBase(process.env.AIRTABLE_BASE_COLLABORATIONS, 'COLLABORATIONS')
}

function getEventsBase() {
  return getBase(process.env.AIRTABLE_BASE_EVENTS, 'EVENTS')
}

// ============================================================================
// Helpers de transformación
// ============================================================================

function transformRecord<T>(record: Airtable.Record<any>, mapper: (fields: any) => T): T {
  return mapper(record.fields)
}

function transformAttachment(attachment: any): string {
  return attachment?.url || ''
}

function transformAttachments(attachments: any[]): string[] {
  return (attachments || []).map(transformAttachment)
}

function transformLink(link: string[]): string[] {
  return link || []
}

function transformSingleLink(link: string[]): string | null {
  return link && link.length > 0 ? link[0] : null
}

// ============================================================================
// Marketing & Contenido
// ============================================================================

export async function listCampaigns(filters?: CampaignFilters, pageSize = 100): Promise<Campaign[]> {
  try {
    const records = await getMarketingBase()('Campañas')
      .select({
        maxRecords: pageSize,
        sort: [{ field: 'Creado', direction: 'desc' }],
        filterByFormula: buildCampaignFilter(filters),
      })
      .all()

    return records.map((record) =>
      transformRecord(record, (fields) => ({
        id: record.id,
        name: fields['Nombre'] || '',
        type: fields['Tipo'] || 'Otro',
        status: fields['Estado'] || 'Idea',
        startDate: fields['Fecha Inicio'] || null,
        endDate: fields['Fecha Fin'] || null,
        objective: fields['Objetivo'] || null,
        budget: fields['Presupuesto'] || null,
        actualSpend: fields['Gasto Real'] || null,
        targetMetrics: fields['Métricas Objetivo'] || null,
        actualMetrics: fields['Métricas Real'] || null,
        relatedProductIds: fields['Productos Relacionados'] || [],
        contentPiecesIds: transformLink(fields['Piezas de Contenido'] || []),
        channels: fields['Canales'] || [],
        responsible: fields['Responsable'] || null,
        notes: fields['Notas'] || null,
        createdAt: fields['Creado'] || new Date().toISOString(),
        updatedAt: fields['Actualizado'] || new Date().toISOString(),
      }))
    )
  } catch (error) {
    console.error('Error listing campaigns:', error)
    throw new Error('Failed to fetch campaigns')
  }
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  try {
    const record = await getMarketingBase()('Campañas').find(id)
    return transformRecord(record, (fields) => ({
      id: record.id,
      name: fields['Nombre'] || '',
      type: fields['Tipo'] || 'Otro',
      status: fields['Estado'] || 'Idea',
      startDate: fields['Fecha Inicio'] || null,
      endDate: fields['Fecha Fin'] || null,
      objective: fields['Objetivo'] || null,
      budget: fields['Presupuesto'] || null,
      actualSpend: fields['Gasto Real'] || null,
      targetMetrics: fields['Métricas Objetivo'] || null,
      actualMetrics: fields['Métricas Real'] || null,
      relatedProductIds: fields['Productos Relacionados'] || [],
      contentPiecesIds: transformLink(fields['Piezas de Contenido'] || []),
      channels: fields['Canales'] || [],
      responsible: fields['Responsable'] || null,
      notes: fields['Notas'] || null,
      createdAt: fields['Creado'] || new Date().toISOString(),
      updatedAt: fields['Actualizado'] || new Date().toISOString(),
    }))
  } catch (error) {
    if ((error as any).error === 'NOT_FOUND') return null
    console.error('Error getting campaign:', error)
    throw new Error('Failed to fetch campaign')
  }
}

export async function updateCampaignStatus(id: string, status: Campaign['status']): Promise<Campaign> {
  try {
    const record = await getMarketingBase()('Campañas').update(id, {
      'Estado': status,
    })
    return transformRecord(record, (fields) => ({
      id: record.id,
      name: fields['Nombre'] || '',
      type: fields['Tipo'] || 'Otro',
      status: fields['Estado'] || 'Idea',
      startDate: fields['Fecha Inicio'] || null,
      endDate: fields['Fecha Fin'] || null,
      objective: fields['Objetivo'] || null,
      budget: fields['Presupuesto'] || null,
      actualSpend: fields['Gasto Real'] || null,
      targetMetrics: fields['Métricas Objetivo'] || null,
      actualMetrics: fields['Métricas Real'] || null,
      relatedProductIds: fields['Productos Relacionados'] || [],
      contentPiecesIds: transformLink(fields['Piezas de Contenido'] || []),
      channels: fields['Canales'] || [],
      responsible: fields['Responsable'] || null,
      notes: fields['Notas'] || null,
      createdAt: fields['Creado'] || new Date().toISOString(),
      updatedAt: fields['Actualizado'] || new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Error updating campaign status:', error)
    throw new Error('Failed to update campaign')
  }
}

export async function listContentPieces(filters?: ContentPieceFilters, pageSize = 100): Promise<ContentPiece[]> {
  try {
    const records = await getMarketingBase()('Piezas de Contenido')
      .select({
        maxRecords: pageSize,
        sort: [{ field: 'Creado', direction: 'desc' }],
        filterByFormula: buildContentPieceFilter(filters),
      })
      .all()

    return records.map((record) =>
      transformRecord(record, (fields) => ({
        id: record.id,
        title: fields['Título'] || '',
        type: fields['Tipo'] || 'Otro',
        status: fields['Estado'] || 'Idea',
        campaignId: transformSingleLink(fields['Campaña'] || []),
        channelId: transformSingleLink(fields['Canal'] || []),
        scheduledDate: fields['Fecha Programada'] || null,
        publishedDate: fields['Fecha Publicación'] || null,
        url: fields['URL'] || null,
        content: fields['Contenido'] || null,
        hashtags: fields['Hashtags'] || [],
        mentions: fields['Menciones'] || [],
        assetUrls: transformAttachments(fields['Assets'] || []),
        productIds: fields['Productos Mencionados'] || [],
        metrics: fields['Métricas'] || null,
        responsible: fields['Responsable'] || null,
        notes: fields['Notas'] || null,
        createdAt: fields['Creado'] || new Date().toISOString(),
        updatedAt: fields['Actualizado'] || new Date().toISOString(),
      }))
    )
  } catch (error) {
    console.error('Error listing content pieces:', error)
    throw new Error('Failed to fetch content pieces')
  }
}

export async function updateContentPieceStatus(id: string, status: ContentPiece['status']): Promise<ContentPiece> {
  try {
    const record = await getMarketingBase()('Piezas de Contenido').update(id, {
      'Estado': status,
    })
    return transformRecord(record, (fields) => ({
      id: record.id,
      title: fields['Título'] || '',
      type: fields['Tipo'] || 'Otro',
      status: fields['Estado'] || 'Idea',
      campaignId: transformSingleLink(fields['Campaña'] || []),
      channelId: transformSingleLink(fields['Canal'] || []),
      scheduledDate: fields['Fecha Programada'] || null,
      publishedDate: fields['Fecha Publicación'] || null,
      url: fields['URL'] || null,
      content: fields['Contenido'] || null,
      hashtags: fields['Hashtags'] || [],
      mentions: fields['Menciones'] || [],
      assetUrls: transformAttachments(fields['Assets'] || []),
      productIds: fields['Productos Mencionados'] || [],
      metrics: fields['Métricas'] || null,
      responsible: fields['Responsable'] || null,
      notes: fields['Notas'] || null,
      createdAt: fields['Creado'] || new Date().toISOString(),
      updatedAt: fields['Actualizado'] || new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Error updating content piece status:', error)
    throw new Error('Failed to update content piece')
  }
}

export async function listChannels(): Promise<Channel[]> {
  try {
    const records = await getMarketingBase()('Canales')
      .select({
        sort: [{ field: 'Nombre', direction: 'asc' }],
      })
      .all()

    return records.map((record) =>
      transformRecord(record, (fields) => ({
        id: record.id,
        name: fields['Nombre'] || '',
        type: fields['Tipo'] || 'Otro',
        handle: fields['Handle/URL'] || null,
        active: fields['Activo'] || false,
        followers: fields['Seguidores'] || null,
        description: fields['Descripción'] || null,
        responsible: fields['Responsable'] || null,
        createdAt: fields['Creado'] || new Date().toISOString(),
      }))
    )
  } catch (error) {
    console.error('Error listing channels:', error)
    throw new Error('Failed to fetch channels')
  }
}

// ============================================================================
// Colaboraciones & Partners
// ============================================================================

export async function listTalents(): Promise<Talent[]> {
  try {
    const records = await getCollaborationsBase()('Modelos/Talentos')
      .select({
        sort: [{ field: 'Nombre', direction: 'asc' }],
      })
      .all()

    return records.map((record) =>
      transformRecord(record, (fields) => ({
        id: record.id,
        name: fields['Nombre'] || '',
        instagram: fields['Instagram'] || null,
        email: fields['Email'] || null,
        phone: fields['Teléfono'] || null,
        city: fields['Ciudad'] || null,
        types: fields['Tipo'] || [],
        specialty: fields['Especialidad'] || null,
        preferredSize: fields['Talla Preferida'] || null,
        rating: fields['Rating'] || null,
        status: fields['Estado'] || 'Inactivo',
        agreementIds: transformLink(fields['Acuerdos'] || []),
        notes: fields['Notas'] || null,
        createdAt: fields['Creado'] || new Date().toISOString(),
      }))
    )
  } catch (error) {
    console.error('Error listing talents:', error)
    throw new Error('Failed to fetch talents')
  }
}

export async function listInfluencers(): Promise<Influencer[]> {
  try {
    const records = await getCollaborationsBase()('Influencers')
      .select({
        sort: [{ field: 'Nombre', direction: 'asc' }],
      })
      .all()

    return records.map((record) =>
      transformRecord(record, (fields) => ({
        id: record.id,
        name: fields['Nombre'] || '',
        instagram: fields['Instagram'] || null,
        tiktok: fields['TikTok'] || null,
        email: fields['Email'] || null,
        agency: fields['Agencia'] || null,
        instagramFollowers: fields['Seguidores Instagram'] || null,
        tiktokFollowers: fields['Seguidores TikTok'] || null,
        niches: fields['Nicho'] || [],
        audienceSize: fields['Audiencia'] || null,
        engagementRate: fields['Engagement Rate'] || null,
        postRate: fields['Tarifa Post'] || null,
        storyRate: fields['Tarifa Story'] || null,
        reelRate: fields['Tarifa Reel'] || null,
        rating: fields['Rating'] || null,
        status: fields['Estado'] || 'Inactivo',
        agreementIds: transformLink(fields['Acuerdos'] || []),
        notes: fields['Notas'] || null,
        createdAt: fields['Creado'] || new Date().toISOString(),
      }))
    )
  } catch (error) {
    console.error('Error listing influencers:', error)
    throw new Error('Failed to fetch influencers')
  }
}

export async function listSponsors(): Promise<Sponsor[]> {
  try {
    const records = await getCollaborationsBase()('Sponsors')
      .select({
        sort: [{ field: 'Nombre', direction: 'asc' }],
      })
      .all()

    return records.map((record) =>
      transformRecord(record, (fields) => ({
        id: record.id,
        name: fields['Nombre'] || '',
        type: fields['Tipo'] || 'Otro',
        primaryContact: fields['Contacto Principal'] || null,
        email: fields['Email'] || null,
        phone: fields['Teléfono'] || null,
        website: fields['Website'] || null,
        industry: fields['Industria'] || null,
        agreementValue: fields['Valor del Acuerdo'] || null,
        status: fields['Estado'] || 'Inactivo',
        agreementIds: transformLink(fields['Acuerdos'] || []),
        notes: fields['Notas'] || null,
        createdAt: fields['Creado'] || new Date().toISOString(),
      }))
    )
  } catch (error) {
    console.error('Error listing sponsors:', error)
    throw new Error('Failed to fetch sponsors')
  }
}

export async function listAgreements(): Promise<Agreement[]> {
  try {
    const records = await getCollaborationsBase()('Acuerdos')
      .select({
        sort: [{ field: 'Creado', direction: 'desc' }],
      })
      .all()

    return records.map((record) =>
      transformRecord(record, (fields) => ({
        id: record.id,
        name: fields['Nombre'] || '',
        type: fields['Tipo'] || 'Otro',
        talentId: transformSingleLink(fields['Modelo/Talento'] || []),
        influencerId: transformSingleLink(fields['Influencer'] || []),
        sponsorId: transformSingleLink(fields['Sponsor'] || []),
        campaignId: fields['Campaña'] || null,
        eventId: fields['Evento'] || null,
        startDate: fields['Fecha Inicio'] || null,
        endDate: fields['Fecha Fin'] || null,
        totalValue: fields['Valor Total'] || null,
        paymentMethod: fields['Forma de Pago'] || null,
        deliverables: fields['Entregables'] || null,
        terms: fields['Términos'] || null,
        status: fields['Estado'] || 'Borrador',
        documentUrls: transformAttachments(fields['Documento'] || []),
        notes: fields['Notas'] || null,
        createdAt: fields['Creado'] || new Date().toISOString(),
        updatedAt: fields['Actualizado'] || new Date().toISOString(),
      }))
    )
  } catch (error) {
    console.error('Error listing agreements:', error)
    throw new Error('Failed to fetch agreements')
  }
}

// ============================================================================
// Eventos
// ============================================================================

export async function listEvents(filters?: EventFilters, pageSize = 100): Promise<Event[]> {
  try {
    const records = await getEventsBase()('Eventos')
      .select({
        maxRecords: pageSize,
        sort: [{ field: 'Fecha Inicio', direction: 'desc' }],
        filterByFormula: buildEventFilter(filters),
      })
      .all()

    return records.map((record) =>
      transformRecord(record, (fields) => ({
        id: record.id,
        name: fields['Nombre'] || '',
        type: fields['Tipo'] || 'Otro',
        startDate: fields['Fecha Inicio'] || null,
        endDate: fields['Fecha Fin'] || null,
        location: fields['Ubicación'] || null,
        city: fields['Ciudad'] || null,
        description: fields['Descripción'] || null,
        status: fields['Estado'] || 'Planificando',
        budget: fields['Presupuesto'] || null,
        actualSpend: fields['Gasto Real'] || null,
        expectedAttendees: fields['Asistentes Esperados'] || null,
        actualAttendees: fields['Asistentes Reales'] || null,
        tournamentId: fields['Torneo Relacionado'] || null,
        campaignId: fields['Campaña'] || null,
        sponsorIds: transformLink(fields['Sponsors'] || []),
        taskIds: transformLink(fields['Tareas'] || []),
        postEventMetricsId: transformSingleLink(fields['Métricas Post-Evento'] || []),
        responsible: fields['Responsable'] || null,
        notes: fields['Notas'] || null,
        createdAt: fields['Creado'] || new Date().toISOString(),
        updatedAt: fields['Actualizado'] || new Date().toISOString(),
      }))
    )
  } catch (error) {
    console.error('Error listing events:', error)
    throw new Error('Failed to fetch events')
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const record = await getEventsBase()('Eventos').find(id)
    return transformRecord(record, (fields) => ({
      id: record.id,
      name: fields['Nombre'] || '',
      type: fields['Tipo'] || 'Otro',
      startDate: fields['Fecha Inicio'] || null,
      endDate: fields['Fecha Fin'] || null,
      location: fields['Ubicación'] || null,
      city: fields['Ciudad'] || null,
      description: fields['Descripción'] || null,
      status: fields['Estado'] || 'Planificando',
      budget: fields['Presupuesto'] || null,
      actualSpend: fields['Gasto Real'] || null,
      expectedAttendees: fields['Asistentes Esperados'] || null,
      actualAttendees: fields['Asistentes Reales'] || null,
      tournamentId: fields['Torneo Relacionado'] || null,
      campaignId: fields['Campaña'] || null,
      sponsorIds: transformLink(fields['Sponsors'] || []),
      taskIds: transformLink(fields['Tareas'] || []),
      postEventMetricsId: transformSingleLink(fields['Métricas Post-Evento'] || []),
      responsible: fields['Responsable'] || null,
      notes: fields['Notas'] || null,
      createdAt: fields['Creado'] || new Date().toISOString(),
      updatedAt: fields['Actualizado'] || new Date().toISOString(),
    }))
  } catch (error) {
    if ((error as any).error === 'NOT_FOUND') return null
    console.error('Error getting event:', error)
    throw new Error('Failed to fetch event')
  }
}

export async function listTasks(eventId?: string): Promise<Task[]> {
  try {
    const records = await getEventsBase()('Tareas')
      .select({
        sort: [{ field: 'Fecha Límite', direction: 'asc' }],
        filterByFormula: eventId ? `{Evento} = "${eventId}"` : undefined,
      })
      .all()

    return records.map((record) =>
      transformRecord(record, (fields) => ({
        id: record.id,
        title: fields['Título'] || '',
        eventId: transformSingleLink(fields['Evento'] || []) || '',
        status: fields['Estado'] || 'Pendiente',
        priority: fields['Prioridad'] || 'Media',
        dueDate: fields['Fecha Límite'] || null,
        assignedTo: fields['Asignado a'] || null,
        description: fields['Descripción'] || null,
        completed: fields['Completada'] || false,
        completedDate: fields['Fecha Completada'] || null,
        notes: fields['Notas'] || null,
        createdAt: fields['Creado'] || new Date().toISOString(),
      }))
    )
  } catch (error) {
    console.error('Error listing tasks:', error)
    throw new Error('Failed to fetch tasks')
  }
}

export async function getPostEventMetrics(id: string): Promise<PostEventMetrics | null> {
  try {
    const record = await getEventsBase()('Métricas Post-Evento').find(id)
    return transformRecord(record, (fields) => ({
      id: record.id,
      eventId: transformSingleLink(fields['Evento'] || []) || '',
      measurementDate: fields['Fecha Medición'] || null,
      attendees: fields['Asistentes'] || null,
      eventSales: fields['Ventas en Evento'] || null,
      productsSold: fields['Productos Vendidos'] || null,
      newInstagramFollowers: fields['Nuevos Seguidores Instagram'] || null,
      newNewsletterSubscribers: fields['Nuevos Suscriptores Newsletter'] || null,
      socialEngagement: fields['Engagement Social'] || null,
      reach: fields['Alcance'] || null,
      roi: fields['ROI'] || null,
      notes: fields['Notas'] || null,
      createdAt: fields['Creado'] || new Date().toISOString(),
    }))
  } catch (error) {
    if ((error as any).error === 'NOT_FOUND') return null
    console.error('Error getting post-event metrics:', error)
    throw new Error('Failed to fetch post-event metrics')
  }
}

// ============================================================================
// Helpers de filtros (formulas de Airtable)
// ============================================================================

function buildCampaignFilter(filters?: CampaignFilters): string | undefined {
  if (!filters) return undefined

  const conditions: string[] = []

  if (filters.status && filters.status.length > 0) {
    const statusConditions = filters.status.map((s) => `{Estado} = "${s}"`).join(', ')
    conditions.push(`OR(${statusConditions})`)
  }

  if (filters.type && filters.type.length > 0) {
    const typeConditions = filters.type.map((t) => `{Tipo} = "${t}"`).join(', ')
    conditions.push(`OR(${typeConditions})`)
  }

  if (filters.startDateFrom) {
    conditions.push(`IS_AFTER({Fecha Inicio}, "${filters.startDateFrom}")`)
  }

  if (filters.startDateTo) {
    conditions.push(`IS_BEFORE({Fecha Inicio}, "${filters.startDateTo}")`)
  }

  if (filters.search) {
    conditions.push(`SEARCH("${filters.search}", {Nombre})`)
  }

  return conditions.length > 0 ? `AND(${conditions.join(', ')})` : undefined
}

function buildContentPieceFilter(filters?: ContentPieceFilters): string | undefined {
  if (!filters) return undefined

  const conditions: string[] = []

  if (filters.status && filters.status.length > 0) {
    const statusConditions = filters.status.map((s) => `{Estado} = "${s}"`).join(', ')
    conditions.push(`OR(${statusConditions})`)
  }

  if (filters.type && filters.type.length > 0) {
    const typeConditions = filters.type.map((t) => `{Tipo} = "${t}"`).join(', ')
    conditions.push(`OR(${typeConditions})`)
  }

  if (filters.campaignId) {
    conditions.push(`FIND("${filters.campaignId}", {Campaña})`)
  }

  if (filters.channelId) {
    conditions.push(`FIND("${filters.channelId}", {Canal})`)
  }

  if (filters.search) {
    conditions.push(`SEARCH("${filters.search}", {Título})`)
  }

  return conditions.length > 0 ? `AND(${conditions.join(', ')})` : undefined
}

function buildEventFilter(filters?: EventFilters): string | undefined {
  if (!filters) return undefined

  const conditions: string[] = []

  if (filters.status && filters.status.length > 0) {
    const statusConditions = filters.status.map((s) => `{Estado} = "${s}"`).join(', ')
    conditions.push(`OR(${statusConditions})`)
  }

  if (filters.type && filters.type.length > 0) {
    const typeConditions = filters.type.map((t) => `{Tipo} = "${t}"`).join(', ')
    conditions.push(`OR(${typeConditions})`)
  }

  if (filters.startDateFrom) {
    conditions.push(`IS_AFTER({Fecha Inicio}, "${filters.startDateFrom}")`)
  }

  if (filters.startDateTo) {
    conditions.push(`IS_BEFORE({Fecha Inicio}, "${filters.startDateTo}")`)
  }

  if (filters.search) {
    conditions.push(`SEARCH("${filters.search}", {Nombre})`)
  }

  return conditions.length > 0 ? `AND(${conditions.join(', ')})` : undefined
}

