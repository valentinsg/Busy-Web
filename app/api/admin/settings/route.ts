import getServiceClient from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const sb = getServiceClient()
    // Select all columns - new columns may not exist yet if migration hasn't run
    const { data, error } = await sb
      .from("shop_settings")
      .select("*")
      .limit(1)
      .maybeSingle()
    if (error) throw error

    // Build payload with safe defaults for all fields
    const payload = {
      shipping_flat_rate: Number(data?.shipping_flat_rate ?? 25000),
      shipping_free_threshold: Number(data?.shipping_free_threshold ?? 100000),
      christmas_mode: Boolean(data?.christmas_mode ?? false),
      free_shipping_enabled: Boolean(data?.free_shipping_enabled ?? false),
      free_shipping_message: String(data?.free_shipping_message || "Envío gratis en todas las compras"),
      mar_del_plata_rate: Number(data?.mar_del_plata_rate ?? 10000),
      province_rates: data?.province_rates || {},
    }
    return NextResponse.json(payload)
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const shipping_flat_rate = Number(body?.shipping_flat_rate)
    const shipping_free_threshold = Number(body?.shipping_free_threshold)
    const christmas_mode = Boolean(body?.christmas_mode ?? false)
    if (!Number.isFinite(shipping_flat_rate) || !Number.isFinite(shipping_free_threshold)) {
      return NextResponse.json({ error: "Valores inválidos" }, { status: 400 })
    }
    const sb = getServiceClient()
    // Update existing row if present; otherwise insert a new one (do not provide explicit id for identity column)
    const { data: existing, error: selectError } = await sb
      .from("shop_settings")
      .select("id")
      .limit(1)
      .maybeSingle()
    if (selectError) throw selectError
    if (existing?.id) {
      const { error: updateError } = await sb
        .from("shop_settings")
        .update({ shipping_flat_rate, shipping_free_threshold, christmas_mode })
        .eq("id", existing.id)
      if (updateError) throw updateError
    } else {
      const { error: insertError } = await sb
        .from("shop_settings")
        .insert({ shipping_flat_rate, shipping_free_threshold, christmas_mode })
      if (insertError) throw insertError
    }
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}
