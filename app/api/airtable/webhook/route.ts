/**
 * Webhook endpoint para recibir eventos de Airtable
 *
 * Configurar en Airtable: Settings → Webhooks → Create webhook
 * URL: https://tu-dominio.com/api/airtable/webhook?token=SECRET_TOKEN
 *
 * Eventos que se pueden recibir:
 * - Cambio de estado de Campaña → Crear/actualizar promoción en Supabase
 * - Cambio de estado de Pieza de Contenido → Notificación
 * - Cambio de estado de Evento → Notificación
 */

import { getCampaign } from "@/lib/airtable/client"
import { getServiceClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const WEBHOOK_SECRET = process.env.AIRTABLE_WEBHOOK_SECRET_TOKEN

export async function POST(req: NextRequest) {
  // Validar token
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!WEBHOOK_SECRET || token !== WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = await req.json()

    // Airtable envía eventos en formato:
    // {
    //   "base": { "id": "app_xxx" },
    //   "webhook": { "id": "ach_xxx" },
    //   "event": {
    //     "id": "evt_xxx",
    //     "timestamp": "2024-01-01T00:00:00.000Z",
    //     "eventType": "tableChanged",
    //     "payload": {
    //       "changedTablesById": { "tbl_xxx": { "changedRecordsById": { ... } } }
    //     }
    //   }
    // }

    const eventType = payload?.event?.eventType
    const baseId = payload?.base?.id

    if (eventType === "tableChanged") {
      const changedTables = payload?.event?.payload?.changedTablesById || {}

      // Procesar cambios en cada tabla
      for (const [tableId, changes] of Object.entries(changedTables)) {
        const changedRecords = (changes as any)?.changedRecordsById || {}

        // Si es la tabla de Campañas y el base es Marketing
        if (baseId === process.env.AIRTABLE_BASE_MARKETING) {
          await processCampaignChanges(changedRecords)
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to process webhook" },
      { status: 500 }
    )
  }
}

async function processCampaignChanges(changedRecords: Record<string, any>) {
  const supabase = getServiceClient()

  for (const [recordId, change] of Object.entries(changedRecords)) {
    const current = change?.current
    const previous = change?.previous

    // Si cambió el estado de una campaña
    if (current?.fields?.["Estado"] && previous?.fields?.["Estado"]) {
      const newStatus = current.fields["Estado"]
      const oldStatus = previous.fields["Estado"]

      // Si la campaña se activó, crear/actualizar promoción en Supabase
      if (newStatus === "Activa" && oldStatus !== "Activa") {
        try {
          const campaign = await getCampaign(recordId)

          if (campaign && campaign.type === "Promoción") {
            // Crear o actualizar promoción en Supabase
            // Buscar promoción existente por nombre o crear nueva
            const { data: existingPromo } = await supabase
              .from("promotions")
              .select("id")
              .ilike("name", `%${campaign.name}%`)
              .single()

            const promoData = {
              name: campaign.name,
              description: campaign.objective || null,
              active: true,
              promo_type: "percentage_off", // o inferir del nombre/config
              config: {
                percent: 10, // o calcular desde campaign
              },
              eligible_skus: campaign.relatedProductIds || [],
              sku_match_type: "exact",
              starts_at: campaign.startDate || new Date().toISOString(),
              ends_at: campaign.endDate || null,
              priority: 0,
            }

            if (existingPromo) {
              await supabase
                .from("promotions")
                .update(promoData)
                .eq("id", existingPromo.id)
            } else {
              await supabase.from("promotions").insert(promoData)
            }

            console.log(`Promoción creada/actualizada para campaña: ${campaign.name}`)
          }

          // Si es campaña de tipo "Email" o "Social Media", crear popover si aplica
          if (campaign.type === "Email" || campaign.type === "Social Media") {
            // Lógica para crear popover si la campaña tiene código de descuento
            // ...
          }
        } catch (error) {
          console.error(`Error procesando campaña ${recordId}:`, error)
        }
      }

      // Si la campaña se pausó o finalizó, desactivar promoción
      if ((newStatus === "Pausada" || newStatus === "Finalizada") && oldStatus === "Activa") {
        try {
          const campaign = await getCampaign(recordId)

          if (campaign) {
            await supabase
              .from("promotions")
              .update({ active: false })
              .ilike("name", `%${campaign.name}%`)

            console.log(`Promoción desactivada para campaña: ${campaign.name}`)
          }
        } catch (error) {
          console.error(`Error desactivando promoción para campaña ${recordId}:`, error)
        }
      }
    }
  }
}

