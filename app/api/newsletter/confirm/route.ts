import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServiceClient } from "@/lib/supabase/server"

const schema = z.object({ token: z.string().min(1), email: z.string().email() })

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token") || ""
    const email = searchParams.get("email") || ""
    const parsed = schema.parse({ token, email })

    const svc = getServiceClient()
    const { data, error } = await svc
      .from("newsletter_subscribers")
      .select("email, token, status")
      .eq("email", parsed.email)
      .maybeSingle()
    if (error) throw error
    if (!data || data.token !== parsed.token) {
      return NextResponse.json({ ok: false, error: "Token inválido" }, { status: 400 })
    }

    const { error: upErr } = await svc
      .from("newsletter_subscribers")
      .update({ status: "subscribed", token: null })
      .eq("email", parsed.email)
    if (upErr) throw upErr

    // For now, just return JSON. You could redirect to a thank-you page.
    return NextResponse.json({ ok: true, message: "Suscripción confirmada" })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 })
  }
}
