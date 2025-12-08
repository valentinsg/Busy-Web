import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { assertAdmin } from "../../../_utils"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  const { data, error } = await svc.from("newsletter_campaigns").select("*").eq("id", params.id).maybeSingle()
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true, item: data })
}

const patchSchema = z.object({
  name: z.string().optional(),
  subject: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(["draft", "scheduled", "sending", "sent", "failed"]).optional(),
  target_status: z.array(z.string()).optional(),
  target_tags: z.array(z.string()).optional(),
  scheduled_at: z.string().optional().transform(val => {
    if (!val) return undefined
    if (val.includes('Z') || val.includes('+')) return val
    return val.includes(':') && val.split(':').length === 2
      ? `${val}:00Z`
      : `${val}Z`
  }),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const body = await req.json()
    const data = patchSchema.parse(body)
    const patch: Record<string, unknown> = { ...data }
    const { error, data: updated } = await svc
      .from("newsletter_campaigns")
      .update(patch)
      .eq("id", params.id)
      .select("*")
      .maybeSingle()
    if (error) throw error
    return NextResponse.json({ ok: true, item: updated })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const { error } = await svc.from("newsletter_campaigns").delete().eq("id", params.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 400 })
  }
}
