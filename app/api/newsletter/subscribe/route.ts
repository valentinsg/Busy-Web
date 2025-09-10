import { NextRequest, NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"
import { z } from "zod"

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)
    const svc = getServiceClient()
    // Determine base URL (env or request origin) for potential future use
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${req.nextUrl.protocol}//${req.headers.get("host")}`

    // Check if subscriber exists
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
      // If pending or unsubscribed, set to subscribed
      const { error: updErr } = await svc
        .from("newsletter_subscribers")
        .update({ status: "subscribed", token: null })
        .eq("email", email)
      if (updErr) throw updErr
      return NextResponse.json({ ok: true, upgraded: true })
    }

    // Create new subscriber as subscribed by default
    const { error } = await svc.from("newsletter_subscribers").insert({
      email,
      status: "subscribed",
      token: null,
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 400 })
  }
}
