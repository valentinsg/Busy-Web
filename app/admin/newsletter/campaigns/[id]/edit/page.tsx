"use client"

import { TagPicker } from "@/components/ui/tag-picker"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import * as React from "react"

export default function EditCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params?.id as string

  const [name, setName] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [content, setContent] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const [scheduledAt, setScheduledAt] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [status, setStatus] = React.useState("draft")

  // Load campaign data
  React.useEffect(() => {
    async function load() {
      try {
        const { data: session } = await supabase.auth.getSession()
        const token = session.session?.access_token
        if (!token) throw new Error("No auth")

        const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        if (!res.ok || !json.ok) throw new Error(json.error || "Error")

        const c = json.item
        setName(c.name || "")
        setSubject(c.subject || "")
        setContent(c.content || "")
        setTags(c.target_tags || [])
        setStatus(c.status || "draft")
        if (c.scheduled_at) {
          // Convert to datetime-local format
          const date = new Date(c.scheduled_at)
          setScheduledAt(date.toISOString().slice(0, 16))
        }
      } catch (e) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "Error cargando campaña" })
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id, toast])

  const handleSave = async () => {
    if (!name.trim() || !subject.trim() || !content.trim()) {
      toast({ title: "Error", description: "Completa todos los campos requeridos" })
      return
    }

    setSaving(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth")

      const body = {
        name,
        subject,
        content,
        target_tags: tags,
        scheduled_at: scheduledAt || undefined,
      }

      const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error al guardar")

      toast({ title: "Campaña actualizada" })
      router.push(`/admin/newsletter/campaigns/${id}`)
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Error" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  const canEdit = status === 'draft'

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/newsletter/campaigns/${id}`} className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
          ← Volver a campaña
        </Link>
        <h2 className="font-heading text-2xl font-semibold">Editar campaña</h2>
      </div>

      {!canEdit && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
          ⚠️ Esta campaña ya fue enviada o está en proceso. No se puede editar.
        </div>
      )}

      <div className="rounded-lg border p-4 bg-muted/5 space-y-4">
        <label className="block text-sm font-body">
          Nombre de la campaña
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canEdit}
            className="mt-1 w-full border rounded px-3 py-2 bg-transparent font-body disabled:opacity-50"
          />
        </label>

        <label className="block text-sm font-body">
          Asunto del email
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={!canEdit}
            className="mt-1 w-full border rounded px-3 py-2 bg-transparent font-body disabled:opacity-50"
          />
        </label>

        <div>
          <label className="block text-sm mb-1 font-body">Contenido (Markdown)</label>
          <div className="flex flex-wrap gap-2 mb-2 text-xs">
            <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={!canEdit} onClick={() => setContent(c => c + "**negrita** ")}>B</button>
            <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={!canEdit} onClick={() => setContent(c => c + "*itálica* ")}><em>I</em></button>
            <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={!canEdit} onClick={() => setContent(c => c + "\n## Título\n\n")}>H2</button>
            <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={!canEdit} onClick={() => setContent(c => c + "\n- Elemento 1\n- Elemento 2\n")}>Lista</button>
            <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={!canEdit} onClick={() => setContent(c => c + "[enlace](https://)")}>Link</button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!canEdit}
            rows={12}
            className="w-full border rounded px-3 py-2 bg-transparent font-mono text-sm disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-body">
            Programar envío (opcional)
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              disabled={!canEdit}
              className="mt-1 w-full border rounded px-3 py-2 bg-transparent font-body disabled:opacity-50"
            />
          </label>

          <div>
            <label className="block text-sm font-body mb-1">Filtrar por tags</label>
            {canEdit ? (
              <TagPicker value={tags} onChange={setTags} />
            ) : (
              <div className="text-sm text-muted-foreground">{tags.length ? tags.join(', ') : 'Sin tags'}</div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving || !canEdit}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <Link
            href={`/admin/newsletter/campaigns/${id}`}
            className="px-4 py-2 rounded-md border hover:bg-muted"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  )
}
