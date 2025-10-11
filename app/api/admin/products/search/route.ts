import { NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get("q") || "").trim()
    const limit = Number(searchParams.get("limit") || 10)

    const supabase = getServiceClient()
    let query = supabase.from("products").select("id,name,price,currency,colors,sizes,stock,category").order("created_at", { ascending: false }).limit(limit)
    if (q) {
      const like = `%${q}%`
      // Buscar por id, nombre, sku O categoría
      query = query.or(`id.ilike.${like},name.ilike.${like},sku.ilike.${like},category.ilike.${like}`)
    }
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ ok: true, products: data ?? [] })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}
