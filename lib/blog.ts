import "server-only"
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"
import type { BlogPost } from "@/types/blog"

const postsDirectory = path.join(process.cwd(), "content/blog")

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
