import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../../_utils"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").toLowerCase()
  const page = Math.max(1, Number(searchParams.get("page") || 1))
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 20)))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  let query = svc.from("newsletter_campaigns").select("*", { count: "exact" }).order("created_at", { ascending: false })
  if (q) query = query.ilike("name", `%${q}%`)
  const { data, error, count } = await query.range(from, to)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, items: data || [], total: count ?? 0, page, pageSize })
}

const createSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  target_status: z.array(z.string()).default(["subscribed"]),
  target_tags: z.array(z.string()).default([]),
  scheduled_at: z.string().datetime().optional(),
})

export async function POST(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const body = await req.json()
    const data = createSchema.parse(body)
    const { error, data: inserted } = await svc
      .from("newsletter_campaigns")
      .insert({ ...data })
      .select("*")
      .single()
    if (error) throw error
    return NextResponse.json({ ok: true, item: inserted })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 400 })
  }
}
