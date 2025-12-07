"use client"

import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

function arrFromInput(v: string): string[] {
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  try {
    const { data } = await supabase.auth.getSession()
    const token = data?.session?.access_token
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    console.error("Error getting auth token:", e)
  }
  return headers
}

export default function NewPopoverPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const editingId = sp?.get("id")

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [discount, setDiscount] = useState("")
  const [discountPercent, setDiscountPercent] = useState(10)
  const [imageUrl, setImageUrl] = useState("")
  const [type, setType] = useState("simple")
  const [requireEmail, setRequireEmail] = useState(false)
  const [showNewsletter, setShowNewsletter] = useState(false)
  const [ctaText, setCtaText] = useState("")
  const [ctaUrl, setCtaUrl] = useState("")
  const [delaySeconds, setDelaySeconds] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const [priority, setPriority] = useState(0)
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [sections, setSections] = useState("")
  const [paths, setPaths] = useState("")

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      if (!editingId) return
      try {
        const headers = await getAuthHeaders()
        const res = await fetch(`/api/admin/popovers/${editingId}`, { headers })
        const json = await res.json()
        if (json?.item) {
          const p = json.item
          setTitle(p.title || "")
          setBody(p.body || "")
          setDiscount(p.discount_code || "")
          setDiscountPercent(Number(p.discount_percent || 10))
          setImageUrl(p.image_url || "")
          setType(p.type || "simple")
          setRequireEmail(!!p.require_email)
          setShowNewsletter(!!p.show_newsletter)
          setCtaText(p.cta_text || "")
          setCtaUrl(p.cta_url || "")
          setDelaySeconds(Number(p.delay_seconds || 0))
          setEnabled(!!p.enabled)
          setPriority(Number(p.priority || 0))
          setStartAt(p.start_at ? p.start_at.slice(0, 16) : "")
          setEndAt(p.end_at ? p.end_at.slice(0, 16) : "")
          setSections((p.sections || []).join(", "))
          setPaths((p.paths || []).join(", "))
        }
      } catch {
        // ignore
      }
    }
    load()
  }, [editingId])

  const isEdit = useMemo(() => Boolean(editingId), [editingId])

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-2">{isEdit ? "Editar popup" : "Nuevo popup"}</h2>
          <p className="font-body text-muted-foreground">Define título, contenido, ventanas de tiempo y segmentación por secciones o rutas.</p>
        </div>
        <Link href="/admin/popovers" className="text-sm text-muted-foreground hover:underline">Volver</Link>
      </section>

      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setSaving(true)
          try {
            const payload = {
              title: title.trim(),
              body: body.trim() || null,
              discount_code: discount.trim() || null,
              discount_percent: Number(discountPercent),
              image_url: imageUrl.trim() || null,
              type,
              require_email: requireEmail,
              show_newsletter: showNewsletter,
              cta_text: ctaText.trim() || null,
              cta_url: ctaUrl.trim() || null,
              delay_seconds: Number(delaySeconds),
              enabled,
              priority: Number(priority),
              start_at: startAt ? new Date(startAt).toISOString() : null,
              end_at: endAt ? new Date(endAt).toISOString() : null,
              sections: arrFromInput(sections),
              paths: arrFromInput(paths),
            }
            const headers = await getAuthHeaders()
            const url = isEdit ? `/api/admin/popovers/${editingId}` : "/api/admin/popovers"
            const method = isEdit ? "PATCH" : "POST"
            const res = await fetch(url, { method, headers, body: JSON.stringify(payload) })
            const json = await res.json()
            if (!res.ok) throw new Error(json?.error || "Error")
            toast({
              title: isEdit ? "✅ Popup actualizado" : "✅ Popup creado",
              description: isEdit ? "Los cambios se guardaron correctamente" : "El popup se creó correctamente",
            })
            setTimeout(() => router.push("/admin/popovers"), 600)
          } catch (err: unknown) {
            toast({
              title: "❌ Error",
              description: err?.toString() || "Error al guardar el popup",
              variant: "destructive",
            })
          } finally {
            setSaving(false)
          }
        }}
        className="rounded-lg border bg-background p-4 space-y-4"
      >
        <div className="grid gap-2">
          <label className="text-sm">Título</label>
          <input className="rounded-md border bg-background px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Contenido (opcional)</label>
          <textarea className="rounded-md border bg-background px-3 py-2 text-sm" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Imagen (opcional)</label>
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              className="rounded-md border bg-background px-3 py-2 text-sm flex-1"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setUploading(true)
                try{
                  const fd = new FormData()
                  fd.append("file", file)
                  fd.append("bucket", "popovers")
                  const headers = await getAuthHeaders()
                  delete headers["Content-Type"] // Let browser set it for FormData
                  const res = await fetch("/api/admin/upload", {
                    method: "POST",
                    body: fd,
                    headers,
                  })
                  const json = await res.json()
                  if (!res.ok || !json?.ok) throw new Error(json?.error || "Error al subir")
                  setImageUrl(json.url)
                  toast({
                    title: "✅ Imagen subida",
                    description: "La imagen se subió correctamente",
                  })
                } catch (err: unknown) {
                  toast({
                    title: "❌ Error",
                    description: err?.toString() || "Error al subir la imagen",
                    variant: "destructive",
                  })
                } finally {
                  setUploading(false)
                }
              }}
              disabled={uploading}
            />
            {uploading && <span className="text-sm text-muted-foreground self-center">Subiendo...</span>}
          </div>
          {imageUrl && (
            <div className="relative w-full h-32 rounded-md overflow-hidden border">
              <Image src={imageUrl} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Tipo de popup */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Tipo de Popup</label>
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="simple">Simple - Solo mensaje</option>
            <option value="discount">Descuento - Muestra código directamente</option>
            <option value="email-gate">Email-Gate - Pide email antes de mostrar código</option>
            <option value="newsletter">Newsletter - Formulario de suscripción</option>
            <option value="custom">Custom - Personalizado</option>
          </select>
          <p className="text-xs text-muted-foreground">
            {type === 'simple' && 'Muestra solo el mensaje sin interacción'}
            {type === 'discount' && 'Muestra el código de descuento directamente'}
            {type === 'email-gate' && 'Requiere email antes de revelar el código'}
            {type === 'newsletter' && 'Formulario de suscripción al newsletter'}
            {type === 'custom' && 'Combina opciones personalizadas'}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm">Código de descuento (opcional)</label>
            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="BUSY10" value={discount} onChange={(e) => setDiscount(e.target.value.toUpperCase())} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">% Descuento (1-100)</label>
            <input
              type="number"
              min="1"
              max="100"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          El código se creará automáticamente en la tabla de cupones si no existe
        </p>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-sm">Delay (segundos)</label>
            <input
              type="number"
              min="0"
              max="60"
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(Number(e.target.value))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm pt-6">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Activo
          </label>
          <div className="grid gap-2">
            <label className="text-sm">Prioridad</label>
            <input type="number" className="rounded-md border bg-background px-3 py-2 text-sm" value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Delay: Segundos antes de mostrar el popup (0 = inmediato, recomendado: 3-5 segundos)
        </p>

        {/* Opciones de interacción */}
        <div className="grid gap-3 p-4 rounded-lg border bg-muted/30">
          <h4 className="text-sm font-medium">Opciones de Interacción</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={requireEmail}
                onChange={(e) => setRequireEmail(e.target.checked)}
              />
              Requiere email para ver código
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showNewsletter}
                onChange={(e) => setShowNewsletter(e.target.checked)}
              />
              Mostrar formulario de newsletter
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Si marcas &quot;Requiere email&quot;, el código se mostrará solo después de que el usuario ingrese su email.
          </p>
        </div>

        {/* CTA personalizado */}
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm">Texto del botón CTA (opcional)</label>
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Ver productos"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">URL del botón CTA (opcional)</label>
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="/products"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm">Inicio (opcional)</label>
            <input type="datetime-local" className="rounded-md border bg-background px-3 py-2 text-sm" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Fin (opcional)</label>
            <input type="datetime-local" className="rounded-md border bg-background px-3 py-2 text-sm" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm">Secciones (coma separadas) - ej: home, products, blog</label>
            <input className="rounded-md border bg-background px-3 py-2 text-sm" value={sections} onChange={(e) => setSections(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Rutas (coma separadas) - ej: /products, /blog</label>
            <input className="rounded-md border bg-background px-3 py-2 text-sm" value={paths} onChange={(e) => setPaths(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button disabled={saving} className="rounded-md border bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90 disabled:opacity-60">
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear popup"}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={async () => {
                if (!editingId) return
                if (!confirm("¿Eliminar popup?")) return
                setSaving(true)
                try {
                  const headers = await getAuthHeaders()
                  const res = await fetch(`/api/admin/popovers/${editingId}`, { method: "DELETE", headers })
                  const json = await res.json()
                  if (!res.ok) throw new Error(json?.error || "Error")
                  toast({
                    title: "✅ Popup eliminado",
                    description: "El popup se eliminó correctamente",
                  })
                  router.push("/admin/popovers")
                } catch (err: unknown) {
                  toast({
                    title: "❌ Error",
                    description: err?.toString() || "Error al eliminar el popup",
                    variant: "destructive",
                  })
                } finally {
                  setSaving(false)
                }
              }}
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              Eliminar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
