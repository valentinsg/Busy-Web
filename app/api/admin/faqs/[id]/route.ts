import { deleteFAQ, getFAQById, toggleFAQActive, updateFAQ } from "@/lib/repo/faqs"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/admin/faqs/[id] - Get single FAQ
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const faq = await getFAQById(id)

    if (!faq) {
      return NextResponse.json(
        { error: "FAQ no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(faq)
  } catch (error) {
    console.error("[API] Error fetching FAQ:", error)
    return NextResponse.json(
      { error: "Error al obtener la FAQ" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/faqs/[id] - Update FAQ
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const faq = await updateFAQ(id, {
      question: body.question,
      answer: body.answer,
      category: body.category,
      sort_order: body.sort_order,
      is_active: body.is_active,
    })

    return NextResponse.json(faq)
  } catch (error) {
    console.error("[API] Error updating FAQ:", error)
    return NextResponse.json(
      { error: "Error al actualizar la FAQ" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/faqs/[id] - Toggle active status
export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const faq = await toggleFAQActive(id)
    return NextResponse.json(faq)
  } catch (error) {
    console.error("[API] Error toggling FAQ:", error)
    return NextResponse.json(
      { error: "Error al cambiar estado de la FAQ" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/faqs/[id] - Delete FAQ
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    await deleteFAQ(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[API] Error deleting FAQ:", error)
    return NextResponse.json(
      { error: "Error al eliminar la FAQ" },
      { status: 500 }
    )
  }
}
