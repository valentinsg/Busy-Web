import { NextRequest, NextResponse } from "next/server"
import { getActivePopoverFor } from "@/lib/repo/popovers"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const path = searchParams.get("path") || "/"
    const section = searchParams.get("section") || undefined
    const pop = await getActivePopoverFor(path, section)
    return NextResponse.json({ ok: true, popover: pop })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Error" }, { status: 500 })
  }
}
