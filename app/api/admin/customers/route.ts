import { NextRequest, NextResponse } from "next/server"
import { deleteCustomer, updateCustomer } from "@/lib/repo/customers"
import { assertAdmin } from "../_utils"

export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest) {
  const auth = await assertAdmin(req)
  if (!auth.ok) return auth.res
  
  try {
    const body = await req.json()
    const id = body?.id as string | undefined
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })
    const patch: Record<string, unknown> = {
      email: body?.email ?? undefined,
      full_name: body?.full_name ?? undefined,
      phone: body?.phone ?? undefined,
      tags: body?.tags ?? undefined,
    }
    const customer = await updateCustomer(id, patch)
    return NextResponse.json({ ok: true, customer })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await assertAdmin(req)
  if (!auth.ok) return auth.res
  
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })
    await deleteCustomer(id)
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}
