"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export default function AdminBlogNewPage() {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const autoSlug = useMemo(() => slugify(title), [title])

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-2">Nuevo artículo</h2>
          <p className="font-body text-muted-foreground">Completa los campos y guarda el archivo MDX.</p>
        </div>
        <Link href="/admin/blog" className="text-sm text-muted-foreground hover:underline">Volver</Link>
      </section>

      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setSaving(true)
          setMessage(null)
          try {
            const res = await fetch("/api/admin/blog/new", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title,
                slug: slug || autoSlug,
                description,
                tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                content,
              }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Error al guardar")
            setMessage("Artículo creado correctamente")
          } catch (err: any) {
            setMessage(err.message)
          } finally {
            setSaving(false)
          }
        }}
        className="space-y-4"
      >
        <div className="grid gap-2">
          <label className="text-sm">Título</label>
          <input className="rounded-md border bg-background px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Slug</label>
          <input className="rounded-md border bg-background px-3 py-2 text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={autoSlug} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Descripción</label>
          <input className="rounded-md border bg-background px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Tags (separados por coma)</label>
          <input className="rounded-md border bg-background px-3 py-2 text-sm" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="news, drops" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Contenido (MDX)</label>
          <textarea className="min-h-[200px] rounded-md border bg-background px-3 py-2 text-sm" value={content} onChange={(e) => setContent(e.target.value)} placeholder={"Escribe contenido en MDX..."} />
        </div>
        <button disabled={saving} className="rounded-md border bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90 disabled:opacity-60">
          {saving ? "Guardando..." : "Guardar"}
        </button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </form>
    </div>
  )
}
