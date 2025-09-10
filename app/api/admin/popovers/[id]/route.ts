import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../../_utils"
import { getServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await assertAdmin(req)
  if (!auth.ok) return auth.res
  const id = params.id
  const svc = getServiceClient()
  const { data, error } = await svc
    .from("popovers")
    .select("*")
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
  const svc = getServiceClient()
  const { data, error } = await svc
    .from("popovers")
    .update({
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.body !== undefined ? { body: body.body } : {}),
      ...(body.discount_code !== undefined ? { discount_code: body.discount_code } : {}),
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
    .select("*")
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
