import { syncPopoverCoupon } from "@/lib/repo/sync-popover-coupon"
import { getServiceClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../_utils"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const auth = await assertAdmin(req)
  if (!auth.ok) return auth.res
  const svc = getServiceClient()
  const { data, error } = await svc
    .from("popovers")
    .select("id, title, enabled, priority, start_at, end_at, sections, paths, discount_code, image_url, updated_at")
    .order("enabled", { ascending: false })
    .order("priority", { ascending: false })
    .order("updated_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, items: data ?? [] })
}

export async function POST(req: NextRequest) {
  const auth = await assertAdmin(req)
  if (!auth.ok) return auth.res
  const body = await req.json()
  const payload = {
    title: String(body.title || "").trim(),
    body: body.body ?? null,
    discount_code: body.discount_code ?? null,
    image_url: body.image_url ?? null,
    type: body.type || 'simple',
    require_email: body.require_email ?? false,
    show_newsletter: body.show_newsletter ?? false,
    cta_text: body.cta_text ?? null,
    cta_url: body.cta_url ?? null,
    delay_seconds: Number(body.delay_seconds ?? 0),
    persist_dismissal: body.persist_dismissal ?? true,
    enabled: body.enabled ?? true,
    priority: Number(body.priority ?? 0),
    start_at: body.start_at || null,
    end_at: body.end_at || null,
    sections: Array.isArray(body.sections)
      ? body.sections
      : typeof body.sections === "string" && body.sections
      ? body.sections.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [],
    paths: Array.isArray(body.paths)
      ? body.paths
      : typeof body.paths === "string" && body.paths
      ? body.paths.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [],
  }
  if (!payload.title) return NextResponse.json({ error: "Missing title" }, { status: 400 })

  // Sincronizar cupón si hay discount_code
  if (payload.discount_code) {
    const syncResult = await syncPopoverCoupon(
      payload.discount_code,
      body.discount_percent || 10,
      payload.end_at
    )
    if (!syncResult.ok) {
      console.warn("Failed to sync coupon:", syncResult.error)
    }
  }

  const svc = getServiceClient()
  const { data, error } = await svc
    .from("popovers")
    .insert(payload)
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
