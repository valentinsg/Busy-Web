import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import matter from "gray-matter"
import { getPostBySlug } from "@/lib/blog"

const postsDir = path.join(process.cwd(), "content", "blog")

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true, post })
}

export async function DELETE(_: Request, { params }: { params: { slug: string } }) {
  try {
    const filePath = path.join(postsDir, `${params.slug}.mdx`)
    await fs.unlink(filePath)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unable to delete" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json()
    const {
      title = "",
      description = "",
      tags = [],
      content = "",
      cover,
      canonical,
      backlinks,
      authorName,
      authorAvatar,
      date,
      slug: newSlug,
    } = body || {}

    const fm: Record<string, any> = {
      title,
      description,
      date: date || new Date().toISOString().slice(0, 10),
      tags,
      cover,
      canonical,
      backlinks,
      authorName,
      authorAvatar,
    }

    // clean undefined
    Object.keys(fm).forEach((k) => (fm as any)[k] === undefined && delete (fm as any)[k])

    const mdx = matter.stringify(content || "", fm)
    const finalSlug = (newSlug || params.slug).trim()
    const filePath = path.join(postsDir, `${finalSlug}.mdx`)
    await fs.writeFile(filePath, mdx, "utf8")

    // If slug changed, delete the old file
    if (finalSlug !== params.slug) {
      const oldPath = path.join(postsDir, `${params.slug}.mdx`)
      try { await fs.unlink(oldPath) } catch {}
    }

    return NextResponse.json({ ok: true, slug: finalSlug })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unable to update" }, { status: 500 })
  }
}
