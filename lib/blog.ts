import "server-only"
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"
import type { BlogPost } from "@/types/blog"
import getServiceClient from "@/lib/supabase/server"

const postsDirectory = path.join(process.cwd(), "content/blog")
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

// Async storage-first getters

export async function getAllPostsAsync(): Promise<BlogPost[]> {
  try {
    if (USE_STORAGE) {
      const supabase = getServiceClient()
      const listRes = (await (supabase.storage.from(BLOG_BUCKET).list('', { limit: 1000 }) as unknown as Promise<{ data: Array<{ name: string }>; error: any }>))
      const list = listRes?.data || []
      const mdxFiles = list.filter((o) => o.name?.endsWith('.mdx'))
      const results: BlogPost[] = []
      for (const obj of mdxFiles) {
        try {
          const key = obj.name
          const slug = key.replace(/\.mdx$/, '')
          const { data: blob, error: dErr } = await supabase.storage.from(BLOG_BUCKET).download(key)
          if (dErr || !blob) continue
          const text = await blob.text()
          const { data, content } = matter(text)
          const readTime = readingTime(content)
          results.push({
            slug,
            title: (data.title as string) || "",
            description: (data.description as string) || "",
            excerpt: (data.excerpt as string) || undefined,
            date: (data.date as string) || "",
            tags: (data.tags as string[]) || [],
            cover: (data.cover as string) || undefined,
            coverAlt: (data.coverAlt as string) || undefined,
            author: (data.author as string) || undefined,
            authorName: (data.authorName as string) || (data.author as string) || undefined,
            authorAvatar: (data.authorAvatar as string) || undefined,
            canonical: (data.canonical as string) || undefined,
            backlinks: (data.backlinks as { label: string; url: string }[]) || undefined,
            content,
            readingTime: (typeof data.readingTime === 'string' && data.readingTime) || readTime.text,
            category: (data.category as string) || undefined,
            ogImage: (data.ogImage as string) || undefined,
            faqs: (data.faqs as { question: string; answer: string }[]) || undefined,
            cta: (data.cta as { text: string; url: string }) || undefined,
            seoKeywords: (data.seoKeywords as string[]) || undefined,
          })
        } catch {}
      }
      if (results.length) return results.sort((a, b) => (a.date < b.date ? 1 : -1))
    }
  } catch {}
  // Fallback to filesystem
  return getAllPosts()
}

export async function getPostBySlugAsync(slug: string): Promise<BlogPost | null> {
  const decoded = (() => { try { return decodeURIComponent(slug) } catch { return slug } })()
  const candidates = [decoded, (decoded || '').toString().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\-\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')] as string[]
  try {
    if (USE_STORAGE) {
      const supabase = getServiceClient()
      for (const cand of candidates) {
        const key = `${cand}.mdx`
        const { data, error } = await supabase.storage.from(BLOG_BUCKET).download(key)
        if (!error && data) {
          const text = await data.text()
          const { data: fm, content } = matter(text)
          const m = fm as Record<string, unknown>
          const readTime = readingTime(content)
          return {
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
            readingTime: (typeof m.readingTime === 'string' && m.readingTime) || readTime.text,
            category: (m.category as string) || undefined,
            ogImage: (m.ogImage as string) || undefined,
            faqs: (m.faqs as { question: string; answer: string }[]) || undefined,
            cta: (m.cta as { text: string; url: string }) || undefined,
            seoKeywords: (m.seoKeywords as string[]) || undefined,
          }
        }
      }
    }
  } catch {}
  // Fallback to filesystem
  return getPostBySlug(slug)
}

export function getAllPosts(): BlogPost[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory)
    const allPostsData = fileNames
      .filter((name) => name.endsWith(".mdx"))
      .map((name) => {
        const slug = name.replace(/\.mdx$/, "")
        const fullPath = path.join(postsDirectory, name)
        const fileContents = fs.readFileSync(fullPath, "utf8")
        const { data, content } = matter(fileContents)
        const readTime = readingTime(content)

        return {
          slug,
          title: data.title || "",
          description: data.description || "",
          excerpt: data.excerpt || undefined,
          date: data.date || "",
          tags: data.tags || [],
          cover: data.cover || undefined,
          coverAlt: data.coverAlt || undefined,
          author: data.author || undefined,
          authorName: data.authorName || data.author || undefined,
          authorAvatar: data.authorAvatar || undefined,
          canonical: data.canonical || undefined,
          backlinks: data.backlinks || undefined,
          content,
          readingTime: data.readingTime || readTime.text,
          category: (data.category as string) || undefined,
          ogImage: data.ogImage || undefined,
          faqs: data.faqs || undefined,
          cta: data.cta || undefined,
          seoKeywords: data.seoKeywords || undefined,
        }
      })

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
  } catch {
    return []
  }
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const decoded = (() => { try { return decodeURIComponent(slug) } catch { return slug } })()
    const candidates = [decoded, normalizeSlug(decoded)]
    let fileContents: string | null = null
    let finalSlug = decoded
    for (const cand of candidates) {
      try {
        const fullPath = path.join(postsDirectory, `${cand}.mdx`)
        fileContents = fs.readFileSync(fullPath, "utf8")
        finalSlug = cand
        break
      } catch {}
    }
    if (!fileContents) return null
    const { data, content } = matter(fileContents)
    const readTime = readingTime(content)

    return {
      slug: finalSlug,
      title: data.title || "",
      description: data.description || "",
      excerpt: data.excerpt || undefined,
      date: data.date || "",
      tags: data.tags || [],
      cover: data.cover || undefined,
      coverAlt: data.coverAlt || undefined,
      author: data.author || undefined,
      authorName: data.authorName || data.author || undefined,
      authorAvatar: data.authorAvatar || undefined,
      canonical: data.canonical || undefined,
      backlinks: data.backlinks || undefined,
      content,
      readingTime: data.readingTime || readTime.text,
      // Category comes directly from frontmatter when present
      category: (data.category as string) || undefined,
      ogImage: data.ogImage || undefined,
      faqs: data.faqs || undefined,
      cta: data.cta || undefined,
      seoKeywords: data.seoKeywords || undefined,
    }
  } catch {
    return null
  }
}

export function getPostsByTag(tag: string): BlogPost[] {
  const allPosts = getAllPosts()
  return allPosts.filter((post) => post.tags.includes(tag))
}

export function getAllTags(): string[] {
  const allPosts = getAllPosts()
  const tags = allPosts.flatMap((post) => post.tags)
  return [...new Set(tags)]
}

export function searchPosts(query: string): BlogPost[] {
  const allPosts = getAllPosts()
  const lowercaseQuery = query.toLowerCase()

  return allPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.description.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
      post.content.toLowerCase().includes(lowercaseQuery),
  )
}
