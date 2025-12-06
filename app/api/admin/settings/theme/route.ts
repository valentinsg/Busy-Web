import getServiceClient from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const christmas_mode = Boolean(body?.christmas_mode ?? false)

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
        .update({ christmas_mode })
        .eq("id", existing.id)
      if (updateError) throw updateError
    } else {
      const { error: insertError } = await sb
        .from("shop_settings")
        .insert({ christmas_mode })
      if (insertError) throw insertError
    }

    return NextResponse.json({ ok: true, christmas_mode })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    )
  }
}
