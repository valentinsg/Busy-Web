import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../../_utils"
import { z } from "zod"

const schema = z.object({
  emails: z.array(z.string().email()).optional(),
  status: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const body = await req.json()
    const { emails = [], status = [], tags = [] } = schema.parse(body)

    const normalized = Array.from(new Set(emails.map((e:string)=>e.trim().toLowerCase()).filter(Boolean)))
    const invalid: string[] = emails.filter((e:string)=>!/^\S+@\S+\.\S+$/.test(e))

    // Base query by filters (status/tags)
    let query = svc.from("newsletter_subscribers").select("email,status,tags")
    if (status && status.length) query = query.in("status", status)
    if (tags && tags.length) query = query.contains("tags", tags)
    const { data: filtered, error } = await query
    if (error) throw error

    // Universe allowed by filters (if filters provided)
    const allowedSet = new Set<string>((filtered||[]).filter(r=>r.status === 'subscribed').map(r=>String(r.email).toLowerCase()))

    const allowed: string[] = []
    const notSubscribed: string[] = []

    if (normalized.length) {
      // Validate uploaded/emails list against DB with status=subscribed
      const { data: dbEmails, error: e2 } = await svc
        .from("newsletter_subscribers")
        .select("email,status")
        .in("email", normalized)
      if (e2) throw e2
      const map = new Map(dbEmails?.map(r=>[String(r.email).toLowerCase(), r.status])||[])
      for (const em of normalized) {
        const st = map.get(em)
        if (st === 'subscribed') {
          if (allowedSet.size === 0 || allowedSet.has(em)) allowed.push(em)
          else notSubscribed.push(em)
        } else {
          notSubscribed.push(em)
        }
      }
    } else {
      // No explicit emails: use the allowedSet purely
      allowed.push(...Array.from(allowedSet))
    }

    return NextResponse.json({ ok: true, result: { allowed, not_subscribed: notSubscribed, invalid } })
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 400 })
  }
}
