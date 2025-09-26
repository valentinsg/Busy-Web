import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import getServiceClient from "@/lib/supabase/server"

const BLOG_BUCKET = process.env.BLOG_STORAGE_BUCKET || process.env.SUPABASE_STORAGE_BUCKET || "blog"
const USE_STORAGE = Boolean(process.env.VERCEL) || String(process.env.BLOG_SOURCE || "").toLowerCase() === "storage"

function normalizeSlug(input: string) {
  return (input || "")
    .toString()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      slug,
      description,
      tags = [],
      content = "",
      authorName = "",
      authorAvatar = "",
      cover = "",
      coverAlt = "",
      canonical = "",
      backlinks = [],
      excerpt = "",
      category = "",
      readingTime = "",
      ogImage = "",
      faqs = [],
      cta = undefined,
      seoKeywords = [],
    } = body || {}

    if (!title || !(slug && typeof slug === "string")) {
      return NextResponse.json({ error: "title y slug son requeridos" }, { status: 400 })
    }
    const safeSlug = normalizeSlug(slug)

    const frontmatter = [
      "---",
      `title: ${JSON.stringify(title)}`,
      `description: ${JSON.stringify(description || "")}`,
      `date: ${JSON.stringify(new Date().toISOString().slice(0, 10))}`,
      `tags: ${JSON.stringify(tags)}`,
      cover ? `cover: ${JSON.stringify(cover)}` : null,
      coverAlt ? `coverAlt: ${JSON.stringify(coverAlt)}` : null,
      canonical ? `canonical: ${JSON.stringify(canonical)}` : null,
      authorName ? `authorName: ${JSON.stringify(authorName)}` : null,
      authorAvatar ? `authorAvatar: ${JSON.stringify(authorAvatar)}` : null,
      Array.isArray(backlinks) && backlinks.length ? `backlinks: ${JSON.stringify(backlinks)}` : null,
      excerpt ? `excerpt: ${JSON.stringify(excerpt)}` : null,
      category ? `category: ${JSON.stringify(category)}` : null,
      readingTime ? `readingTime: ${JSON.stringify(readingTime)}` : null,
      ogImage ? `ogImage: ${JSON.stringify(ogImage)}` : null,
      Array.isArray(faqs) && faqs.length ? `faqs: ${JSON.stringify(faqs)}` : null,
      cta ? `cta: ${JSON.stringify(cta)}` : null,
      Array.isArray(seoKeywords) && seoKeywords.length ? `seoKeywords: ${JSON.stringify(seoKeywords)}` : null,
      "---",
      "",
    ].filter(Boolean).join("\n")

    const fileContents = `${frontmatter}${content}\n`

    if (USE_STORAGE) {
      // Use Supabase Storage (production)
      const svc = getServiceClient()
      const key = `${safeSlug}.mdx`
      // Conflict check: if exists, return 409
      const probe = await svc.storage.from(BLOG_BUCKET).download(key)
      if (probe.data) {
        return NextResponse.json({ error: "Ya existe un artículo con ese slug" }, { status: 409 })
      }
      const bytes = new TextEncoder().encode(fileContents)
      const { error } = await svc.storage.from(BLOG_BUCKET).upload(key, bytes, { contentType: "text/markdown; charset=utf-8", upsert: false })
      if (error) return NextResponse.json({ error: error.message || "No se pudo crear el artículo" }, { status: 500 })
      return NextResponse.json({ ok: true, slug: safeSlug })
    }

    // Filesystem fallback (development)
    const postsDir = path.join(process.cwd(), "content", "blog")
    if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true })
    const filePath = path.join(postsDir, `${safeSlug}.mdx`)
    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Ya existe un artículo con ese slug" }, { status: 409 })
    }
    fs.writeFileSync(filePath, fileContents, "utf8")
    return NextResponse.json({ ok: true, slug: safeSlug })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}
