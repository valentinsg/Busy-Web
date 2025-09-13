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
  const [tags, setTags] = useState("")
  const [content, setContent] = useState("")
  const [authorsList, setAuthorsList] = useState<any[]>(authors as any[])
  const [authorId, setAuthorId] = useState<string>(((authors as any[])?.[0]?.id as string) || "")
  const [cover, setCover] = useState("")
  const [canonical, setCanonical] = useState("")
  const [backlinks, setBacklinks] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Toolbar popovers state
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [imageOpen, setImageOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")

  const autoSlug = useMemo(() => slugify(title), [title])

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
          setAuthorsList(mapped)
          setAuthorId(mapped[0]?.id || "")
        }
      } catch (e) {
        // fallback to local file already in state
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
            const author = (authorsList as any[]).find((a) => a.id === authorId) || (authorsList as any[])?.[0]
            const res = await fetch("/api/admin/blog/new", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title,
                slug: slug || autoSlug,
                description,
                tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                content,
                cover,
                canonical,
                backlinks: backlinks
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((line) => {
                    const [label, url] = line.split("|")
                    return { label: (label || url || "").trim(), url: (url || label || "").trim() }
                  }),
                authorName: author?.name || "",
                authorAvatar: author?.avatar || "",
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
          <label className="text-sm">Cover (URL o ruta pública)</label>
          <Input className="font-body" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="/busy-streetwear.png" />
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
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("# ")}>H1</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("## ")}>H2</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("### ")}>H3</Button>

            <Popover open={linkOpen} onOpenChange={setLinkOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm">Link</Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-2">
                  <label className="text-xs text-muted-foreground">URL del enlace</label>
                  <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://" />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setLinkUrl(""); setLinkOpen(false) }}>Cancelar</Button>
                    <Button type="button" size="sm" onClick={() => { applyFormat("[", `](${linkUrl || "https://"})`); setLinkUrl(""); setLinkOpen(false) }}>Insertar</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={imageOpen} onOpenChange={setImageOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm">Imagen</Button>
              </PopoverTrigger>
              <PopoverContent className="w-96">
                <div className="grid gap-2">
                  <label className="text-xs text-muted-foreground">URL de la imagen</label>
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="/busy-streetwear.png" />
                  <label className="text-xs text-muted-foreground">Texto alternativo</label>
                  <Input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Descripción" />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setImageUrl(""); setImageAlt(""); setImageOpen(false) }}>Cancelar</Button>
                    <Button type="button" size="sm" onClick={() => { const insert = `![${imageAlt || "imagen"}](${imageUrl || "/busy-streetwear.png"})\n`; applyFormat(insert, ""); setImageUrl(""); setImageAlt(""); setImageOpen(false) }}>Insertar</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Textarea ref={textareaRef} className="min-h-[260px] font-body" value={content} onChange={(e) => setContent(e.target.value)} placeholder={"Escribe contenido en MDX..."} />
            <div className="min-h-[260px] rounded-md border bg-muted/30 p-3 text-sm overflow-auto">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <h3 className="mt-0">Vista previa</h3>
                {cover && <img src={cover} alt="cover" className="rounded mb-3" />}
                <h1 className="mb-2">{title || "Título"}</h1>
                <p className="text-muted-foreground">{description || "Descripción"}</p>
                <hr className="my-3" />
                <MarkdownPreview content={content} />
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Backlinks (uno por línea, formato: label|url o solo url)</label>
          <Textarea className="min-h-[100px] font-body" value={backlinks} onChange={(e) => setBacklinks(e.target.value)} placeholder={"Guía de talles|/pages/guia-de-talles\nInstagram|https://instagram.com/busy"} />
        </div>
        <Button type="submit" disabled={saving} className="font-body">
          {saving ? "Guardando..." : "Guardar"}
        </Button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </form>
    </div>
  )
}
