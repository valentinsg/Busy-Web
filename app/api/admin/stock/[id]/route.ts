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
    const rows = Object.entries(stockBySize).map(([size, stock]) => ({
      product_id: params.id,
      size,
      stock,
    }))
    const { error } = await svc.from("product_sizes").upsert(rows)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 400 })
  }
}
