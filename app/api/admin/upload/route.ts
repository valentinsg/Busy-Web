import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../_utils"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    const bucket = (form.get("bucket") as string) || process.env.SUPABASE_STORAGE_BUCKET || "products"
    if (!file) return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const path = `${Date.now()}-${file.name}`

    // Ensure bucket exists and is public
    try {
      // getBucket is available; if not, list and check
      const { data: bInfo } = await svc.storage.getBucket?.(bucket)
      if (!bInfo) {
        const { data: list } = await svc.storage.listBuckets?.()
        const exists = Array.isArray(list) && list.some((b: unknown) => (b as { name: string }).name === bucket)
        if (!exists) {
          await svc.storage.createBucket?.(bucket, { public: true })
        }
      }
      // Try to set public if not already
      await svc.storage.updateBucket?.(bucket, { public: true })
    } catch {
      // best-effort; continue
    }

    const { error } = await svc.storage.from(bucket).upload(path, new Uint8Array(bytes), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    })
    if (error) throw error

    const { data: pub } = svc.storage.from(bucket).getPublicUrl(path)
    return NextResponse.json({ ok: true, url: pub.publicUrl, path })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 400 })
  }
}
