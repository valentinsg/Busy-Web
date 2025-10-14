import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { assertAdmin } from "../../_utils"

const updateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  images: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  measurements_by_size: z.record(z.any()).optional(),
  category: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  stock: z.number().int().nonnegative().optional(),
  description: z.string().optional(),
  benefits: z.array(z.object({ title: z.string(), subtitle: z.string().optional(), icon: z.string().optional() })).optional(),
  care_instructions: z.string().optional(),
  imported: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  rating: z.number().optional(),
  reviews: z.number().optional(),
  badge_text: z.string().nullable().optional(),
  badge_variant: z.string().optional(),
  discount_percentage: z.number().nullable().optional(),
  discount_active: z.boolean().optional(),
  stockBySize: z.record(z.number()).optional(),
}).passthrough()

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const body = await req.json()
    const patch = updateSchema.parse(body)
    const { error } = await svc.from("products").update(patch).eq("id", params.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    // Log detailed error for debugging
    console.error("PUT /api/admin/products/[id] error:", e)
    const errorMessage = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await assertAdmin(_req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const { error } = await svc.from("products").delete().eq("id", params.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 400 })
  }
}
