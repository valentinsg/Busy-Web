import { createFAQ, getAllFAQs } from "@/lib/repo/faqs"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// GET /api/admin/faqs - Get all FAQs (including inactive)
export async function GET() {
  try {
    const faqs = await getAllFAQs()
    return NextResponse.json(faqs)
  } catch (error) {
    console.error("[API] Error fetching FAQs:", error)
    return NextResponse.json(
      { error: "Error al obtener las FAQs" },
      { status: 500 }
    )
  }
}

// POST /api/admin/faqs - Create new FAQ
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.question || !body.answer) {
      return NextResponse.json(
        { error: "Pregunta y respuesta son requeridas" },
        { status: 400 }
      )
    }

    const faq = await createFAQ({
      question: body.question,
      answer: body.answer,
      category: body.category,
      sort_order: body.sort_order,
      is_active: body.is_active,
    })

    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating FAQ:", error)
    return NextResponse.json(
      { error: "Error al crear la FAQ" },
      { status: 500 }
    )
  }
}
