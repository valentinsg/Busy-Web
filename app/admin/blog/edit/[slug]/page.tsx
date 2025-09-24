"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import MarkdownPreview from "@/components/blog/markdown-preview"
import authors from "@/data/authors.json"
import supabase from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Importación directa para evitar problemas de carga de chunks en tiempo de ejecución

function slugify(input: string) {
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

export default function AdminBlogEditPage() {
  const params = useParams<{ slug: string }>()
  const currentSlug = params?.slug || ""
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [tags, setTags] = useState("")
  const [content, setContent] = useState("")
  const [cover, setCover] = useState("")
  const [coverAlt, setCoverAlt] = useState("")
  const [canonical, setCanonical] = useState("")
  const [ogImage, setOgImage] = useState("")
  const [category, setCategory] = useState("")
  const [readingOverride, setReadingOverride] = useState("")
  const [faqs, setFaqs] = useState<string>("")
  const [ctaText, setCtaText] = useState("")
  const [ctaUrl, setCtaUrl] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")
  const [backlinks, setBacklinks] = useState<string>("")

  const [authorsList, setAuthorsList] = useState<any[]>(authors as any[])
  const [authorId, setAuthorId] = useState<string>(((authors as any[])?.[0]?.id as string) || "")
  const [authorName, setAuthorName] = useState<string>("")
  const [authorAvatar, setAuthorAvatar] = useState<string>("")

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Upload helpers state
  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const [coverUploading, setCoverUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")

  const autoSlug = useMemo(() => slugify(title), [title])

  async function uploadFile(file: File, bucket = "blog"): Promise<string> {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("bucket", bucket)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    const data = await res.json()
    if (!res.ok || !data?.ok) throw new Error(data?.error || "Error al subir")
    return data.url as string
  }

  useEffect(() => {
    let cancelled = false

    async function loadAuthors() {
      try {
        const { data, error } = await supabase
          .from("authors")
          .select("id,name,email,avatar_url,active,created_at")
          .eq("active", true)
          .order("created_at", { ascending: true })
        if (error) throw error
        if (!cancelled && Array.isArray(data) && data.length) {
          const mapped = data.map((a) => ({ id: a.id, name: a.name, email: a.email, avatar: a.avatar_url }))
          setAuthorsList(mapped)
        }
      } catch {}
    }

    async function loadPost() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/blog/${encodeURIComponent(currentSlug)}`)
        if (!res.ok) throw new Error("No se pudo cargar el artículo")
        const { post } = await res.json()
        if (!post) throw new Error("Artículo no encontrado")

        setTitle(post.title || "")
        setSlug(post.slug || currentSlug)
        setDescription(post.description || "")
        setExcerpt(post.excerpt || "")
        setTags(Array.isArray(post.tags) ? post.tags.join(", ") : "")
        setContent(post.content || "")
        setCover(post.cover || "")
        setCoverAlt(post.coverAlt || "")
        setCanonical(post.canonical || "")
        setOgImage(post.ogImage || "")
        setCategory(post.category || "")
        setReadingOverride(post.readingTime || "")
        setFaqs(Array.isArray(post.faqs) ? post.faqs.map((f: any) => `${f.question}|${f.answer}`).join("\n") : "")
        setCtaText(post.cta?.text || "")
        setCtaUrl(post.cta?.url || "")
        setSeoKeywords(Array.isArray(post.seoKeywords) ? post.seoKeywords.join(", ") : "")
        setBacklinks(Array.isArray(post.backlinks) ? post.backlinks.map((b: any) => `${b.label}|${b.url}`).join("\n") : "")
        setAuthorName(post.authorName || post.author || "")
        setAuthorAvatar(post.authorAvatar || "")
      } catch (e: any) {
        setError(e?.message || "Error al cargar el artículo")
      } finally {
        setLoading(false)
      }
    }

    loadAuthors()
    loadPost()
    return () => {
      cancelled = true
    }
  }, [currentSlug])

  function applyFormat(before: string, after = "") {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart || 0
    const end = el.selectionEnd || 0
    const selected = content.slice(start, end) || "texto"
    const newText = content.slice(0, start) + before + selected + after + content.slice(end)
    setContent(newText)
    requestAnimationFrame(() => {
      el.focus()
      const newPos = start + before.length + selected.length + after.length
      el.setSelectionRange(newPos, newPos)
    })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      // Normalize content: enforce a single H1 by demoting subsequent H1s to H2
      let normalizedContent = content
      const h1Regex = /^#\s+/gm
      let match
      let count = 0
      normalizedContent = normalizedContent.replace(h1Regex, () => {
        count += 1
        return count === 1 ? "# " : "## "
      })

      const selectedAuthor = (authorsList as any[]).find((a) => a.id === authorId)
      const finalAuthorName = selectedAuthor?.name || authorName || ""
      const finalAuthorAvatar = selectedAuthor?.avatar || authorAvatar || ""

      const res = await fetch(`/api/admin/blog/${encodeURIComponent(currentSlug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || autoSlug,
          description,
          excerpt,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          content: normalizedContent,
          cover,
          coverAlt,
          ogImage,
          category,
          readingTime: readingOverride,
          canonical,
          backlinks: backlinks
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .map((line) => {
              const [label, url] = line.split("|")
              return { label: (label || url || "").trim(), url: (url || label || "").trim() }
            }),
          faqs: faqs
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .map((line) => {
              const [q, a] = line.split("|")
              return { question: (q || "").trim(), answer: (a || "").trim() }
            }),
          cta: ctaText || ctaUrl ? { text: ctaText, url: ctaUrl } : undefined,
          seoKeywords: seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          authorName: finalAuthorName,
          authorAvatar: finalAuthorAvatar,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Error al guardar")

      const newSlug = data?.slug || slug || currentSlug
      setMessage("Cambios guardados")
      if (newSlug !== currentSlug) {
        router.replace(`/admin/blog/edit/${encodeURIComponent(newSlug)}`)
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">Editar artículo</h2>
            <p className="font-body text-muted-foreground">Cargando…</p>
          </div>
        <div className="grid gap-2">
          <label className="text-sm">Imagen para redes (Open Graph / Twitter)</label>
          <Input className="font-body" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://.../og-image.png" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Tiempo de lectura (override opcional)</label>
          <Input className="font-body" value={readingOverride} onChange={(e) => setReadingOverride(e.target.value)} placeholder="3 min read" />
        </div>
          <Link href="/admin/blog" className="text-sm text-muted-foreground hover:underline">Volver</Link>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <section className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold mb-2">Editar artículo</h2>
            <p className="font-body text-red-500">{error}</p>
          </div>
          <Link href="/admin/blog" className="text-sm text-muted-foreground hover:underline">Volver</Link>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-2">Editar artículo</h2>
          <p className="font-body text-muted-foreground">Modificá los campos y guardá el archivo MDX.</p>
        </div>
        <Link href="/admin/blog" className="text-sm text-muted-foreground hover:underline">Volver</Link>
      </section>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm">Título</label>
          <Input className="font-body" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Slug</label>
          <Input className="font-body" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={autoSlug} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Descripción</label>
          <Input className="font-body" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Excerpt / Resumen corto</label>
          <Input className="font-body" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Resumen breve para listado y cabecera" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Categoría</label>
          <Input className="font-body" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Cuidado de ropa, Journey Busy…" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Cover (URL o ruta pública)</label>
          <div className="flex items-center gap-2">
            <Input className="font-body" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="/busy-streetwear.png" />
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                try {
                  setCoverUploading(true)
                  const url = await uploadFile(file, "blog")
                  setCover(url)
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.error(err)
                } finally {
                  setCoverUploading(false)
                  if (coverInputRef.current) coverInputRef.current.value = ""
                }
              }}
            />
            <Button type="button" size="sm" className="font-heading" onClick={() => coverInputRef.current?.click()} disabled={coverUploading}>
              {coverUploading ? "Subiendo…" : "Subir"}
            </Button>
          </div>
          {cover && <div className="text-xs text-muted-foreground">Vista previa:</div>}
          {cover && <img src={cover} alt={coverAlt || "Portada del artículo"} className="h-28 w-auto rounded border" />}
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Alt de portada</label>
          <Input className="font-body" value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} placeholder="Texto alternativo descriptivo de la portada" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Canonical (opcional)</label>
          <Input className="font-body" value={canonical} onChange={(e) => setCanonical(e.target.value)} placeholder="https://tu-dominio.com/blog/mi-post" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Tags (separados por coma)</label>
          <Input className="font-body" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="news, drops" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Autor</label>
          <Select value={authorId} onValueChange={setAuthorId}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder={authorName || "Seleccioná un autor"} />
            </SelectTrigger>
            <SelectContent className="font-body">
              {(authorsList as any[]).map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Contenido (MDX)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("**", "**")}>Bold</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("*", "*")}>Italic</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("<u>", "</u>")}>Underline</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("## ")}>H2</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("### ")}>H3</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("\n\n")}>Espacio</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("\n> Cita de ejemplo\n> segunda línea opcional\n\n")}>Cita</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("\n> **Tip:** escribe aquí tu consejo destacado.\n\n")}>Caja destacada</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("\n1. Paso uno\n2. Paso dos\n3. Paso tres\n\n")}>Snippet numerado</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("\n| Columna A | Columna B | Columna C |\n|-----------|-----------|-----------|\n| A1        | B1        | C1        |\n| A2        | B2        | C2        |\n\n")}>Tabla</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("\n**FAQ**\n\n**Pregunta:** …\n\n**Respuesta:** …\n\n")}>FAQ</Button>

            <Popover open={imageOpen} onOpenChange={setImageOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm">Imagen</Button>
              </PopoverTrigger>
              <PopoverContent className="w-96">
                <div className="grid gap-2">
                  <label className="text-xs text-muted-foreground">URL de la imagen</label>
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="/busy-streetwear.png" />
                  <div className="flex items-center gap-2">
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        setImageUploading(true)
                        const url = await uploadFile(file, "blog")
                        setImageUrl(url)
                      } catch (err) {
                        // eslint-disable-next-line no-console
                        console.error(err)
                      } finally {
                        setImageUploading(false)
                        if (imageInputRef.current) imageInputRef.current.value = ""
                      }
                    }} />
                    <Button type="button" size="sm" className="font-heading" onClick={() => imageInputRef.current?.click()} disabled={imageUploading}>
                      {imageUploading ? "Subiendo…" : "Subir archivo"}
                    </Button>
                  </div>
                  {imageUrl && (
                    <img src={imageUrl} alt="imagen" className="h-28 w-auto rounded border" />
                  )}
                  <label className="text-xs text-muted-foreground">Texto alternativo</label>
                  <Input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Descripción" />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setImageUrl(""); setImageAlt(""); setImageOpen(false) }}>Cancelar</Button>
                    <Button type="button" size="sm" className="font-heading" onClick={() => { const insert = `![${imageAlt || "imagen"}](${imageUrl || "/busy-streetwear.png"})\n`; applyFormat(insert, ""); setImageUrl(""); setImageAlt(""); setImageOpen(false) }}>Insertar</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea
              ref={textareaRef}
              className="min-h-[260px] font-body"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault()
                  applyFormat("\n\n")
                }
              }}
              placeholder={"Escribe contenido en MDX... • Ctrl+Enter: insertar espacio entre párrafos • Usa los botones: Espacio, Cita, Tabla"}
            />
            <div className="min-h-[260px] rounded-md border bg-muted/30 p-3 text-sm overflow-auto">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <h3 className="mt-0">Vista previa</h3>
                {cover && <img src={cover} alt={coverAlt || "Portada del artículo"} className="rounded mb-3" />}
                {category && <div className="text-xs inline-block bg-muted px-2 py-1 rounded mr-2">{category}</div>}
                <h1 className="mb-2">{title || "Título"}</h1>
                <p className="text-muted-foreground">{(excerpt || description) || "Descripción"}</p>
                <hr className="my-3" />
                <MarkdownPreview content={content} />
                {(faqs.trim() || ctaText || ctaUrl) && <hr className="my-3" />}
                {faqs.trim() && (
                  <div className="mt-4">
                    <h4 className="font-heading font-semibold mb-2">Preguntas frecuentes</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {faqs.split('\n').filter(Boolean).map((line, i) => {
                        const [q, a] = line.split('|')
                        return (
                          <li key={i}><strong>{(q || '').trim()}:</strong> {(a || '').trim()}</li>
                        )
                      })}
                    </ul>
                  </div>
                )}
                {(ctaText || ctaUrl) && (
                  <div className="mt-6 p-4 rounded-md border bg-muted/40">
                    <h4 className="font-heading font-semibold mb-2">CTA</h4>
                    <a className="text-accent-brand hover:underline" href={ctaUrl || '#'}>{ctaText || ctaUrl}</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Backlinks (uno por línea, formato: label|url o solo url)</label>
          <Textarea className="min-h-[100px] font-body" value={backlinks} onChange={(e) => setBacklinks(e.target.value)} placeholder={"Guía de talles|/pages/guia-de-talles\nInstagram|https://instagram.com/busy"} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">FAQ (uno por línea, formato: pregunta|respuesta)</label>
          <Textarea className="min-h-[120px] font-body" value={faqs} onChange={(e) => setFaqs(e.target.value)} placeholder={"¿Cómo lavo mi hoodie?|Lavar con agua fría y secado a la sombra"} />
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm">CTA - Texto</label>
            <Input className="font-body" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Ver nuestra colección de hoodies →" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">CTA - URL</label>
            <Input className="font-body" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="/hoodies" />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Keywords objetivo (interno, separadas por coma)</label>
          <Input className="font-body" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="hoodies, streetwear, invierno" />
        </div>
        <Button type="submit" disabled={saving} className="font-body">
          {saving ? "Guardando..." : "Guardar"}
        </Button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </form>
    </div>
  )
}
