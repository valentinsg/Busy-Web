import getServiceClient from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const province_rates = body?.province_rates || {}

    // Validate province_rates structure
    if (typeof province_rates !== "object") {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 })
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
        .update({ province_rates })
        .eq("id", existing.id)
      if (updateError) throw updateError
    } else {
      const { error: insertError } = await sb
        .from("shop_settings")
        .insert({ province_rates })
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
