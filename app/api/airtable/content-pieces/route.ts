import { assertAdmin } from "@/app/api/admin/_utils"
import { listContentPieces, updateContentPieceStatus } from "@/lib/airtable/client"
import type { ContentPieceFilters, ContentPieceStatus } from "@/types/airtable"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res

  try {
    const { searchParams } = new URL(req.url)
    const filters: ContentPieceFilters = {}

    const statusParam = searchParams.get("status")
    if (statusParam) {
      filters.status = statusParam.split(",") as ContentPieceStatus[]
    }

    const typeParam = searchParams.get("type")
    if (typeParam) {
      filters.type = typeParam.split(",") as any[]
    }

    const campaignId = searchParams.get("campaignId")
    if (campaignId) {
      filters.campaignId = campaignId
    }

    const channelId = searchParams.get("channelId")
    if (channelId) {
      filters.channelId = channelId
    }

    const search = searchParams.get("search")
    if (search) {
      filters.search = search
    }

    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 100)))

    const contentPieces = await listContentPieces(filters, pageSize)

    return NextResponse.json({
      ok: true,
      items: contentPieces,
      total: contentPieces.length,
    })
  } catch (error) {
    console.error("Error fetching content pieces:", error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to fetch content pieces" },
      { status: 500 }
    )
  }
}

const updateStatusSchema = z.object({
  status: z.enum(["Idea", "En Producción", "Programado", "Publicado", "Archivado"]),
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

    const contentPiece = await updateContentPieceStatus(id, status)

    return NextResponse.json({ ok: true, item: contentPiece })
  } catch (error) {
    console.error("Error updating content piece:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update content piece" },
      { status: 500 }
    )
  }
}

