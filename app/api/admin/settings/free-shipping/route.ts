import getServiceClient from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const free_shipping_enabled = Boolean(body?.free_shipping_enabled)
    const free_shipping_message = String(body?.free_shipping_message || "Envío gratis en todas las compras")

    const sb = getServiceClient()
    const { data: existing, error: selectError } = await sb
      .from("shop_settings")
      .select("id")
      .limit(1)
      .maybeSingle()

    if (selectError) throw selectError

    const updateData = {
      free_shipping_enabled,
      free_shipping_message,
    }

    if (existing?.id) {
      const { error: updateError } = await sb
        .from("shop_settings")
        .update(updateData)
        .eq("id", existing.id)
      if (updateError) throw updateError
    } else {
      const { error: insertError } = await sb
        .from("shop_settings")
        .insert(updateData)
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
