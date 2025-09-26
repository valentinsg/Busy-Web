import { NextResponse } from "next/server"
import { getAllPostsAsync } from "@/lib/blog"
import { BlogPost } from "@/types/blog"

export async function GET() {
  try {
    const all = await getAllPostsAsync()
    const posts = all
      .slice(0, 3)
      .map((p: BlogPost) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        cover: p.cover || null,
      }))
    return NextResponse.json({ ok: true, posts }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Error" }, { status: 500 })
  }
}
