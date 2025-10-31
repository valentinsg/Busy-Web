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
    // Normalize error to a readable string instead of "[object Object]"
    let message = "Error al procesar la suscripción"
    if (e instanceof z.ZodError) {
      message = e.issues?.[0]?.message || "Email inválido"
    } else if (e && typeof e === "object") {
      // Supabase/Postgrest errors usually have a 'message' property
      const maybeMsg = (e as any).message || (e as any).error || (e as any).hint
      if (typeof maybeMsg === "string") message = maybeMsg
    } else if (typeof e === "string") {
      message = e
    }
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
