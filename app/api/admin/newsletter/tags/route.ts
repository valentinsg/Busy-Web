import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../../_utils"

export async function GET(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").toLowerCase()
  const status = searchParams.get("status") || undefined

  // Fetch all tags arrays and flatten counts client-side (simple, portable)
  let query = svc.from("newsletter_subscribers").select("tags,status")
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

  const counts = new Map<string, number>()
  for (const row of data || []) {
    const tags: string[] = (row as any).tags || []
    if (status && (row as any).status !== status) continue
    for (const t of tags) {
      const tag = String(t)
      if (q && !tag.toLowerCase().includes(q)) continue
      counts.set(tag, (counts.get(tag) || 0) + 1)
    }
  }
  const items = Array.from(counts.entries()).map(([tag, count]) => ({ tag, count }))
  items.sort((a, b) => b.count - a.count)
  return NextResponse.json({ ok: true, items })
}
