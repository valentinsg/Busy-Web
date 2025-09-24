import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import getServiceClient from "@/lib/supabase/server"

function supabaseAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function ipHash(ip: string | null | undefined, slug: string) {
  try {
    return crypto.createHash("sha256").update(`${ip ?? ""}|${slug}`).digest("hex").slice(0, 32)
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("slug") || ""
  if (!slug) return NextResponse.json({ avg: null, count: 0 }, { status: 200 })

  if (!supabaseAvailable()) {
    return NextResponse.json({ avg: null, count: 0 }, { status: 200 })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("blog_ratings")
    .select("rating")
    .eq("slug", slug)

  if (error || !data) return NextResponse.json({ avg: null, count: 0 }, { status: 200 })
  const count = data.length
  const avg = count ? data.reduce((a: number, b: unknown) => a + (b as { rating: number }).rating, 0) / count : null
  return NextResponse.json({ avg, count }, { status: 200 })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const slug: string = body?.slug || ""
  const rating: number = Number(body?.rating)
  if (!slug || !(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (!supabaseAvailable()) {
    // Soft-success without persistence
    return NextResponse.json({ ok: true, avg: rating, count: 1 })
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || (req as unknown as { ip: string }).ip || null
  const hash = ipHash(ip, slug)

  const supabase = getServiceClient()
  // Upsert by (slug, ip_hash) to limit one vote per IP
  // If ip hash is null, just insert
  if (hash) {
    await supabase
      .from("blog_ratings")
      .upsert({ slug, rating, ip_hash: hash, user_agent: req.headers.get("user-agent") ?? null }, { onConflict: "slug,ip_hash" })
  } else {
    await supabase
      .from("blog_ratings")
      .insert({ slug, rating, ip_hash: null, user_agent: req.headers.get("user-agent") ?? null })
  }

  const { data, error } = await supabase
    .from("blog_ratings")
    .select("rating")
    .eq("slug", slug)

  if (error || !data) return NextResponse.json({ ok: true, avg: rating, count: 1 })
  const count = data.length
  const avg = count ? data.reduce((a: number, b: unknown) => a + (b as { rating: number }).rating, 0) / count : rating
  return NextResponse.json({ ok: true, avg, count }, { status: 200 })
}
