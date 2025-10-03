import Link from "next/link"
import { getAllPostsAsync } from "@/lib/blog"

export default async function LatestBlogCard() {
  const posts = await getAllPostsAsync()
  const latestPosts = posts.slice(0, 4)
  
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 font-medium">Últimos artículos</div>
      {latestPosts.length === 0 && <div className="text-sm text-muted-foreground">Sin artículos</div>}
      <div className="space-y-3">
        {latestPosts.map((post) => (
          <div key={post.slug} className="flex items-center justify-between gap-3 pb-3 border-b last:border-b-0 last:pb-0">
            <div className="min-w-0">
              <div className="font-medium truncate text-sm" title={post.title}>{post.title}</div>
              <div className="text-xs text-muted-foreground">{post.date} · {post.readingTime}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href={`/blog/${post.slug}`} className="text-xs underline underline-offset-2 hover:text-primary">Ver</Link>
              <Link href={`/admin/blog/edit/${post.slug}`} className="text-xs underline underline-offset-2 hover:text-primary">Editar</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
