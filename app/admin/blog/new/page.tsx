"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import authors from "@/data/authors.json"
import { useToast } from "@/hooks/use-toast"
import supabase from "@/lib/supabase/client"
import type { Author } from "@/types"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const { toast } = useToast()

  // Toolbar popovers state
  const [imageOpen, setImageOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [imageUploading, setImageUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  // Link popover state
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkText, setLinkText] = useState("")
  const [linkUrl, setLinkUrl] = useState("")

  // Template selector state
  const [templateOpen, setTemplateOpen] = useState(false)

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

  function applyFormat(before: string, after = "", preserveScroll = true) {
    const el = textareaRef.current
    if (!el) return

    // Save scroll position
    const scrollTop = preserveScroll ? el.scrollTop : 0

    const start = el.selectionStart || 0
    const end = el.selectionEnd || 0

    // Trim whitespace from selection
    const selected = content.slice(start, end) || "texto"
    let trimStart = 0
    let trimEnd = 0

    // Count leading whitespace
    while (trimStart < selected.length && /\s/.test(selected[trimStart])) {
      trimStart++
    }

    // Count trailing whitespace
    while (trimEnd < selected.length && /\s/.test(selected[selected.length - 1 - trimEnd])) {
      trimEnd++
    }

    // Extract trimmed text
    const trimmedSelected = selected.slice(trimStart, selected.length - trimEnd)

    // Build new text with formatting only on trimmed selection
    const newText =
      content.slice(0, start) +
      selected.slice(0, trimStart) + // leading whitespace
      before + trimmedSelected + after +
      selected.slice(selected.length - trimEnd) + // trailing whitespace
      content.slice(end)

    setContent(newText)

    // Restore focus and scroll position
    requestAnimationFrame(() => {
      el.focus()
      const newPos = start + trimStart + before.length + trimmedSelected.length + after.length
      el.setSelectionRange(newPos, newPos)
      if (preserveScroll) {
        el.scrollTop = scrollTop
      }
    })
  }

  function applyTemplate(templateName: string) {
    const templates: Record<string, string> = {
      "tutorial": `# Título del Tutorial

## Introducción

Breve introducción sobre qué aprenderás en este tutorial.

## Requisitos previos

- Requisito 1
- Requisito 2
- Requisito 3

## Paso 1: [Nombre del paso]

Explicación detallada del primer paso.

\`\`\`
// Código de ejemplo si es necesario
\`\`\`

## Paso 2: [Nombre del paso]

Explicación del segundo paso.

## Paso 3: [Nombre del paso]

Explicación del tercer paso.

## Conclusión

Resumen de lo que se aprendió.

> **Tip:** Consejo adicional para el lector.

## Preguntas frecuentes

**¿Pregunta 1?**

Respuesta 1.

**¿Pregunta 2?**

Respuesta 2.
`,
      "review": `# Review: [Nombre del Producto]

## Primeras impresiones

Describe tus primeras impresiones al recibir el producto.

![Imagen del producto](/ruta-a-imagen.jpg)

## Características principales

- **Material:** Descripción del material
- **Fit:** Cómo calza el producto
- **Calidad:** Evaluación de la calidad
- **Precio:** Relación calidad-precio

## Lo que nos gustó ✅

- Punto positivo 1
- Punto positivo 2
- Punto positivo 3

## Lo que podría mejorar ⚠️

- Punto a mejorar 1
- Punto a mejorar 2

## Veredicto final

Conclusión y recomendación final.

### Puntuación: ⭐⭐⭐⭐⭐ (X/5)

> **Recomendado para:** Tipo de persona a quien le gustaría este producto.
`,
      "guia": `# Guía: [Título de la Guía]

## ¿Por qué es importante?

Explica la importancia del tema que vas a tratar.

## Conceptos básicos

Define los conceptos fundamentales que el lector debe conocer.

### Concepto 1

Explicación del concepto 1.

### Concepto 2

Explicación del concepto 2.

## Mejores prácticas

1. **Práctica 1:** Descripción y por qué es importante
2. **Práctica 2:** Descripción y por qué es importante
3. **Práctica 3:** Descripción y por qué es importante

## Errores comunes a evitar

- ❌ Error 1 y cómo evitarlo
- ❌ Error 2 y cómo evitarlo
- ❌ Error 3 y cómo evitarlo

## Recursos adicionales

- [Recurso 1](https://ejemplo.com)
- [Recurso 2](https://ejemplo.com)

## Conclusión

Resumen final y próximos pasos.
`,
      "noticia": `# [Título de la Noticia]

## Resumen

Breve resumen de la noticia en 2-3 líneas.

![Imagen destacada](/ruta-a-imagen.jpg)

## ¿Qué pasó?

Descripción detallada del evento o noticia.

## Contexto

Información de contexto necesaria para entender la noticia.

## Detalles importantes

- **Fecha:** Cuándo ocurrió
- **Lugar:** Dónde ocurrió
- **Involucrados:** Quiénes están involucrados

## Impacto

Cómo afecta esto a la comunidad o industria.

## Próximos pasos

Qué se espera que suceda a continuación.

## Fuentes

- [Fuente 1](https://ejemplo.com)
- [Fuente 2](https://ejemplo.com)
`,
      "lista": `# [Título]: Top X [Tema]

## Introducción

Breve introducción sobre el tema de la lista.

## #1 - [Nombre del Item]

![Imagen](/ruta-a-imagen.jpg)

**Por qué está en el #1:**

Explicación detallada de por qué este item está en primer lugar.

### Características destacadas:
- Característica 1
- Característica 2
- Característica 3

---

## #2 - [Nombre del Item]

![Imagen](/ruta-a-imagen.jpg)

**Por qué está en el #2:**

Explicación del segundo item.

### Características destacadas:
- Característica 1
- Característica 2

---

## #3 - [Nombre del Item]

![Imagen](/ruta-a-imagen.jpg)

**Por qué está en el #3:**

Explicación del tercer item.

## Conclusión

Resumen final y recomendación.
`,
      "comparacion": `# [Producto A] vs [Producto B]: ¿Cuál elegir?

## Introducción

Breve introducción sobre los productos que vas a comparar.

## Tabla comparativa rápida

| Característica | Producto A | Producto B |
|----------------|------------|------------|
| Precio | $XXX | $XXX |
| Material | XXX | XXX |
| Fit | XXX | XXX |
| Durabilidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## Producto A

![Imagen Producto A](/ruta-a-imagen.jpg)

### Ventajas
- ✅ Ventaja 1
- ✅ Ventaja 2
- ✅ Ventaja 3

### Desventajas
- ❌ Desventaja 1
- ❌ Desventaja 2

## Producto B

![Imagen Producto B](/ruta-a-imagen.jpg)

### Ventajas
- ✅ Ventaja 1
- ✅ Ventaja 2
- ✅ Ventaja 3

### Desventajas
- ❌ Desventaja 1
- ❌ Desventaja 2

## Veredicto final

**Elige Producto A si:**
- Condición 1
- Condición 2

**Elige Producto B si:**
- Condición 1
- Condición 2

## Conclusión

Recomendación final basada en diferentes perfiles de usuario.
`
    }

    if (templates[templateName]) {
      setContent(templates[templateName])
      setTemplateOpen(false)
      toast({
        title: "✅ Template aplicado",
        description: `Se aplicó el template "${templateName}" correctamente`,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold mb-1">Nuevo artículo</h2>
          <p className="font-body text-sm text-muted-foreground">Completa los campos y guarda el archivo MDX.</p>
        </div>
        <Link href="/admin/blog" className="text-sm text-muted-foreground hover:underline">← Volver</Link>
      </section>

      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setSaving(true)
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
            toast({
              title: "✅ Artículo creado",
              description: "El artículo se guardó correctamente",
            })
          } catch (err: unknown) {
            toast({
              title: "❌ Error",
              description: err?.toString() || "Error al guardar el artículo",
              variant: "destructive",
            })
          } finally {
            setSaving(false)
          }
        }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        {/* MAIN CONTENT - 2 columnas */}
        <div className="xl:col-span-2 space-y-6">
          {/* Card: Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información básica</CardTitle>
              <CardDescription>Título, slug y descripción del artículo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Título</label>
                <Input className="font-body" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del artículo" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Slug</label>
                <Input className="font-body" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={autoSlug} />
                {autoSlug && <p className="text-xs text-muted-foreground">Auto-generado: {autoSlug}</p>}
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Descripción</label>
                <Input className="font-body" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción para SEO" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Excerpt / Resumen corto</label>
                <Textarea className="font-body min-h-[80px]" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Resumen breve para listado y cabecera" />
              </div>
            </CardContent>
          </Card>

          {/* Card: Contenido */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contenido (MDX)</CardTitle>
              <CardDescription>Escribe el contenido del artículo en Markdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {/* Template selector */}
                <Popover open={templateOpen} onOpenChange={setTemplateOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="default" size="sm" className="font-semibold text-xs sm:text-sm">📄 Templates</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 sm:w-80">
                    <div className="grid gap-2">
                      <h4 className="font-semibold text-sm mb-2">Selecciona un template</h4>
                      <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate("tutorial")} className="justify-start text-xs sm:text-sm">📚 Tutorial / How-to</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate("review")} className="justify-start text-xs sm:text-sm">⭐ Review de Producto</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate("guia")} className="justify-start text-xs sm:text-sm">📖 Guía Completa</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate("noticia")} className="justify-start text-xs sm:text-sm">📰 Noticia / Anuncio</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate("lista")} className="justify-start text-xs sm:text-sm">📝 Lista / Top X</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate("comparacion")} className="justify-start text-xs sm:text-sm">⚖️ Comparación</Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Format buttons */}
                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("**", "**") }} className="text-xs sm:text-sm">Bold</Button>
                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("*", "*") }} className="text-xs sm:text-sm">Italic</Button>
                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("<u>", "</u>") }} className="text-xs sm:text-sm">Underline</Button>

                {/* Link button */}
                <Popover open={linkOpen} onOpenChange={setLinkOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm">🔗 Link</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96">
                    <div className="grid gap-2">
                      <label className="text-xs text-muted-foreground">Texto del enlace</label>
                      <Input value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Haz click aquí" />
                      <label className="text-xs text-muted-foreground">URL</label>
                      <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://ejemplo.com" />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => { setLinkText(""); setLinkUrl(""); setLinkOpen(false) }} className="text-xs sm:text-sm">Cancelar</Button>
                        <Button type="button" size="sm" onClick={(e) => { e.preventDefault(); const insert = `[${linkText || "enlace"}](${linkUrl || "#"})`; applyFormat(insert, ""); setLinkText(""); setLinkUrl(""); setLinkOpen(false) }} className="text-xs sm:text-sm">Insertar</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("# ") }} className="text-xs sm:text-sm">H1</Button>
                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("## ") }} className="text-xs sm:text-sm">H2</Button>
                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("### ") }} className="text-xs sm:text-sm">H3</Button>
                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("<br/>\n") }} className="text-xs sm:text-sm">Line Break</Button>
                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("\n\n") }} className="text-xs sm:text-sm">Espacio</Button>
                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("\n- Item 1\n- Item 2\n- Item 3\n\n") }} className="text-xs sm:text-sm">Lista</Button>
                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("\n1. Paso uno\n2. Paso dos\n3. Paso tres\n\n") }} className="text-xs sm:text-sm">Lista num</Button>
                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("\n> Cita de ejemplo\n> segunda línea opcional\n\n") }} className="text-xs sm:text-sm">Cita</Button>
                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("\n> **Tip:** escribe aquí tu consejo destacado.\n\n") }} className="text-xs sm:text-sm">Tip</Button>
                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("\n| Columna A | Columna B | Columna C |\n|-----------|-----------|-----------|\n| A1        | B1        | C1        |\n| A2        | B2        | C2        |\n\n") }} className="text-xs sm:text-sm">Tabla</Button>
                <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); applyFormat("\n**FAQ**\n\n**Pregunta:** …\n\n**Respuesta:** …\n\n") }} className="text-xs sm:text-sm">FAQ</Button>

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
                            console.error(err)
                          } finally {
                            setImageUploading(false)
                            if (imageInputRef.current) imageInputRef.current.value = ""
                          }
                        }} />
                        <Button type="button" size="sm" className="font-heading text-xs sm:text-sm" onClick={() => imageInputRef.current?.click()} disabled={imageUploading}>
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
                        <Button type="button" variant="ghost" size="sm" onClick={() => { setImageUrl(""); setImageAlt(""); setImageOpen(false) }} className="text-xs sm:text-sm">Cancelar</Button>
                        <Button type="button" size="sm" className="font-heading text-xs sm:text-sm" onClick={(e) => { e.preventDefault(); const insert = `![${imageAlt || "imagen"}](${imageUrl || "/busy-streetwear.png"})\n`; applyFormat(insert, ""); setImageUrl(""); setImageAlt(""); setImageOpen(false) }}>Insertar</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Textarea simple para contenido MDX */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">Contenido del artículo</label>
                <Textarea
                  ref={textareaRef}
                  className="font-mono text-xs sm:text-sm min-h-[400px] sm:min-h-[500px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escribe tu contenido aquí... Usa **negrita**, *cursiva*, # títulos, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Card: SEO y Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SEO y Metadata</CardTitle>
              <CardDescription>Optimización para buscadores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Keywords objetivo (separadas por coma)</label>
                <Input className="font-body" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="hoodies, streetwear, invierno" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Canonical (opcional)</label>
                <Input className="font-body" value={canonical} onChange={(e) => setCanonical(e.target.value)} placeholder="https://tu-dominio.com/blog/mi-post" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Imagen para redes (Open Graph / Twitter)</label>
                <Input className="font-body" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://.../og-image.png" />
              </div>
            </CardContent>
          </Card>

          {/* Card: Extras */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Extras</CardTitle>
              <CardDescription>Backlinks, FAQs y CTA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Backlinks (uno por línea, formato: label|url)</label>
                <Textarea className="min-h-[100px] font-body" value={backlinks} onChange={(e) => setBacklinks(e.target.value)} placeholder={"Guía de talles|/pages/guia-de-talles\nInstagram|https://instagram.com/busy"} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">FAQ (uno por línea, formato: pregunta|respuesta)</label>
                <Textarea className="min-h-[120px] font-body" value={faqs} onChange={(e) => setFaqs(e.target.value)} placeholder={"¿Cómo lavo mi hoodie?|Lavar con agua fría y secado a la sombra"} />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">CTA - Texto</label>
                  <Input className="font-body" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Ver nuestra colección de hoodies →" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">CTA - URL</label>
                  <Input className="font-body" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="/hoodies" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SIDEBAR - 1 columna */}
        <div className="xl:col-span-1 space-y-6">
          {/* Card: Portada */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Portada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Cover (URL o ruta pública)</label>
                <Input className="font-body" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="/busy-streetwear.png" />
              </div>
              <div className="flex items-center gap-2">
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    setCoverUploading(true)
                    const url = await uploadFile(file, "blog")
                    setCover(url)
                  } catch (err) {
                    console.error(err)
                  } finally {
                    setCoverUploading(false)
                    if (coverInputRef.current) coverInputRef.current.value = ""
                  }
                }} />
                <Button type="button" size="sm" className="font-heading w-full text-xs sm:text-sm" onClick={() => coverInputRef.current?.click()} disabled={coverUploading}>
                  {coverUploading ? "Subiendo…" : "Subir imagen"}
                </Button>
              </div>
              {cover && (
                <div className="space-y-2">
                  <Image
                    src={cover}
                    alt={coverAlt || "Portada del artículo"}
                    width={448}
                    height={252}
                    className="w-full h-auto rounded border"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <label className="text-sm font-medium">Alt de portada</label>
                <Input className="font-body" value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} placeholder="Texto alternativo" />
              </div>
            </CardContent>
          </Card>

          {/* Card: Organización */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Organización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Categoría</label>
                <Input className="font-body" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Cuidado de ropa" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Tags (separados por coma)</label>
                <Input className="font-body" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="news, drops" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Autor</label>
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
                <label className="text-sm font-medium">Tiempo de lectura (override)</label>
                <Input className="font-body" value={readingOverride} onChange={(e) => setReadingOverride(e.target.value)} placeholder="3 min read" />
              </div>
            </CardContent>
          </Card>

          {/* Card: Vista previa */}
          <Card className="sticky top-4 sm:top-6">
            <CardHeader>
              <CardTitle className="text-lg">Vista previa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-muted/30 p-4 text-xs overflow-auto max-h-[600px]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {cover && (
                    <Image
                      src={cover}
                      alt={coverAlt || "Portada"}
                      width={400}
                      height={225}
                      className="rounded mb-4 w-full h-auto"
                    />
                  )}
                  {category && <div className="text-xs inline-block bg-muted px-2 py-1 rounded mb-2">{category}</div>}
                  <h1 className="text-lg font-bold mb-2">{title || "Título del artículo"}</h1>
                  <p className="text-muted-foreground text-xs mb-4">{(excerpt || description) || "Descripción del artículo"}</p>
                  <hr className="my-4" />
                  <div className="text-xs">
                    <MarkdownPreview content={content || "*Escribe contenido para ver la vista previa...*"} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer con botones */}
        <div className="xl:col-span-3 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 border-t pt-6">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button type="button" variant="outline" onClick={() => window.history.back()} className="flex-1 sm:flex-none text-xs sm:text-sm">Cancelar</Button>
            <Button type="submit" disabled={saving} className="font-body flex-1 sm:flex-none text-xs sm:text-sm">
              {saving ? "Guardando..." : "Guardar artículo"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
