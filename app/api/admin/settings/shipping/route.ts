import getServiceClient from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const shipping_flat_rate = Number(body?.shipping_flat_rate)
    const shipping_free_threshold = Number(body?.shipping_free_threshold)

    if (!Number.isFinite(shipping_flat_rate) || !Number.isFinite(shipping_free_threshold)) {
      return NextResponse.json({ error: "Valores inválidos" }, { status: 400 })
    }

    const sb = getServiceClient()
    const { data: existing, error: selectError } = await sb
      .from("shop_settings")
      .select("id")
      .limit(1)
      .maybeSingle()

    if (selectError) throw selectError

    if (existing?.id) {
      const { error: updateError } = await sb
        .from("shop_settings")
        .update({ shipping_flat_rate, shipping_free_threshold })
        .eq("id", existing.id)
      if (updateError) throw updateError
    } else {
      const { error: insertError } = await sb
        .from("shop_settings")
        .insert({ shipping_flat_rate, shipping_free_threshold })
      if (insertError) throw insertError
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    )
  }
}
