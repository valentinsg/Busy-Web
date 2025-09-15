import { NextResponse } from "next/server"
import { getAllPosts } from "@/lib/blog"

export async function GET() {
  try {
    const posts = getAllPosts()
      .slice(0, 3)
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        cover: p.cover || null,
      }))
    return NextResponse.json({ ok: true, posts })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Error" }, { status: 500 })
  }
}
