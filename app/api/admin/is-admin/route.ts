import { NextResponse } from "next/server"

export async function GET() {
  const emails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean)
  return NextResponse.json({ admins: emails })
}
