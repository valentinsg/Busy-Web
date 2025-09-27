import Link from "next/link"
import { getAllPostsAsync } from "@/lib/blog"
import BlogRowActions from "@/components/admin/blog-row-actions"

export const dynamic = "force-dynamic"

export default async function AdminBlogPage() {
  const posts = await getAllPostsAsync()

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-2">Blog</h2>
          <p className="font-body text-muted-foreground">Ver y administrar artículos MDX.</p>
        </div>
        <Link href="/admin/blog/new" className="rounded-md border bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90">
          Nuevo artículo
        </Link>
      </section>

      <div className="rounded-lg border bg-muted/10 divide-y">
        {posts.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">No hay artículos aún.</div>
        )}
        {posts.map((p) => (
          <div key={p.slug} className="p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-heading font-medium">{p.title || p.slug}</div>
              <div className="text-xs text-muted-foreground">{p.date} · {p.readingTime}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/blog/${p.slug}`} className="text-sm text-muted-foreground hover:underline">Ver</Link>
              <BlogRowActions slug={p.slug} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
