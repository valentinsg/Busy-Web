import { getAllPostsAsync } from "@/lib/blog"
import Link from "next/link"
import Image from "next/image"

export default async function LatestPostsSidebar({ currentSlug }: { currentSlug: string }) {
  const posts = (await getAllPostsAsync()).filter((p) => p.slug !== currentSlug).slice(0, 4)
  if (posts.length === 0) return null
  return (
    <div className="rounded-md border bg-muted/20 p-4 " >
      <h4 className="font-heading text-lg font-semibold mb-4">Últimos posts</h4>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.slug} className="flex items-start gap-3">
            <Link href={`/blog/${p.slug}`} className="flex-shrink-0">
              {p.cover ? (
                <div className="relative w-20 h-20 rounded border overflow-hidden">
                  <Image 
                    src={p.cover} 
                    alt={p.coverAlt || p.title} 
                    fill
                    sizes="80px"
                    className="object-cover" 
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded border bg-muted" />
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link className="hover:underline text-accent-brand text-sm line-clamp-2 font-body" href={`/blog/${p.slug}`}>{p.title}</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
