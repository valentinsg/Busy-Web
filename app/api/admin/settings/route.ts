import { NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"

export async function GET() {
  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .from("shop_settings")
      .select("shipping_flat_rate, shipping_free_threshold")
      .limit(1)
      .maybeSingle()
    if (error) throw error
    const payload = {
      shipping_flat_rate: Number(data?.shipping_flat_rate ?? 20000),
      shipping_free_threshold: Number(data?.shipping_free_threshold ?? 80000),
    }
    return NextResponse.json(payload)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const shipping_flat_rate = Number(body?.shipping_flat_rate)
    const shipping_free_threshold = Number(body?.shipping_free_threshold)
    if (!Number.isFinite(shipping_flat_rate) || !Number.isFinite(shipping_free_threshold)) {
      return NextResponse.json({ error: "Valores inválidos" }, { status: 400 })
    }
    const sb = getServiceClient()
    const { error } = await sb
      .from("shop_settings")
      .upsert({ id: 1, shipping_flat_rate, shipping_free_threshold }, { onConflict: "id" })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}
