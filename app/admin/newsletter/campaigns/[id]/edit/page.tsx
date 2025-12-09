"use client"

import { AudienceSelector } from "@/components/admin/newsletter/audience-selector"
import { NewsletterImageUpload } from "@/components/admin/newsletter/image-upload"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { AlertTriangle, ArrowLeft, Calendar, Mail, Save, Type } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import * as React from "react"

export default function EditCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params?.id as string

  // Form state
  const [name, setName] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [content, setContent] = React.useState("")
  const [scheduledAt, setScheduledAt] = React.useState("")
  const [selectedEmails, setSelectedEmails] = React.useState<string[]>([])

  // UI state
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [status, setStatus] = React.useState("draft")

  // Validation
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = "El nombre es requerido"
    if (!subject.trim()) newErrors.subject = "El asunto es requerido"
    if (!content.trim()) newErrors.content = "El contenido es requerido"
    if (selectedEmails.length === 0) newErrors.audience = "Selecciona al menos un destinatario"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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
        setStatus(c.status || "draft")
        if (c.scheduled_at) {
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
            setSelectedEmails(emails)
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
    if (!validate()) {
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
        target_tags: [],
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

      // Save audience
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
        toast({ title: "Campaña actualizada", description: `${json2.saved} destinatarios guardados` })
      } else {
        toast({ title: "Campaña actualizada" })
      }

      router.push(`/admin/newsletter/campaigns/${id}`)
      router.refresh()
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Error" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  const canEdit = status === 'draft'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/newsletter/campaigns/${id}`}
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Editar campaña</h1>
          <p className="text-sm text-muted-foreground">Modifica los detalles de la campaña</p>
        </div>
      </div>

      {!canEdit && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">Esta campaña ya fue enviada o está en proceso. No se puede editar.</p>
        </div>
      )}

      <div className="grid gap-6">
        {/* Basic Info */}
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Type className="h-4 w-4" />
            Información básica
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">
                Nombre de la campaña <span className="text-destructive">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: "" })) }}
                disabled={!canEdit}
                placeholder="Ej: Newsletter Diciembre 2024"
                className={`mt-1.5 w-full px-3 py-2 rounded-md border bg-background text-sm disabled:opacity-50 ${
                  errors.name ? "border-destructive" : ""
                }`}
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">
                Asunto del email <span className="text-destructive">*</span>
              </label>
              <input
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setErrors(prev => ({ ...prev, subject: "" })) }}
                disabled={!canEdit}
                placeholder="Ej: 🔥 Nuevos drops esta semana"
                className={`mt-1.5 w-full px-3 py-2 rounded-md border bg-background text-sm disabled:opacity-50 ${
                  errors.subject ? "border-destructive" : ""
                }`}
              />
              {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Mail className="h-4 w-4" />
            Contenido del email
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <button type="button" disabled={!canEdit} className="px-2.5 py-1 text-xs border rounded-md hover:bg-muted disabled:opacity-50" onClick={() => setContent(c => c + "**negrita** ")}>B</button>
              <button type="button" disabled={!canEdit} className="px-2.5 py-1 text-xs border rounded-md hover:bg-muted italic disabled:opacity-50" onClick={() => setContent(c => c + "*itálica* ")}>I</button>
              <button type="button" disabled={!canEdit} className="px-2.5 py-1 text-xs border rounded-md hover:bg-muted disabled:opacity-50" onClick={() => setContent(c => c + "\n## Título\n")}>H2</button>
              <button type="button" disabled={!canEdit} className="px-2.5 py-1 text-xs border rounded-md hover:bg-muted disabled:opacity-50" onClick={() => setContent(c => c + "\n- Item\n")}>Lista</button>
              <button type="button" disabled={!canEdit} className="px-2.5 py-1 text-xs border rounded-md hover:bg-muted disabled:opacity-50" onClick={() => setContent(c => c + "[texto](url)")}>Link</button>
              <div className="h-4 w-px bg-border mx-1" />
              <NewsletterImageUpload
                disabled={!canEdit}
                onImageUploaded={(_url: string, markdown: string) => {
                  setContent(c => c + "\n" + markdown + "\n")
                }}
              />
            </div>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setErrors(prev => ({ ...prev, content: "" })) }}
              disabled={!canEdit}
              rows={8}
              placeholder="Escribe el contenido en Markdown..."
              className={`w-full px-3 py-2 rounded-md border bg-background font-mono text-sm resize-y disabled:opacity-50 ${
                errors.content ? "border-destructive" : ""
              }`}
            />
            {errors.content && <p className="text-xs text-destructive mt-1">{errors.content}</p>}
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Programación (opcional)
          </div>

          <div className="max-w-xs">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Deja vacío para enviar manualmente
            </p>
          </div>
        </div>

        {/* Audience */}
        <div className="space-y-2">
          <AudienceSelector
            selected={selectedEmails}
            onChange={(emails) => { setSelectedEmails(emails); setErrors(prev => ({ ...prev, audience: "" })) }}
            disabled={!canEdit}
          />
          {errors.audience && <p className="text-xs text-destructive">{errors.audience}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !canEdit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 text-sm font-medium"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : `Guardar cambios`}
          </button>

          <Link
            href={`/admin/newsletter/campaigns/${id}`}
            className="px-4 py-2 rounded-md border hover:bg-muted text-sm"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  )
}
