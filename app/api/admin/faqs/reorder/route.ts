import { reorderFAQs } from "@/lib/repo/faqs"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// POST /api/admin/faqs/reorder - Reorder FAQs
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!Array.isArray(body.ids)) {
      return NextResponse.json(
        { error: "Se requiere un array de IDs" },
        { status: 400 }
      )
    }

    await reorderFAQs(body.ids)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[API] Error reordering FAQs:", error)
    return NextResponse.json(
      { error: "Error al reordenar las FAQs" },
      { status: 500 }
    )
  }
}
