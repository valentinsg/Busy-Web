import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

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

    const postsDir = path.join(process.cwd(), "content", "blog")
    if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true })

    const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
    const filePath = path.join(postsDir, `${safeSlug}.mdx`)

    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Ya existe un artículo con ese slug" }, { status: 409 })
    }

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
    fs.writeFileSync(filePath, fileContents, "utf8")

    return NextResponse.json({ ok: true, slug: safeSlug })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}
