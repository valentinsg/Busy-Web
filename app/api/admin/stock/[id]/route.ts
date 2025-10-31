import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { assertAdmin } from "../../_utils"

const bodySchema = z.object({
  stockBySize: z.record(z.number().int().nonnegative()),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const body = await req.json()
    const { stockBySize } = bodySchema.parse(body)
    
    // First, delete all existing sizes for this product
    const { error: deleteError } = await svc
      .from("product_sizes")
      .delete()
      .eq("product_id", params.id)
    
    if (deleteError) throw deleteError
    
    // Then insert the new sizes (only if there are any)
    if (Object.keys(stockBySize).length > 0) {
      const rows = Object.entries(stockBySize).map(([size, stock]) => ({
        product_id: params.id,
        size,
        stock,
      }))
      const { error: insertError } = await svc.from("product_sizes").insert(rows)
      if (insertError) throw insertError
    }
    
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 400 })
  }
}
