import { syncPopoverCoupon } from "@/lib/repo/sync-popover-coupon"
import { getServiceClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../../_utils"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await assertAdmin(req)
  if (!auth.ok) return auth.res
  const id = params.id
  const svc = getServiceClient()
  const { data, error } = await svc
    .from("popovers")
    .select(`
      id,
      title,
      body,
      discount_code,
      image_url,
      type,
      require_email,
      show_newsletter,
      cta_text,
      cta_url,
      enabled,
      priority,
      delay_seconds,
      persist_dismissal,
      start_at,
      end_at,
      sections,
      paths,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, item: data })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await assertAdmin(req)
  if (!auth.ok) return auth.res
  const id = params.id
  const body = await req.json()

  // Sincronizar cupón si se actualiza discount_code
  if (body.discount_code !== undefined && body.discount_code) {
    const syncResult = await syncPopoverCoupon(
      body.discount_code,
      body.discount_percent || 10,
      body.end_at
    )
    if (!syncResult.ok) {
      console.warn("Failed to sync coupon:", syncResult.error)
    }
  }

  const svc = getServiceClient()
  const { data, error } = await svc
    .from("popovers")
    .update({
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.body !== undefined ? { body: body.body } : {}),
      ...(body.discount_code !== undefined ? { discount_code: body.discount_code } : {}),
      ...(body.image_url !== undefined ? { image_url: body.image_url } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.require_email !== undefined ? { require_email: !!body.require_email } : {}),
      ...(body.show_newsletter !== undefined ? { show_newsletter: !!body.show_newsletter } : {}),
      ...(body.cta_text !== undefined ? { cta_text: body.cta_text } : {}),
      ...(body.cta_url !== undefined ? { cta_url: body.cta_url } : {}),
      ...(body.delay_seconds !== undefined ? { delay_seconds: Number(body.delay_seconds) } : {}),
      ...(body.persist_dismissal !== undefined ? { persist_dismissal: !!body.persist_dismissal } : {}),
      ...(body.enabled !== undefined ? { enabled: !!body.enabled } : {}),
      ...(body.priority !== undefined ? { priority: Number(body.priority) } : {}),
      ...(body.start_at !== undefined ? { start_at: body.start_at || null } : {}),
      ...(body.end_at !== undefined ? { end_at: body.end_at || null } : {}),
      ...(body.sections !== undefined
        ? {
            sections: Array.isArray(body.sections)
              ? body.sections
              : typeof body.sections === "string" && body.sections
              ? body.sections.split(",").map((s: string) => s.trim()).filter(Boolean)
              : [],
          }
        : {}),
      ...(body.paths !== undefined
        ? {
            paths: Array.isArray(body.paths)
              ? body.paths
              : typeof body.paths === "string" && body.paths
              ? body.paths.split(",").map((s: string) => s.trim()).filter(Boolean)
              : [],
          }
        : {}),
    })
    .eq("id", id)
    .select(`
      id,
      title,
      body,
      discount_code,
      image_url,
      type,
      require_email,
      show_newsletter,
      cta_text,
      cta_url,
      enabled,
      priority,
      delay_seconds,
      persist_dismissal,
      start_at,
      end_at,
      sections,
      paths,
      created_at,
      updated_at
    `)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, item: data })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await assertAdmin(req)
  if (!auth.ok) return auth.res
  const id = params.id
  const svc = getServiceClient()
  const { error } = await svc.from("popovers").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
