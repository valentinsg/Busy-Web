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

export function getAllPosts(): BlogPost[] {
  try {
    if (USE_STORAGE) {
      // Synchronous interface expected; perform a blocking-like fetch via deasync pattern is not ideal.
      // Instead, attempt filesystem first when running in a strictly sync context.
      // For production pages (server components), prefer API route that can be async.
      // Here we fall back to filesystem if storage cannot be read synchronously.
    }
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
  } catch (error) {
    return []
  }
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const decoded = (() => { try { return decodeURIComponent(slug) } catch { return slug } })()
    const candidates = [decoded, normalizeSlug(decoded)]

    // Try filesystem first (works locally and also for pre-bundled content)
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

    // If not found and storage is enabled, try Supabase Storage
    if (!fileContents && USE_STORAGE) {
      const supabase = getServiceClient()
      for (const cand of candidates) {
        const key = `${cand}.mdx`
        const { data, error } = (supabase.storage as any).from(BLOG_BUCKET).download(key)
        // Note: supabase-js v2 download is async; in this sync context we cannot await.
        // Therefore, rely on filesystem for synchronous server usage.
        if (!error && data) {
          // best-effort: Node Blob may expose a synchronous "size>0" but no sync read; skip here
        }
      }
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
      category: (data.category as string) || undefined,
      ogImage: data.ogImage || undefined,
      faqs: data.faqs || undefined,
      cta: data.cta || undefined,
      seoKeywords: data.seoKeywords || undefined,
    }
  } catch (error) {
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
