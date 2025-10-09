"use client"

import PostCard, { type PostCardData } from "@/components/blog/post-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface PostSummary {
  slug: string
  title: string
  description: string
  excerpt?: string
  date: string
  cover: string | null
}

export default function HomeLatestBlog() {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/blog/list", { cache: "no-store" })
        const data = await res.json()
        if (!cancelled && data?.ok && Array.isArray(data.posts)) {
          setPosts(data.posts)
        }
      } catch {}
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return null
  if (!posts.length) return null

  // Mostrar solo los últimos 4 artículos
  const latestPosts = posts.slice(0, 3)

  return (
    <section className="py-10 md:py-16">
      <div className="container px-6 sm:px-4">
        <h2 className="font-heading text-[1.5rem] sm:text-[1.75rem] md:text-[2rem] font-bold text-center my-6 sm:my-10">
          Últimas entradas del Blog
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {latestPosts.map((post) => (
            <div key={post.slug}>
              <PostCard post={post as PostCardData} aspectRatio="4/3" showExcerpt />
              <div className="mt-2 sm:mt-3">
                <Link
                  href={`/blog/${post.slug}`}
                  prefetch={false}
                  className="inline-flex items-center gap-1 font-heading text-xs sm:text-sm text-accent-brand hover:text-accent-brand/90 hover:underline"
                >
                  Leer más
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <Button asChild className="btn-street font-heading text-white px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg">
            <Link href="/blog" prefetch={false}>
              Ver Blog
              <ExternalLink className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
