import { NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const product_id = searchParams.get("product_id")
    if (!product_id) return NextResponse.json({ error: "product_id requerido" }, { status: 400 })

    const supabase = getServiceClient()
    const [{ data: sizes }, { data: product }] = await Promise.all([
      supabase.from("product_sizes").select("size,stock").eq("product_id", product_id).order("size"),
      supabase.from("products").select("stock").eq("id", product_id).maybeSingle(),
    ])

    return NextResponse.json({ ok: true, sizes: sizes ?? [], total: product?.stock ?? null })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}
