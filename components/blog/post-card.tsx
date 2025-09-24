"use client"

import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export interface PostCardData {
  slug: string
  title: string
  description?: string
  excerpt?: string
  date?: string
  cover?: string | null
  coverAlt?: string | null
  tags?: string[]
  category?: string
}

interface PostCardProps {
  post: PostCardData
  aspectRatio?: "4/3" | "16/9" | "1/1"
  showExcerpt?: boolean
}

export default function PostCard({ post, aspectRatio = "4/3", showExcerpt = true }: PostCardProps) {
  const ar = aspectRatio === "16/9" ? "aspect-[16/9]" : aspectRatio === "1/1" ? "aspect-square" : "aspect-[4/3]"
  const date = post.date ? format(new Date(post.date), "MMMM d, yyyy", { locale: es }) : null

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} prefetch={false} className="block">
        <div className={`${ar} w-full overflow-hidden rounded-lg border bg-muted ring-1 ring-border transition-all duration-300 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)]`}>
          {post.cover ? (
            <Image
              src={post.cover}
              alt={post.coverAlt || post.title}
              width={800}
              height={aspectRatio === "16/9" ? 450 : aspectRatio === "1/1" ? 800 : 600}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-sm text-muted-foreground">Sin imagen</div>
          )}
        </div>
      </Link>

      {date && (
        <div className="mt-3 text-xs md:text-sm text-muted-foreground font-body">{date}</div>
      )}

      <h3 className="mt-2 font-heading text-xl font-semibold leading-snug">
        <Link href={`/blog/${post.slug}`} prefetch={false} className="hover:underline">
          {post.title}
        </Link>
      </h3>

      <div className="mt-2 flex items-center gap-2">
        {post.category && (
          <span className="text-[10px] inline-block bg-muted px-2 py-0.5 rounded">{post.category}</span>
        )}
      </div>

      {showExcerpt && (post.excerpt || post.description) && (
        <p className="mt-2 text-[0.95rem] text-muted-foreground line-clamp-3 font-body">{post.excerpt || post.description}</p>
      )}
    </article>
  )
}
