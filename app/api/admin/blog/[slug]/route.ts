import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import matter from "gray-matter"
import { getPostBySlug } from "@/lib/blog"
import getServiceClient from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { BlogPost } from "@/types/blog"
import readingTime from "reading-time"

const postsDir = path.join(process.cwd(), "content", "blog")
const BLOG_BUCKET = process.env.BLOG_STORAGE_BUCKET || process.env.SUPABASE_STORAGE_BUCKET || "blog"
const USE_STORAGE = Boolean(process.env.VERCEL) || String(process.env.BLOG_SOURCE || "").toLowerCase() === "storage"

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
  let post: BlogPost | null = getPostBySlug(decoded)
  if (!post) {
    const fallback = normalizeSlug(decoded)
    post = getPostBySlug(fallback)
  }

  if (!post && USE_STORAGE) {
    // Try to read from Supabase Storage
    const supabase = getServiceClient()
    for (const cand of [decoded, normalizeSlug(decoded)]) {
      const key = `${cand}.mdx`
      const { data, error } = await supabase.storage.from(BLOG_BUCKET).download(key)
      if (!error && data) {
        const text = await data.text()
        const { data: fm, content } = matter(text)
        const m = fm as Record<string, unknown>
        post = {
          slug: cand,
          title: (m.title as string) || "",
          description: (m.description as string) || "",
          excerpt: (m.excerpt as string) || undefined,
          date: (m.date as string) || "",
          tags: (m.tags as string[]) || [],
          cover: (m.cover as string) || undefined,
          coverAlt: (m.coverAlt as string) || undefined,
          author: (m.author as string) || undefined,
          authorName: (m.authorName as string) || (m.author as string) || undefined,
          authorAvatar: (m.authorAvatar as string) || undefined,
          canonical: (m.canonical as string) || undefined,
          backlinks: (m.backlinks as { label: string; url: string }[]) || undefined,
          content,
          readingTime: (typeof m.readingTime === 'string' && m.readingTime) || readingTime(content).text,
          category: (m.category as string) || undefined,
          ogImage: (m.ogImage as string) || undefined,
          faqs: (m.faqs as { question: string; answer: string }[]) || undefined,
          cta: (m.cta as { text: string; url: string }) || undefined,
          seoKeywords: (m.seoKeywords as string[]) || undefined,
        }

        break
      }
    }
  }

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true, post })
}

export async function DELETE(_: Request, { params }: { params: { slug: string } }) {
  try {
    const raw = params.slug
    const decoded = (() => { try { return decodeURIComponent(raw) } catch { return raw } })()
    const candidates = [decoded, normalizeSlug(decoded)]

    if (USE_STORAGE) {
      const supabase = getServiceClient()
      // Try both decoded and normalized filenames
      const paths = candidates.map((c) => `${c}.mdx`)
      let ok = false
      for (const p of paths) {
        const { error } = await supabase.storage.from(BLOG_BUCKET).remove([p])
        if (!error) ok = true
      }
      if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
      revalidatePath(`/blog/${decoded}`)
      revalidatePath(`/blog`)
      return NextResponse.json({ ok: true })
    }

    // Filesystem (development)
    let lastError: unknown = null
    for (const cand of candidates) {
      try {
        const filePath = path.join(postsDir, `${cand}.mdx`)
        await fs.unlink(filePath)
        revalidatePath(`/blog/${cand}`)
        revalidatePath(`/blog`)
        return NextResponse.json({ ok: true })
      } catch (e) {
        lastError = e
      }
    }
    throw lastError || new Error("Not found")
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unable to delete" }, { status: 500 })
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

    const fm: Record<string, unknown> = {
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
    Object.keys(fm).forEach((k) => (fm as Record<string, unknown>)[k] === undefined && delete (fm as Record<string, unknown>)[k])

    const mdx = matter.stringify(content || "", fm)
    const raw = (newSlug || params.slug).trim()
    const decoded = (() => { try { return decodeURIComponent(raw) } catch { return raw } })()
    const finalSlug = normalizeSlug(decoded)

    if (USE_STORAGE) {
      const supabase = getServiceClient()
      const pathKey = `${finalSlug}.mdx`
      const bytes = new TextEncoder().encode(mdx)
      const { error } = await supabase.storage
        .from(BLOG_BUCKET)
        .upload(pathKey, bytes, { contentType: "text/markdown; charset=utf-8", upsert: true })
      if (error) throw error

      // If slug changed, try to remove old variants
      const originalDecoded = (() => { try { return decodeURIComponent(params.slug) } catch { return params.slug } })()
      const originalNormalized = normalizeSlug(originalDecoded)
      if (finalSlug !== originalDecoded && finalSlug !== originalNormalized) {
        for (const old of [originalDecoded, originalNormalized]) {
          const oldKey = `${old}.mdx`
          await supabase.storage.from(BLOG_BUCKET).remove([oldKey])
        }
      }

      revalidatePath(`/blog/${finalSlug}`)
      revalidatePath(`/blog`)
      return NextResponse.json({ ok: true, slug: finalSlug })
    }

    // Filesystem (development)
    const filePath = path.join(postsDir, `${finalSlug}.mdx`)
    await fs.writeFile(filePath, mdx, "utf8")

    // If slug changed, delete the old file (filesystem only)
    const originalDecoded = (() => { try { return decodeURIComponent(params.slug) } catch { return params.slug } })()
    const originalNormalized = normalizeSlug(originalDecoded)
    if (finalSlug !== originalDecoded && finalSlug !== originalNormalized) {
      for (const old of [originalDecoded, originalNormalized]) {
        const oldPath = path.join(postsDir, `${old}.mdx`)
        try { await fs.unlink(oldPath) } catch {}
      }
    }

    return NextResponse.json({ ok: true, slug: finalSlug })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unable to update" }, { status: 500 })
  }
}
