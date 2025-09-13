import { NextResponse } from "next/server"
import { createSupplier, deleteSupplier, listSuppliers, updateSupplier } from "@/lib/repo/suppliers"

export async function GET() {
  try {
    const data = await listSuppliers()
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body?.name) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })
    }
    const supplier = await createSupplier({
      name: body.name,
      contact_name: body.contact_name ?? null,
      contact_email: body.contact_email ?? null,
      contact_phone: body.contact_phone ?? null,
      notes: body.notes ?? null,
      category: body.category ?? null,
      product_tags: Array.isArray(body.product_tags)
        ? body.product_tags
        : (typeof body.product_tags === 'string' ? String(body.product_tags).split(',').map((s) => s.trim()).filter(Boolean) : undefined),
      reference_price: body.reference_price ?? null,
      minimum_order_quantity: body.minimum_order_quantity ?? null,
      delivery_time_days: body.delivery_time_days ?? null,
      payment_terms: body.payment_terms ?? null,
      tags: Array.isArray(body.tags)
        ? body.tags
        : (typeof body.tags === 'string' ? String(body.tags).split(',').map((s) => s.trim()).filter(Boolean) : undefined),
      status: body.status ?? undefined,
      reliability_rating: body.reliability_rating ?? null,
    })
    return NextResponse.json({ ok: true, supplier })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const id = body?.id
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })
    const supplier = await updateSupplier(id, {
      name: body?.name,
      contact_name: body?.contact_name ?? undefined,
      contact_email: body?.contact_email ?? undefined,
      contact_phone: body?.contact_phone ?? undefined,
      notes: body?.notes ?? undefined,
      category: body?.category ?? undefined,
      product_tags: Array.isArray(body?.product_tags)
        ? body.product_tags
        : (typeof body?.product_tags === 'string' ? String(body.product_tags).split(',').map((s) => s.trim()).filter(Boolean) : undefined),
      reference_price: body?.reference_price ?? undefined,
      minimum_order_quantity: body?.minimum_order_quantity ?? undefined,
      delivery_time_days: body?.delivery_time_days ?? undefined,
      payment_terms: body?.payment_terms ?? undefined,
      tags: Array.isArray(body?.tags)
        ? body.tags
        : (typeof body?.tags === 'string' ? String(body.tags).split(',').map((s) => s.trim()).filter(Boolean) : undefined),
      status: body?.status ?? undefined,
      reliability_rating: body?.reliability_rating ?? undefined,
    })
    return NextResponse.json({ ok: true, supplier })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })
    await deleteSupplier(id)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}
