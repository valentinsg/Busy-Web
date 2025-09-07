import { NextRequest, NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"
import { z } from "zod"

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)
    const svc = getServiceClient()
    const { error } = await svc.from("newsletter_subscribers").upsert({ email })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 400 })
  }
}
