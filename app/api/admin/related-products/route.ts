import { NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"

// List related products for a product_id
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const product_id = searchParams.get("product_id")
    if (!product_id) return NextResponse.json({ error: "product_id requerido" }, { status: 400 })
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("related_products")
      .select("id, related_product_id, relation_type, weight, created_at")
      .eq("product_id", product_id)
      .order("weight", { ascending: false })
    if (error) throw error
    return NextResponse.json({ ok: true, data: data ?? [] })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}

// Create a related product relation
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { product_id, related_product_id, relation_type = "manual", weight = 1 } = body || {}
    if (!product_id || !related_product_id) return NextResponse.json({ error: "product_id y related_product_id son requeridos" }, { status: 400 })
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("related_products")
      .insert({ product_id, related_product_id, relation_type, weight })
      .select("*")
      .single()
    if (error) throw error
    return NextResponse.json({ ok: true, relation: data })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}

// Delete a relation by id
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })
    const supabase = getServiceClient()
    const { error } = await supabase.from("related_products").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}
