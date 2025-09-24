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

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <h2 className="font-heading text-[2rem] md:text-[2.5rem] font-bold text-center mb-12">
          Últimas entradas del Blog
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {posts.map((post) => (
            <div key={post.slug}>
              <PostCard post={post as PostCardData} aspectRatio="4/3" showExcerpt={true} />
              <div className="mt-4">
                <Link
                  href={`/blog/${post.slug}`}
                  prefetch={false}
                  className="inline-flex items-center gap-1 font-heading text-sm text-accent-brand hover:text-accent-brand/90 hover:underline"
                >
                  Leer más
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild className="btn-street font-heading text-white px-8 py-3 text-lg">
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
