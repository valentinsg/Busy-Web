import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../_utils"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").toLowerCase()
  const status = searchParams.get("status") || undefined
  const tag = searchParams.get("tag") || undefined
  const page = Math.max(1, Number(searchParams.get("page") || 1))
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 20)))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = svc
    .from("newsletter_subscribers")
    .select("email,created_at,status,tags", { count: "exact" })
    .order("created_at", { ascending: false })

  if (status) query = query.eq("status", status)
  if (tag) query = query.contains("tags", [tag])
  if (q) query = query.ilike("email", `%${q}%`)

  const { data, error, count } = await query.range(from, to)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, items: data || [], total: count ?? 0, page, pageSize })
}

export async function DELETE(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")
    if (!email) return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 })
    const { error } = await svc.from("newsletter_subscribers").delete().eq("email", email)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 400 })
  }
}

const patchSchema = z.object({
  email: z.string().email(),
  status: z.enum(["pending", "subscribed", "unsubscribed"]).optional(),
  tags: z.array(z.string()).optional(),
})

export async function PATCH(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const body = await req.json()
    const { email, status, tags } = patchSchema.parse(body)
    const patch: Record<string, unknown> = {}
    if (status) patch.status = status
    if (tags) patch.tags = tags
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, error: "No fields to update" }, { status: 400 })
    }
    const { error } = await svc.from("newsletter_subscribers").update(patch).eq("email", email)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 400 })
  }
}
