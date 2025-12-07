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
  is_active: z.boolean().optional(),
}).passthrough()

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  const { id } = await params
  try {
    const body = await req.json()
    const patch = updateSchema.parse(body)
    const { error } = await svc.from("products").update(patch).eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    // Log detailed error for debugging
    console.error("PUT /api/admin/products/[id] error:", e)
    const errorMessage = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await assertAdmin(_req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  const { id } = await params
  try {
    // Try to delete first
    const { error } = await svc.from("products").delete().eq("id", id)

    if (error) {
      // If foreign key constraint, offer soft delete instead
      if (error.code === "23503") {
        // Soft delete: set stock to 0 and mark as unavailable
        const { error: updateError } = await svc
          .from("products")
          .update({ stock: 0, is_active: false })
          .eq("id", id)

        if (updateError) {
          // If is_active column doesn't exist, just set stock to 0
          const { error: stockError } = await svc
            .from("products")
            .update({ stock: 0 })
            .eq("id", id)

          if (stockError) throw stockError
        }

        return NextResponse.json({
          ok: true,
          soft_deleted: true,
          message: "Producto desactivado (tiene órdenes asociadas)"
        })
      }
      throw new Error(error.message || "Error al eliminar")
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e)
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
