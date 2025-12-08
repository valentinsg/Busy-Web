"use client"

import { NewsletterImageUpload } from "@/components/admin/newsletter/image-upload"
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

  // Audience
  const [allSubscribers, setAllSubscribers] = React.useState<string[]>([])
  const [selectedEmails, setSelectedEmails] = React.useState<string[]>([])
  const [currentRecipients, setCurrentRecipients] = React.useState<string[]>([])
  const [listQuery, setListQuery] = React.useState("")

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

        // Load current recipients
        const res2 = await fetch(`/api/admin/newsletter/campaigns/${id}/recipients`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res2.ok) {
          const json2 = await res2.json()
          if (json2.ok && json2.items) {
            const emails = json2.items.map((r: { email: string }) => r.email)
            setCurrentRecipients(emails)
            setSelectedEmails(emails)
          }
        }

        // Load all subscribers
        const res3 = await fetch(`/api/admin/newsletter/validate-target`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: ["subscribed"], tags: [] })
        })
        if (res3.ok) {
          const json3 = await res3.json()
          if (json3.ok && json3.emails) {
            setAllSubscribers(json3.emails)
          }
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
      if (!res.ok || !json.ok) {
        const errMsg = typeof json.error === 'string' ? json.error : JSON.stringify(json.error)
        throw new Error(errMsg || "Error al guardar")
      }

      // Save audience if changed
      if (selectedEmails.length > 0) {
        const res2 = await fetch(`/api/admin/newsletter/campaigns/${id}/save-audience`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ emails: selectedEmails })
        })
        const json2 = await res2.json()
        if (!res2.ok || !json2.ok) {
          const errMsg2 = typeof json2.error === 'string' ? json2.error : JSON.stringify(json2.error)
          throw new Error(errMsg2 || "Error al guardar audiencia")
        }
        toast({ title: "Campaña actualizada", description: `Audiencia: ${json2.saved} destinatarios` })
      } else {
        toast({ title: "Campaña actualizada" })
      }

      router.push(`/admin/newsletter/campaigns/${id}`)
      router.refresh() // Refresh the campaigns list cache
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
          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
            <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={!canEdit} onClick={() => setContent(c => c + "**negrita** ")}>B</button>
            <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={!canEdit} onClick={() => setContent(c => c + "*itálica* ")}><em>I</em></button>
            <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={!canEdit} onClick={() => setContent(c => c + "\n## Título\n\n")}>H2</button>
            <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={!canEdit} onClick={() => setContent(c => c + "\n- Elemento 1\n- Elemento 2\n")}>Lista</button>
            <button className="px-2 py-1 border rounded disabled:opacity-50" disabled={!canEdit} onClick={() => setContent(c => c + "[enlace](https://)")}>Link</button>
            <div className="border-l pl-2 ml-2">
              <NewsletterImageUpload
                disabled={!canEdit}
                onImageUploaded={(_url: string, markdown: string) => {
                  setContent(c => c + "\n" + markdown + "\n")
                }}
              />
            </div>
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

        {/* Audience Selector */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-body font-medium">
              Audiencia ({selectedEmails.length} seleccionados)
            </label>
            {canEdit && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEmails(allSubscribers)}
                  className="text-xs px-2 py-1 border rounded hover:bg-muted"
                >
                  Seleccionar todos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEmails([])}
                  className="text-xs px-2 py-1 border rounded hover:bg-muted"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <input
              type="text"
              placeholder="Buscar email..."
              value={listQuery}
              onChange={(e) => setListQuery(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-transparent font-body text-sm mb-2"
            />
          )}

          <div className="max-h-48 overflow-auto rounded border divide-y">
            {allSubscribers.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">No hay suscriptores</div>
            ) : (
              allSubscribers
                .filter(email => !listQuery || email.toLowerCase().includes(listQuery.toLowerCase()))
                .slice(0, 100)
                .map(email => (
                  <label key={email} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(email)}
                      disabled={!canEdit}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmails(prev => [...prev, email])
                        } else {
                          setSelectedEmails(prev => prev.filter(x => x !== email))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm font-body">{email}</span>
                    {currentRecipients.includes(email) && (
                      <span className="text-xs text-emerald-400 ml-auto">guardado</span>
                    )}
                  </label>
                ))
            )}
          </div>
          {allSubscribers.length > 100 && (
            <p className="text-xs text-muted-foreground mt-1">
              Mostrando 100 de {allSubscribers.length}. Usa el buscador para filtrar.
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving || !canEdit}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Guardando..." : `Guardar (${selectedEmails.length} destinatarios)`}
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
