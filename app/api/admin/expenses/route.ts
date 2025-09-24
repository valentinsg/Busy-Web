import { NextResponse } from "next/server"
import { createExpense, listExpenses } from "@/lib/repo/expenses"

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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}
