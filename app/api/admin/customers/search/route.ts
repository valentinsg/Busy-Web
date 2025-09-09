import { NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get("q") || "").trim()
    const limit = Number(searchParams.get("limit") || 10)

    const supabase = getServiceClient()
    let query = supabase.from("customers").select("id,email,full_name").order("created_at", { ascending: false }).limit(limit)
    if (q) {
      const like = `%${q}%`
      query = query.or(`email.ilike.${like},full_name.ilike.${like}`)
    }
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ ok: true, customers: data ?? [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}
