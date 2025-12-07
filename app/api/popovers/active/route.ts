import { getActivePopoverFor } from "@/lib/repo/popovers"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const path = searchParams.get("path") || "/"
    const section = searchParams.get("section") || undefined
    const excludeParam = searchParams.get("exclude") || ""
    const excludeIds = excludeParam ? excludeParam.split(",").filter(Boolean) : []
    const pop = await getActivePopoverFor(path, section, excludeIds)
    return NextResponse.json({ ok: true, popover: pop })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error"
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
