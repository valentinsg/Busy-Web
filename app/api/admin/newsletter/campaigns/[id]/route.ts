import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../../../_utils"
import { z } from "zod"

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
  scheduled_at: z.string().datetime().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const body = await req.json()
    const data = patchSchema.parse(body)
    const patch: any = { ...data }
    const { error, data: updated } = await svc
      .from("newsletter_campaigns")
      .update(patch)
      .eq("id", params.id)
      .select("*")
      .maybeSingle()
    if (error) throw error
    return NextResponse.json({ ok: true, item: updated })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 400 })
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
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 400 })
  }
}
