import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import matter from "gray-matter"
import { getPostBySlug } from "@/lib/blog"

const postsDir = path.join(process.cwd(), "content", "blog")

// Normalize a slug to a filesystem-friendly form (remove accents, keep dashes)
function normalizeSlug(input: string) {
  return (input || "")
    .toString()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const raw = params.slug
  const decoded = (() => {
    try { return decodeURIComponent(raw) } catch { return raw }
  })()
  let post = getPostBySlug(decoded)
  if (!post) {
    const fallback = normalizeSlug(decoded)
    post = getPostBySlug(fallback)
  }
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true, post })
}

export async function DELETE(_: Request, { params }: { params: { slug: string } }) {
  try {
    const raw = params.slug
    const decoded = (() => { try { return decodeURIComponent(raw) } catch { return raw } })()
    const candidates = [decoded, normalizeSlug(decoded)]
    let lastError: any = null
    for (const cand of candidates) {
      try {
        const filePath = path.join(postsDir, `${cand}.mdx`)
        await fs.unlink(filePath)
        return NextResponse.json({ ok: true })
      } catch (e) {
        lastError = e
      }
    }
    throw lastError || new Error("Not found")
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
      coverAlt,
      canonical,
      backlinks,
      authorName,
      authorAvatar,
      date,
      slug: newSlug,
      excerpt,
      category,
      readingTime,
      ogImage,
      faqs,
      cta,
      seoKeywords,
    } = body || {}

    const fm: Record<string, any> = {
      title,
      description,
      date: date || new Date().toISOString().slice(0, 10),
      tags,
      cover,
      coverAlt,
      canonical,
      backlinks,
      authorName,
      authorAvatar,
      excerpt,
      category,
      readingTime,
      ogImage,
      faqs,
      cta,
      seoKeywords,
    }

    // clean undefined
    Object.keys(fm).forEach((k) => (fm as any)[k] === undefined && delete (fm as any)[k])

    const mdx = matter.stringify(content || "", fm)
    const raw = (newSlug || params.slug).trim()
    const decoded = (() => { try { return decodeURIComponent(raw) } catch { return raw } })()
    const finalSlug = normalizeSlug(decoded)
    const filePath = path.join(postsDir, `${finalSlug}.mdx`)
    await fs.writeFile(filePath, mdx, "utf8")

    // If slug changed, delete the old file
    // Try to remove old file if slug changed (check both raw and normalized variants)
    const originalDecoded = (() => { try { return decodeURIComponent(params.slug) } catch { return params.slug } })()
    const originalNormalized = normalizeSlug(originalDecoded)
    if (finalSlug !== originalDecoded && finalSlug !== originalNormalized) {
      for (const old of [originalDecoded, originalNormalized]) {
        const oldPath = path.join(postsDir, `${old}.mdx`)
        try { await fs.unlink(oldPath) } catch {}
      }
    }

    return NextResponse.json({ ok: true, slug: finalSlug })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unable to update" }, { status: 500 })
  }
}
