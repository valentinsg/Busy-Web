import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServiceClient } from "@/lib/supabase/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export async function assertAdmin(req: NextRequest) {
  // Optional development bypass: set ADMIN_DEV_BYPASS=true in .env.local (ignored in production)
  const devBypass = process.env.ADMIN_DEV_BYPASS === 'true' && process.env.NODE_ENV !== 'production'
  if (devBypass) {
    const svc = getServiceClient()
    return { ok: true as const, svc, user: { email: 'dev@local' } }
  }

  const auth = req.headers.get("authorization") || req.headers.get("Authorization")
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return { ok: false as const, res: NextResponse.json({ error: "Missing token" }, { status: 401 }) }
  }
  const token = auth.slice(7)
  const client = createClient(supabaseUrl, anonKey)
  const { data, error } = await client.auth.getUser(token)
  if (error || !data?.user?.email) {
    return { ok: false as const, res: NextResponse.json({ error: "Invalid token" }, { status: 401 }) }
  }
  const email = data.user.email
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean)
  const isAdmin = adminEmails.includes(email)
  if (!isAdmin) {
    return { ok: false as const, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  const svc = getServiceClient()
  return { ok: true as const, svc, user: data.user }
}
