"use client"

import { AudienceSelector } from "@/components/admin/newsletter/audience-selector"
import { NewsletterImageUpload } from "@/components/admin/newsletter/image-upload"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { ArrowLeft, Calendar, ExternalLink, Eye, Mail, Save, Send, Type, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

export default function NewCampaignPage() {
  const { toast } = useToast()
  const router = useRouter()

  // Form state
  const [name, setName] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [content, setContent] = React.useState("")
  const [scheduledAt, setScheduledAt] = React.useState("")
  const [selected, setSelected] = React.useState<string[]>([])
  const [ctaText, setCtaText] = React.useState("")
  const [ctaUrl, setCtaUrl] = React.useState("")

  // UI state
  const [saving, setSaving] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [campaignId, setCampaignId] = React.useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = React.useState<string | null>(null)
  const [loadingPreview, setLoadingPreview] = React.useState(false)

  // Validation
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = "El nombre es requerido"
    if (!subject.trim()) newErrors.subject = "El asunto es requerido"
    if (!content.trim()) newErrors.content = "El contenido es requerido"
    if (selected.length === 0) newErrors.audience = "Selecciona al menos un destinatario"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const sendCampaign = async () => {
    if (!campaignId) {
      toast({ title: "Error", description: "Primero guarda la campaña como borrador" })
      return
    }
    if (selected.length === 0) {
      toast({ title: "Error", description: "No hay suscriptores seleccionados" })
      return
    }

    setSending(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")

      const res = await fetch(`/api/admin/newsletter/campaigns/${campaignId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      const json = await res.json()

      if (!res.ok || !json.ok) throw new Error(json.error || "Error al enviar campaña")

      toast({
        title: "¡Campaña enviada!",
        description: `Enviados: ${json.sent} | Fallidos: ${json.failed} | Total: ${json.total}`
      })
      router.push("/admin/newsletter/campaigns")
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : typeof e === 'object' ? JSON.stringify(e) : String(e)
      toast({ title: "Error al enviar", description: message })
    } finally {
      setSending(false)
    }
  }

  const openPreview = async () => {
    if (!content.trim()) {
      toast({ title: "Error", description: "Escribe algo de contenido primero" })
      return
    }
    setLoadingPreview(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")

      const res = await fetch("/api/admin/newsletter/campaigns/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, content, name, ctaText, ctaUrl }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error generando preview")
      setPreviewHtml(json.html)
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Error" })
    } finally {
      setLoadingPreview(false)
    }
  }

  const save = async () => {
    if (!validate()) {
      toast({ title: "Error", description: "Completa todos los campos requeridos" })
      return
    }

    setSaving(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")

      const body = {
        name,
        subject,
        content,
        target_status: ["subscribed"],
        target_tags: [],
        scheduled_at: scheduledAt || undefined,
        cta_text: ctaText || undefined,
        cta_url: ctaUrl || undefined,
      }

      const res = await fetch("/api/admin/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const json = await res.json()

      if (!res.ok || !json.ok) {
        const errMsg = typeof json.error === 'string' ? json.error : JSON.stringify(json.error)
        throw new Error(errMsg || "Error al crear campaña")
      }

      const id = json.item?.id
      if (id && selected.length > 0) {
        const res2 = await fetch(`/api/admin/newsletter/campaigns/${id}/save-audience`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ emails: selected }),
        })
        const j2 = await res2.json()
        if (!res2.ok || !j2.ok) {
          const errMsg2 = typeof j2.error === 'string' ? j2.error : JSON.stringify(j2.error)
          throw new Error(errMsg2 || "Error al guardar audiencia")
        }
        toast({ title: "Campaña creada", description: `${j2.saved} destinatarios guardados` })
      } else {
        toast({ title: "Campaña creada" })
      }

      setCampaignId(id)
      router.refresh()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : typeof e === 'object' ? JSON.stringify(e) : String(e)
      toast({ title: "Error", description: message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/newsletter/campaigns"
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Nueva campaña</h1>
          <p className="text-sm text-muted-foreground">Crea y envía una campaña de email</p>
        </div>
      </div>

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
                placeholder="Ej: Newsletter Diciembre 2024"
                className={`mt-1.5 w-full px-3 py-2 rounded-md border bg-background text-sm ${
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
                placeholder="Ej: 🔥 Nuevos drops esta semana"
                className={`mt-1.5 w-full px-3 py-2 rounded-md border bg-background text-sm ${
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
              <button type="button" className="px-2.5 py-1 text-xs border rounded-md hover:bg-muted" onClick={() => setContent(c => c + "**negrita** ")}>B</button>
              <button type="button" className="px-2.5 py-1 text-xs border rounded-md hover:bg-muted italic" onClick={() => setContent(c => c + "*itálica* ")}>I</button>
              <button type="button" className="px-2.5 py-1 text-xs border rounded-md hover:bg-muted" onClick={() => setContent(c => c + "\n## Título\n")}>H2</button>
              <button type="button" className="px-2.5 py-1 text-xs border rounded-md hover:bg-muted" onClick={() => setContent(c => c + "\n- Item\n")}>Lista</button>
              <button type="button" className="px-2.5 py-1 text-xs border rounded-md hover:bg-muted" onClick={() => setContent(c => c + "[texto](url)")}>Link</button>
              <div className="h-4 w-px bg-border mx-1" />
              <NewsletterImageUpload
                onImageUploaded={(_url: string, markdown: string) => {
                  setContent(c => c + "\n" + markdown + "\n")
                }}
              />
              <div className="h-4 w-px bg-border mx-1" />
              <button
                type="button"
                onClick={openPreview}
                disabled={loadingPreview || !content.trim()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded-md hover:bg-muted disabled:opacity-50"
              >
                <Eye className="h-3 w-3" />
                {loadingPreview ? "..." : "Preview"}
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setErrors(prev => ({ ...prev, content: "" })) }}
              rows={8}
              placeholder="Escribe el contenido en Markdown...\n\n## Título\n\nTexto del email..."
              className={`w-full px-3 py-2 rounded-md border bg-background font-mono text-sm resize-y ${
                errors.content ? "border-destructive" : ""
              }`}
            />
            {errors.content && <p className="text-xs text-destructive mt-1">{errors.content}</p>}
          </div>
        </div>

        {/* Call to Action */}
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ExternalLink className="h-4 w-4" />
            Botón de acción (opcional)
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Texto del botón</label>
              <input
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Ej: Ver productos, Comprar ahora"
                className="mt-1.5 w-full px-3 py-2 rounded-md border bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL del botón</label>
              <input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://busy.com.ar/products"
                className="mt-1.5 w-full px-3 py-2 rounded-md border bg-background text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Agrega un botón destacado en el email. Los clicks se trackean automáticamente.
          </p>
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
              className="w-full px-3 py-2 rounded-md border bg-background text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Deja vacío para enviar manualmente
            </p>
          </div>
        </div>

        {/* Audience */}
        <div className="space-y-2">
          <AudienceSelector
            selected={selected}
            onChange={(emails) => { setSelected(emails); setErrors(prev => ({ ...prev, audience: "" })) }}
          />
          {errors.audience && <p className="text-xs text-destructive">{errors.audience}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving || sending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 text-sm font-medium"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : campaignId ? "Actualizar borrador" : "Guardar borrador"}
          </button>

          {campaignId && (
            <button
              onClick={sendCampaign}
              disabled={sending || saving || selected.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
            >
              <Send className="h-4 w-4" />
              {sending ? "Enviando..." : `Enviar a ${selected.length}`}
            </button>
          )}

          <Link
            href="/admin/newsletter/campaigns"
            className="px-4 py-2 rounded-md border hover:bg-muted text-sm"
          >
            Cancelar
          </Link>
        </div>
      </div>

      {/* Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-background rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b">
              <span className="text-sm font-medium">Vista previa del email</span>
              <button
                onClick={() => setPreviewHtml(null)}
                className="p-1 rounded hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-60px)]">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-[600px] border-0"
                title="Email Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
