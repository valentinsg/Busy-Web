"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

function arrFromInput(v: string): string[] {
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function NewPopoverPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const editingId = sp.get("id")

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [discount, setDiscount] = useState("")
  const [enabled, setEnabled] = useState(true)
  const [priority, setPriority] = useState(0)
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [sections, setSections] = useState("")
  const [paths, setPaths] = useState("")

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!editingId) return
      try {
        const res = await fetch(`/api/admin/popovers/${editingId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("sb-access-token") || ""}` } })
        const json = await res.json()
        if (json?.item) {
          const p = json.item
          setTitle(p.title || "")
          setBody(p.body || "")
          setDiscount(p.discount_code || "")
          setEnabled(!!p.enabled)
          setPriority(Number(p.priority || 0))
          setStartAt(p.start_at ? p.start_at.slice(0, 16) : "")
          setEndAt(p.end_at ? p.end_at.slice(0, 16) : "")
          setSections((p.sections || []).join(", "))
          setPaths((p.paths || []).join(", "))
        }
      } catch (e) {
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
          <h2 className="font-heading text-xl font-semibold mb-2">{isEdit ? "Editar popover" : "Nuevo popover"}</h2>
          <p className="font-body text-muted-foreground">Define título, contenido, ventanas de tiempo y segmentación por secciones o rutas.</p>
        </div>
        <Link href="/admin/popovers" className="text-sm text-muted-foreground hover:underline">Volver</Link>
      </section>

      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setSaving(true)
          setMessage(null)
          try {
            const payload = {
              title: title.trim(),
              body: body.trim() || null,
              discount_code: discount.trim() || null,
              enabled,
              priority: Number(priority),
              start_at: startAt ? new Date(startAt).toISOString() : null,
              end_at: endAt ? new Date(endAt).toISOString() : null,
              sections: arrFromInput(sections),
              paths: arrFromInput(paths),
            }
            const headers: any = { "Content-Type": "application/json" }
            const token = localStorage.getItem("sb-access-token")
            if (token) headers.Authorization = `Bearer ${token}`
            const url = isEdit ? `/api/admin/popovers/${editingId}` : "/api/admin/popovers"
            const method = isEdit ? "PATCH" : "POST"
            const res = await fetch(url, { method, headers, body: JSON.stringify(payload) })
            const json = await res.json()
            if (!res.ok) throw new Error(json?.error || "Error")
            setMessage(isEdit ? "Actualizado" : "Creado")
            setTimeout(() => router.push("/admin/popovers"), 600)
          } catch (err: any) {
            setMessage(err.message)
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
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-sm">Código de descuento (opcional)</label>
            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="BUSY10" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Activo
          </label>
          <div className="grid gap-2">
            <label className="text-sm">Prioridad</label>
            <input type="number" className="rounded-md border bg-background px-3 py-2 text-sm" value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
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
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear popover"}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={async () => {
                if (!editingId) return
                if (!confirm("¿Eliminar popover?")) return
                setSaving(true)
                setMessage(null)
                try {
                  const headers: any = {}
                  const token = localStorage.getItem("sb-access-token")
                  if (token) headers.Authorization = `Bearer ${token}`
                  const res = await fetch(`/api/admin/popovers/${editingId}`, { method: "DELETE", headers })
                  const json = await res.json()
                  if (!res.ok) throw new Error(json?.error || "Error")
                  router.push("/admin/popovers")
                } catch (err: any) {
                  setMessage(err.message)
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
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </form>
    </div>
  )
}
