"use client"

import { Menu } from "@/components/ui/menu"
import { SimpleSelect } from "@/components/ui/simple-select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import type { Subscriber } from "@/types"
import * as React from "react"

export default function NewsletterAdminPage() {
  const { toast } = useToast()
  const [items, setItems] = React.useState<Subscriber[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [newEmail, setNewEmail] = React.useState("")
  const [adding, setAdding] = React.useState(false)
  const [q, setQ] = React.useState("")
  const [status, setStatus] = React.useState<string>("")
  const [tag, setTag] = React.useState<string>("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)
  const [total, setTotal] = React.useState(0)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (status) params.set("status", status)
      if (tag) params.set("tag", tag)
      params.set("page", String(page))
      params.set("pageSize", String(pageSize))
      const res = await fetch(`/api/admin/newsletter?${params.toString()}` , {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error")
      setItems(json.items || [])
      setTotal(Number(json.total || 0))
    } catch (e: unknown) {
      setError(e?.toString() || String(e))
    } finally {
      setLoading(false)
    }
  }, [q, status, tag, page, pageSize])

  React.useEffect(() => { load() }, [load])

  const removeEmail = async (email: string) => {
    if (!confirm(`¿Eliminar ${email}?`)) return
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")
      const res = await fetch(`/api/admin/newsletter?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error")
      setItems((prev) => prev.filter((it) => it.email !== email))
      toast({ title: "Eliminado", description: `${email} fue eliminado.` })
    } catch (e: unknown) {
      toast({ title: "Error", description: e?.toString() || String(e) })
    }
  }

  const addEmail = async () => {
    const email = newEmail.trim()
    if (!email) return
    // Validación simple
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Email inválido", description: "Revisa el formato." })
      return
    }
    setAdding(true)
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error al agregar")
      setItems((prev) => [{ email, created_at: new Date().toISOString(), status: "pending", tags: [] }, ...prev.filter(i=>i.email!==email)])
      setNewEmail("")
      toast({ title: "Agregado", description: `${email} suscripto.` })
    } catch (e: unknown) {
      toast({ title: "Error", description: e?.toString() || String(e) })
    } finally {
      setAdding(false)
    }
  }

  const copyAll = async (delimiter: "," | ";" | "\n" = ",") => {
    const text = items.map((i)=>i.email).join(delimiter)
    await navigator.clipboard.writeText(text)
    toast({ title: "Copiado", description: `Se copiaron ${items.length} emails.` })
  }

  const exportCsv = () => {
    const header = "email,created_at\n"
    const rows = items.map((i)=>`${i.email},${i.created_at}`).join("\n")
    const csv = header + rows
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `newsletter_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6 rounded-lg border border-border/40 p-4 bg-muted/5">
        <div>
          <h2 className="font-heading text-2xl font-semibold">Newsletter</h2>
          <p className="text-muted-foreground text-base">Gestiona suscriptores: agregar, copiar, exportar.</p>
        </div>
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm mb-1">Buscar email</label>
            <input value={q} onChange={(e)=>{ setPage(1); setQ(e.target.value) }} placeholder="email@" className="border border-border/40 rounded px-3 py-2 bg-transparent min-w-[220px]" />
          </div>
          <div className="min-w-[160px]">
            <label className="block text-sm mb-1">Estado</label>
            <SimpleSelect
              value={status}
              onChange={(v)=>{ setPage(1); setStatus(v) }}
              options={[
                { label: "Todos", value: "" },
                { label: "Pending", value: "pending" },
                { label: "Subscribed", value: "subscribed" },
                { label: "Unsubscribed", value: "unsubscribed" },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Tag</label>
            <input value={tag} onChange={(e)=>{ setPage(1); setTag(e.target.value) }} placeholder="ej: vip" className="border border-border/40 rounded px-3 py-2 bg-transparent min-w-[140px]" />
          </div>
          <Menu
            buttonLabel="⋯"
            items={[
              { label: "Copiar emails separados por coma (,)", onClick: ()=>copyAll(",") },
              { label: "Copiar emails separados por ;", onClick: ()=>copyAll(";") },
              { label: "Copiar emails en líneas", onClick: ()=>copyAll("\n") },
              { label: "Exportar CSV", onClick: exportCsv },
            ]}
          />
        </div>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">Sin suscriptores.</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total: {total}</p>
          </div>
          <div className="grid gap-3">
            {items.map((s:Subscriber) => (
              <div key={s.email} className="rounded-lg border border-border/40 bg-muted/5 hover:bg-muted/10 transition-colors">
                <Row s={s} onRemove={removeEmail} />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-2">
            <div className="flex items-center gap-2 text-sm rounded-md border border-border/40 px-3 py-2 bg-muted/5">
              <button disabled={page<=1} onClick={()=> setPage(p=>Math.max(1,p-1))} className="rounded px-3 py-1 hover:bg-accent hover:text-accent-foreground disabled:opacity-50">Anterior</button>
              <span className="text-muted-foreground">Página {page}</span>
              <button disabled={(page*pageSize)>=total} onClick={()=> setPage(p=>p+1)} className="rounded px-3 py-1 hover:bg-accent hover:text-accent-foreground disabled:opacity-50">Siguiente</button>
              <div className="min-w-[100px]">
                <SimpleSelect
                  value={String(pageSize)}
                  onChange={(v)=>{ setPage(1); setPageSize(Number(v)) }}
                  options={[
                    { label: "10", value: "10" },
                    { label: "20", value: "20" },
                    { label: "50", value: "50" },
                  ]}
                />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border/40 p-4 bg-muted/5 mt-4">
            <h3 className="font-heading font-medium mb-2">Agregar suscriptor</h3>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                value={newEmail}
                onChange={(e)=>setNewEmail(e.target.value)}
                placeholder="email@dominio.com"
                className="border border-border/40 rounded px-3 py-2 bg-transparent min-w-[260px] flex-1"
              />
              <button onClick={addEmail} disabled={adding} className="rounded px-3 py-2 bg-black text-white disabled:opacity-60 w-full md:w-auto">
                {adding? "Agregando..." : "Agregar"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Se enviará confirmación (opt‑in) al suscriptor.</p>
          </div>
        </>
      )}
    </div>
  )
}

function Row({ s, onRemove }: { s: Subscriber; onRemove: (email:string)=>void }) {
  const { toast } = useToast()
  // Editable values
  const [status, setStatus] = React.useState<string>(s.status || "pending")
  const [tags, setTags] = React.useState<string>((s.tags||[]).join(", "))
  // Baseline values to compute dirtiness; update after successful save
  const [baseStatus, setBaseStatus] = React.useState<string>(s.status || "pending")
  const [baseTags, setBaseTags] = React.useState<string>((s.tags||[]).join(", "))
  const [saving, setSaving] = React.useState(false)
  const dirty = status !== baseStatus || tags !== baseTags

  // Keep local state in sync if parent updates the row (e.g., pagination reload)
  React.useEffect(() => {
    const nextStatus = s.status || "pending"
    const nextTags = (s.tags||[]).join(", ")
    setStatus(nextStatus)
    setTags(nextTags)
    setBaseStatus(nextStatus)
    setBaseTags(nextTags)
  }, [s.email, s.status, s.tags])

  const save = async () => {
    setSaving(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")
      const body = { email: s.email, status, tags: tags.split(",").map((t:string)=>t.trim()).filter(Boolean) }
      const res = await fetch("/api/admin/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error al guardar")
      toast({ title: "Guardado", description: "Suscriptor actualizado" })
      // Update baseline so the Save button hides
      setBaseStatus(status)
      setBaseTags(tags)
    } catch (e:unknown) {
      toast({ title: "Error", description: e?.toString() || String(e) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 text-base items-center">
      <div className="md:col-span-2">
        <p className="font-medium">{s.email}</p>
        <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</p>
      </div>
      <div>
        <label className="text-xs block mb-1">Estado</label>
        <SimpleSelect
          value={status}
          onChange={setStatus}
          options={[
            { label: "Pending", value: "pending" },
            { label: "Subscribed", value: "subscribed" },
            { label: "Unsubscribed", value: "unsubscribed" },
          ]}
          className="w-full"
        />
      </div>
      <div>
        <label className="text-xs block mb-1">Tags (coma)</label>
        <input value={tags} onChange={(e)=>setTags(e.target.value)} className="border rounded px-2 py-1 bg-transparent w-full" />
      </div>
      <div className="flex items-center justify-end gap-2">
        {dirty && (
          <button onClick={save} disabled={saving} className="rounded px-3 py-1 bg-black text-white disabled:opacity-60">{saving?"Guardando...":"Guardar"}</button>
        )}
        <Menu
          buttonLabel="⋯"
          items={[
            { label: "Copiar email", onClick: ()=> { navigator.clipboard.writeText(s.email); toast({ title: "Copiado" }) } },
            { label: "Eliminar", onClick: ()=> onRemove(s.email) },
          ]}
        />
      </div>
    </div>
  )
}
