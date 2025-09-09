import { NextResponse } from "next/server"
import { createManualOrder, type CreateManualOrderInput } from "@/lib/repo/orders"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CreateManualOrderInput>

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Se requieren items" }, { status: 400 })
    }
    if (!body.channel) {
      return NextResponse.json({ error: "Canal de venta requerido" }, { status: 400 })
    }

    const result = await createManualOrder({
      customer_id: body.customer_id ?? null,
      customer_name: body.customer_name ?? null,
      customer_email: body.customer_email ?? null,
      channel: body.channel,
      items: body.items.map((it) => ({
        product_id: String(it.product_id),
        product_name: it.product_name,
        variant_color: it.variant_color ?? null,
        variant_size: it.variant_size ?? null,
        quantity: Number(it.quantity || 0),
        unit_price: Number(it.unit_price || 0),
      })),
      notes: body.notes ?? null,
      currency: body.currency ?? undefined,
      discount: body.discount ?? 0,
      shipping: body.shipping ?? 0,
      tax: body.tax ?? 0,
      placed_at: body.placed_at ?? undefined,
      is_barter: Boolean(body.is_barter) || false,
    })

    return NextResponse.json({ ok: true, order: result.order, items: result.items })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}
