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
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error"
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
