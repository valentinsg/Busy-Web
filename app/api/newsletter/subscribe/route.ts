import { NextRequest, NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"
import { z } from "zod"

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)
    const svc = getServiceClient()
    // Generate token for opt-in
    const token = crypto.randomUUID()
    // Determine base URL (env or request origin)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${req.nextUrl.protocol}//${req.headers.get("host")}`
    const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
    const { error } = await svc.from("newsletter_subscribers").upsert({
      email,
      status: "pending",
      token,
    })
    if (error) throw error
    // TODO: send email with confirmUrl via provider (Resend, Sendgrid, etc.)
    return NextResponse.json({ ok: true, confirmUrl })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 400 })
  }
}
