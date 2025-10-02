import Link from "next/link"
import { getAllPostsAsync } from "@/lib/blog"

export default async function LatestBlogCard() {
  const posts = await getAllPostsAsync()
  const latest = posts[0]
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 font-medium">Último artículo</div>
      {!latest && <div className="text-sm text-muted-foreground">Sin artículos</div>}
      {latest && (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium truncate" title={latest.title}>{latest.title}</div>
            <div className="text-xs text-muted-foreground">{latest.date} · {latest.readingTime}</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href={`/blog/${latest.slug}`} className="text-xs underline underline-offset-2">Ver</Link>
            <Link href={`/admin/blog/edit/${latest.slug}`} className="text-xs underline underline-offset-2">Editar</Link>
          </div>
        </div>
      )}
    </div>
  )
}
