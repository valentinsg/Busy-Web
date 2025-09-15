import { NextRequest, NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"

function supabaseAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("slug") || ""
  if (!slug) return NextResponse.json({ items: [] }, { status: 200 })

  if (!supabaseAvailable()) {
    return NextResponse.json({ items: [] }, { status: 200 })
  }

  const supabase = getServiceClient()
  const { data } = await supabase
    .from("blog_comments")
    .select("id,name,message,created_at")
    .eq("slug", slug)
    .eq("approved", true)
    .order("created_at", { ascending: false })

  return NextResponse.json({ items: data ?? [] }, { status: 200 })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const slug: string = body?.slug || ""
  const name: string = body?.name || ""
  const email: string = body?.email || ""
  const message: string = body?.message || ""

  if (!slug || !name || !email || !message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (!supabaseAvailable()) {
    // Soft-success without persistence
    return NextResponse.json({ ok: true })
  }

  const supabase = getServiceClient()
  const { error } = await supabase
    .from("blog_comments")
    .insert({ slug, name, email, message, approved: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true }, { status: 200 })
}
