import { NextRequest, NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"
import { z } from "zod"

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)
    const svc = getServiceClient()
    const { data: existing, error: fetchErr } = await svc
      .from("newsletter_subscribers")
      .select("email, status")
      .eq("email", email)
      .maybeSingle()
    if (fetchErr) throw fetchErr

    if (existing) {
      if (existing.status === "subscribed") {
        return NextResponse.json({ ok: true, already: true })
      }
      const { error: updErr } = await svc
        .from("newsletter_subscribers")
        .update({ status: "subscribed", token: null })
        .eq("email", email)
      if (updErr) throw updErr
      return NextResponse.json({ ok: true, upgraded: true })
    }
    const { error } = await svc.from("newsletter_subscribers").insert({
      email,
      status: "subscribed",
      token: null,
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 })
  }
}
