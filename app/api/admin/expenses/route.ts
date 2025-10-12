import { NextResponse } from "next/server"
import { createExpense, listExpenses } from "@/lib/repo/expenses"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get("from") || undefined
    const to = searchParams.get("to") || undefined
    const category = searchParams.get("category") || undefined
    const supplier_id = searchParams.get("supplier_id") || undefined

    const data = await listExpenses({ from, to, category, supplier_id })
    return NextResponse.json({ ok: true, data })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body?.category || !body?.amount) {
      return NextResponse.json({ error: "category y amount son requeridos" }, { status: 400 })
    }
    
    // Validar supplier_id si se proporciona
    if (body.supplier_id && typeof body.supplier_id === "string" && body.supplier_id.trim() !== "") {
      // Validación básica de UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(body.supplier_id.trim())) {
        return NextResponse.json({ 
          error: "supplier_id debe ser un UUID válido o dejarse vacío",
          hint: "Ejemplo de UUID válido: 550e8400-e29b-41d4-a716-446655440000"
        }, { status: 400 })
      }
    }
    
    const expense = await createExpense({
      category: body.category,
      amount: Number(body.amount),
      currency: body.currency ?? undefined,
      description: body.description ?? null,
      supplier_id: body.supplier_id ?? null,
      channel: body.channel ?? null,
      incurred_at: body.incurred_at ?? undefined,
      metadata: body.metadata ?? null,
    })
    return NextResponse.json({ ok: true, expense })
  } catch (error: unknown) {
    // Log detallado del error para debugging
    console.error("Error creating expense:", error)
    const errorMessage = error instanceof Error ? error.message : "Unexpected error"
    const errorDetails = error instanceof Error && "details" in error ? (error as Error & { details?: unknown }).details : null
    const errorHint = error instanceof Error && "hint" in error ? (error as Error & { hint?: unknown }).hint : null
    
    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails,
      hint: errorHint
    }, { status: 500 })
  }
}
