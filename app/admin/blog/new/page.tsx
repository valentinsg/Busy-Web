"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import Link from "next/link"
import authors from "@/data/authors.json"
import dynamic from "next/dynamic"
import supabase from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Author } from "@/lib/types"
import Image from "next/image"

const MarkdownPreview = dynamic(() => import("@/components/blog/markdown-preview"), {
  ssr: false,
  loading: () => <div className="text-sm text-muted-foreground">Cargando vista previa...</div>,
})

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
  const [excerpt, setExcerpt] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [content, setContent] = useState("")
  const [authorsList, setAuthorsList] = useState<Author[]>(authors as Author[])
  const [authorId, setAuthorId] = useState<string>(((authors as Author[])?.[0]?.id as string) || "")
  const [cover, setCover] = useState("")
  const [coverAlt, setCoverAlt] = useState("")
  const [canonical, setCanonical] = useState("")
  const [ogImage, setOgImage] = useState("")
  const [readingOverride, setReadingOverride] = useState("")
  const [backlinks, setBacklinks] = useState<string>("")
  const [faqs, setFaqs] = useState<string>("")
  const [ctaText, setCtaText] = useState("")
  const [ctaUrl, setCtaUrl] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Toolbar popovers state
  const [imageOpen, setImageOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [imageUploading, setImageUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  // Cover upload state
  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const [coverUploading, setCoverUploading] = useState(false)

  const autoSlug = useMemo(() => slugify(title), [title])

  async function uploadFile(file: File, bucket = "blog"): Promise<string> {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("bucket", bucket)
    // Adjuntar token de sesión para pasar assertAdmin en el endpoint
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

  // Load authors from Supabase on mount
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
          setAuthorsList(mapped as unknown as Author[])
          setAuthorId(mapped[0]?.id || "")
        }
      } catch (e: unknown) {
        console.error(e)
      }
    }
    loadAuthors()
    return () => {
      cancelled = true
    }
  }, [])

  function applyFormat(before: string, after = "") {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart || 0
    const end = el.selectionEnd || 0
    const selected = content.slice(start, end) || "texto"
    const newText = content.slice(0, start) + before + selected + after + content.slice(end)
    setContent(newText)
    // restore focus roughly after inserted text
    requestAnimationFrame(() => {
      el.focus()
      const newPos = start + before.length + selected.length + after.length
      el.setSelectionRange(newPos, newPos)
    })
  }

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
            const author = authorsList.find((a) => a.id === authorId) || authorsList?.[0]
            const res = await fetch("/api/admin/blog/new", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title,
                slug: slug || autoSlug,
                description,
                excerpt,
                category,
                tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                content,
                cover,
                coverAlt,
                ogImage,
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
                authorName: author?.name || "",
                authorAvatar: author?.avatar || "",
              }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Error al guardar")
            setMessage("Artículo creado correctamente")
          } catch (err: unknown) {
            setMessage(err?.toString() || "Error al guardar")
          } finally {
            setSaving(false)
          }
        }}
        className="space-y-4"
      >
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
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
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
            }} />
            <Button type="button" size="sm" className="font-heading" onClick={() => coverInputRef.current?.click()} disabled={coverUploading}>
              {coverUploading ? "Subiendo…" : "Subir"}
            </Button>
          </div>
          {cover && (
            <div className="text-xs text-muted-foreground">Vista previa:</div>
          )}
          {cover && (
            <Image
              src={cover}
              alt={coverAlt || "Portada del artículo"}
              width={448}
              height={112}
              className="h-28 w-auto rounded border"
            />
          )}
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Alt de portada</label>
          <Input className="font-body" value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} placeholder="Texto alternativo descriptivo de la portada" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Imagen para redes (Open Graph / Twitter)</label>
          <Input className="font-body" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://.../og-image.png" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Tiempo de lectura (override opcional)</label>
          <Input className="font-body" value={readingOverride} onChange={(e) => setReadingOverride(e.target.value)} placeholder="3 min read" />
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
              <SelectValue placeholder="Seleccioná un autor" />
            </SelectTrigger>
            <SelectContent className="font-body">
              {(authorsList as Author[]).map((a) => (
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
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("# ")}>H1</Button>
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
                    <Image
                      src={imageUrl}
                      alt="imagen"
                      width={448}
                      height={112}
                      className="h-28 w-auto rounded border"
                    />
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
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="editor">Editor (Markdown)</TabsTrigger>
              <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="mt-4">
              <Textarea
                ref={textareaRef}
                className="min-h-[500px] font-body"
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
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <div className="min-h-[500px] rounded-md border bg-muted/30 p-6 text-sm overflow-auto">
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  {cover && (
                    <Image
                      src={cover}
                      alt={coverAlt || "Portada del artículo"}
                      width={800}
                      height={450}
                      className="rounded mb-6"
                    />
                  )}
                  {category && <div className="text-xs inline-block bg-muted px-2 py-1 rounded mr-2 mb-4">{category}</div>}
                  <h1 className="mb-4">{title || "Título del artículo"}</h1>
                  <p className="text-muted-foreground mb-6">{(excerpt || description) || "Descripción del artículo"}</p>
                  <hr className="my-6" />
                  <MarkdownPreview content={content} />
                  {(faqs.trim() || ctaText || ctaUrl) && <hr className="my-6" />}
                  {faqs.trim() && (
                    <div className="mt-6">
                      <h4 className="font-heading font-semibold mb-3">Preguntas frecuentes</h4>
                      <ul className="list-disc pl-5 space-y-2">
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
            </TabsContent>
          </Tabs>
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
