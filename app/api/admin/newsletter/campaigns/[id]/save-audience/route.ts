import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../../../../_utils"
import { z } from "zod"

const schema = z.object({
  emails: z.array(z.string().email()).optional(),
  status: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const body = await req.json()
    const { emails = [], status = [], tags = [] } = schema.parse(body)

    // Build allowed set by filters (status/tags) and subscribed only
    let q = svc.from("newsletter_subscribers").select("email,status,tags")
    if (status && status.length) q = q.in("status", status)
    if (tags && tags.length) q = q.contains("tags", tags)
    const { data: filtered, error } = await q
    if (error) throw error
    const allowedByFilters = new Set<string>((filtered||[])
      .filter((r: Record<string, unknown>) => r.status === 'subscribed')
      .map((r: Record<string, unknown>) => String(r.email).toLowerCase()))

    // If a list of emails is provided, validate against DB
    let allowed: string[]
    if (emails && emails.length) {
      const norm = Array.from(new Set(emails.map(e=>e.trim().toLowerCase()).filter(Boolean)))
      const { data: rows, error: e2 } = await svc
        .from("newsletter_subscribers")
        .select("email,status")
        .in("email", norm)
      if (e2) throw e2
      const map = new Map((rows||[]).map((r: Record<string, unknown>) => [String(r.email).toLowerCase(), r.status]))
      allowed = norm.filter(em => map.get(em)==='subscribed' && (allowedByFilters.size===0 || allowedByFilters.has(em)))
    } else {
      allowed = Array.from(allowedByFilters)
    }

    // Persist recipients snapshot (upsert ready)
    if (allowed.length) {
      const rows = allowed.map(email => ({ campaign_id: params.id, email, status: 'ready' as const }))
      const { error: upErr } = await svc.from("newsletter_campaign_recipients").upsert(rows)
      if (upErr) throw upErr
    }

    return NextResponse.json({ ok: true, saved: allowed.length })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 400 })
  }
}
