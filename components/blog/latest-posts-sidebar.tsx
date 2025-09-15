import { getAllPosts } from "@/lib/blog"
import Link from "next/link"

export default function LatestPostsSidebar({ currentSlug }: { currentSlug: string }) {
  const posts = getAllPosts().filter((p) => p.slug !== currentSlug).slice(0, 4)
  if (posts.length === 0) return null
  return (
    <div className="rounded-md border bg-muted/20 p-4 " >
      <h4 className="font-heading text-lg font-semibold mb-4">Últimos posts</h4>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.slug} className="flex items-center gap-2">
            {p.cover ? (
              <Link href={`/blog/${p.slug}`}>
                <img src={p.cover} alt={p.coverAlt || p.title} className="h-14 w-16 object-cover rounded border" />
              </Link>
            ) : (
              <Link href={`/blog/${p.slug}`}>
                <div className="h-14 w-16 rounded border bg-muted" />
              </Link>
            )}
            <div className="min-w-0">
              <Link className="hover:underline text-accent-brand font-sm line-clamp-2 font-body" href={`/blog/${p.slug}`}>{p.title}</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
