"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import * as React from "react"

interface Campaign {
  id: string
  name: string
  subject: string
  content: string
  status: string
  target_status: string[]
  target_tags: string[]
  scheduled_at: string | null
  sent_count: number
  error: string | null
  created_at: string
  updated_at: string
}

interface Recipient {
  email: string
  status: string
  created_at: string
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params?.id as string

  const [campaign, setCampaign] = React.useState<Campaign | null>(null)
  const [recipients, setRecipients] = React.useState<Recipient[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sending, setSending] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  // Fetch campaign data
  React.useEffect(() => {
    async function load() {
      try {
        const { data: session } = await supabase.auth.getSession()
        const token = session.session?.access_token
        if (!token) throw new Error("No auth")

        // Get campaign
        const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        if (!res.ok || !json.ok) throw new Error(json.error || "Error")
        setCampaign(json.item)

        // Get recipients
        const res2 = await fetch(`/api/admin/newsletter/campaigns/${id}/recipients`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res2.ok) {
          const json2 = await res2.json()
          if (json2.ok) setRecipients(json2.items || [])
        }
      } catch (e) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "Error cargando campaña" })
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id, toast])

  const handleSend = async () => {
    if (!campaign || campaign.status === 'sent' || campaign.status === 'sending') return

    setSending(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token

      const res = await fetch(`/api/admin/newsletter/campaigns/${id}/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()

      if (!res.ok || !json.ok) {
        const errorMsg = typeof json.error === 'string'
          ? json.error
          : JSON.stringify(json.error) || "Error al enviar"
        throw new Error(errorMsg)
      }

      toast({
        title: "¡Campaña enviada!",
        description: `Enviados: ${json.sent} | Fallidos: ${json.failed}`
      })

      // Refresh data
      setCampaign(prev => prev ? { ...prev, status: json.status, sent_count: json.sent } : null)
    } catch (e) {
      const message = e instanceof Error ? e.message : typeof e === 'object' ? JSON.stringify(e) : String(e)
      toast({ title: "Error", description: message })
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token

      const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Error al eliminar")

      toast({ title: "Campaña eliminada" })
      router.push("/admin/newsletter/campaigns")
      router.refresh() // Force refresh the server component list
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Error" })
      setDeleting(false)
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

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Campaña no encontrada</p>
        <Link href="/admin/newsletter/campaigns" className="text-sm underline mt-2 inline-block">
          Volver a campañas
        </Link>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-zinc-500/10 text-zinc-300 border-zinc-600/40',
    scheduled: 'bg-yellow-500/10 text-yellow-400 border-yellow-600/40',
    sending: 'bg-blue-500/10 text-blue-400 border-blue-600/40',
    sent: 'bg-green-500/10 text-green-400 border-green-600/40',
    failed: 'bg-red-500/10 text-red-400 border-red-600/40',
  }

  const readyCount = recipients.filter(r => r.status === 'ready').length
  const sentRecipients = recipients.filter(r => r.status === 'sent').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/newsletter/campaigns" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
            ← Volver a campañas
          </Link>
          <h2 className="font-heading text-2xl font-semibold">{campaign.name}</h2>
          <p className="text-muted-foreground">{campaign.subject}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm border ${statusColors[campaign.status] || statusColors.draft}`}>
          {campaign.status}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4 bg-muted/5">
          <div className="text-2xl font-bold">{recipients.length}</div>
          <div className="text-xs text-muted-foreground">Audiencia total</div>
        </div>
        <div className="rounded-lg border p-4 bg-muted/5">
          <div className="text-2xl font-bold text-emerald-400">{campaign.sent_count}</div>
          <div className="text-xs text-muted-foreground">Enviados</div>
        </div>
        <div className="rounded-lg border p-4 bg-muted/5">
          <div className="text-2xl font-bold text-blue-400">{readyCount}</div>
          <div className="text-xs text-muted-foreground">Pendientes</div>
        </div>
        <div className="rounded-lg border p-4 bg-muted/5">
          <div className="text-2xl font-bold">
            {campaign.sent_count > 0 ? `${((sentRecipients / recipients.length) * 100).toFixed(0)}%` : '-'}
          </div>
          <div className="text-xs text-muted-foreground">Tasa de entrega</div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Content Preview */}
        <div className="rounded-lg border p-4 bg-muted/5 space-y-4">
          <h3 className="font-heading font-medium">Contenido</h3>
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap bg-background/50 rounded p-4 max-h-96 overflow-auto">
            {campaign.content}
          </div>

          <div className="pt-4 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creado:</span>
              <span>{new Date(campaign.created_at).toLocaleString()}</span>
            </div>
            {campaign.scheduled_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Programado:</span>
                <span>{new Date(campaign.scheduled_at).toLocaleString()}</span>
              </div>
            )}
            {campaign.target_tags.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tags:</span>
                <span>{campaign.target_tags.join(', ')}</span>
              </div>
            )}
            {campaign.error && (
              <div className="mt-2 p-2 rounded bg-red-500/10 text-red-400 text-xs">
                Error: {campaign.error}
              </div>
            )}
          </div>
        </div>

        {/* Right: Recipients */}
        <div className="rounded-lg border p-4 bg-muted/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-medium">Destinatarios ({recipients.length})</h3>
          </div>

          {recipients.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No hay destinatarios guardados para esta campaña.</p>
          ) : (
            <div className="max-h-80 overflow-auto rounded border divide-y">
              {recipients.slice(0, 50).map((r) => (
                <div key={r.email} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="truncate">{r.email}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' :
                    r.status === 'ready' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
              {recipients.length > 50 && (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                  ... y {recipients.length - 50} más
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        {campaign.status === 'draft' && (
          <>
            <Link
              href={`/admin/newsletter/campaigns/${id}/edit`}
              className="px-4 py-2 rounded-md border hover:bg-muted transition-colors"
            >
              Editar
            </Link>
            <button
              onClick={handleSend}
              disabled={sending || recipients.length === 0}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {sending ? 'Enviando...' : `Enviar a ${recipients.length} suscriptores`}
            </button>
          </>
        )}

        {campaign.status === 'sent' && (
          <span className="text-sm text-muted-foreground">
            ✓ Campaña enviada el {new Date(campaign.updated_at).toLocaleString()}
          </span>
        )}

        <div className="flex-1" />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="px-4 py-2 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
              Eliminar
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar campaña?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará la campaña y todos sus datos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
