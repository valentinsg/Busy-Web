import { assertAdmin } from "@/app/api/admin/_utils"
import { getCampaign, listCampaigns, updateCampaignStatus } from "@/lib/airtable/client"
import type { CampaignFilters, CampaignStatus } from "@/types/airtable"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    // Si hay ID, devolver campaña específica
    if (id) {
      const campaign = await getCampaign(id)
      if (!campaign) {
        return NextResponse.json({ ok: false, error: "Campaign not found" }, { status: 404 })
      }
      return NextResponse.json({ ok: true, item: campaign })
    }

    // Listar campañas con filtros
    const filters: CampaignFilters = {}

    const statusParam = searchParams.get("status")
    if (statusParam) {
      filters.status = statusParam.split(",") as CampaignStatus[]
    }

    const typeParam = searchParams.get("type")
    if (typeParam) {
      filters.type = typeParam.split(",") as any[]
    }

    const startDateFrom = searchParams.get("startDateFrom")
    if (startDateFrom) {
      filters.startDateFrom = startDateFrom
    }

    const startDateTo = searchParams.get("startDateTo")
    if (startDateTo) {
      filters.startDateTo = startDateTo
    }

    const search = searchParams.get("search")
    if (search) {
      filters.search = search
    }

    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 100)))

    const campaigns = await listCampaigns(filters, pageSize)

    return NextResponse.json({
      ok: true,
      items: campaigns,
      total: campaigns.length,
    })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to fetch campaigns" },
      { status: 500 }
    )
  }
}

const updateStatusSchema = z.object({
  status: z.enum(["Idea", "Planificando", "Activa", "Pausada", "Finalizada", "Cancelada"]),
})

export async function PATCH(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing id parameter" }, { status: 400 })
    }

    const body = await req.json()
    const { status } = updateStatusSchema.parse(body)

    const campaign = await updateCampaignStatus(id, status)

    return NextResponse.json({ ok: true, item: campaign })
  } catch (error) {
    console.error("Error updating campaign:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update campaign" },
      { status: 500 }
    )
  }
}

