import { NextResponse } from "next/server"
import { createSupplierPurchase, listSupplierPurchases } from "@/lib/repo/suppliers"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const supplier_id = searchParams.get("supplier_id")
    if (!supplier_id) return NextResponse.json({ error: "supplier_id requerido" }, { status: 400 })
    const data = await listSupplierPurchases(supplier_id)
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supplier_id = body?.supplier_id
    const items = body?.items
    if (!supplier_id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "supplier_id e items son requeridos" }, { status: 400 })
    }
    const result = await createSupplierPurchase({
      supplier_id,
      items: items.map((it: any) => ({ product_id: String(it.product_id), quantity: Number(it.quantity || 0), unit_cost: Number(it.unit_cost || 0) })),
      currency: body?.currency,
      shipping: body?.shipping,
      tax: body?.tax,
      notes: body?.notes,
      placed_at: body?.placed_at,
    })
    return NextResponse.json({ ok: true, purchase: result.purchase, items: result.items })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}
