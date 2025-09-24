import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { assertAdmin } from "../_utils"

const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  currency: z.string().default("USD"),
  images: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  measurements_by_size: z.record(z.any()).optional(),
  category: z.string().min(1),
  sku: z.string().min(1),
  stock: z.number().int().nonnegative().default(0),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  rating: z.number().optional(),
  reviews: z.number().optional(),
  stockBySize: z.record(z.number()).optional(),
})

export async function POST(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const body = await req.json()
    const data = productSchema.parse(body)

    // Insert product
    const { stockBySize, ...product } = data
    const { error: insErr } = await svc.from("products").insert({
      ...product,
      measurements_by_size: data.measurements_by_size ?? null,
      description: data.description ?? null,
    })
    if (insErr) throw insErr

    // Upsert per-size stock if provided
    if (stockBySize && Object.keys(stockBySize).length) {
      const rows = Object.entries(stockBySize).map(([size, stock]) => ({
        product_id: data.id,
        size,
        stock,
      }))
      const { error: sizeErr } = await svc.from("product_sizes").upsert(rows)
      if (sizeErr) throw sizeErr
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 400 })
  }
}
