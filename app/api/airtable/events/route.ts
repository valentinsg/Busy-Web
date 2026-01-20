import { assertAdmin } from "@/app/api/admin/_utils"
import { getEvent, listEvents } from "@/lib/airtable/client"
import type { EventFilters } from "@/types/airtable"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    // Si hay ID, devolver evento específico
    if (id) {
      const event = await getEvent(id)
      if (!event) {
        return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 })
      }
      return NextResponse.json({ ok: true, item: event })
    }

    // Listar eventos con filtros
    const filters: EventFilters = {}

    const statusParam = searchParams.get("status")
    if (statusParam) {
      filters.status = statusParam.split(",") as any[]
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

    const events = await listEvents(filters, pageSize)

    return NextResponse.json({
      ok: true,
      items: events,
      total: events.length,
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to fetch events" },
      { status: 500 }
    )
  }
}

