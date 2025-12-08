"use client"

import { Menu } from "@/components/ui/menu"
import { TagPicker } from "@/components/ui/tag-picker"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import * as React from "react"

export default function NewCampaignPage() {
  const { toast } = useToast()
  const [name, setName] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [content, setContent] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const [scheduledAt, setScheduledAt] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [campaignId, setCampaignId] = React.useState<string | null>(null)
  // Audience builder
  const [csvName, setCsvName] = React.useState<string>("")
  const [listLoading, setListLoading] = React.useState(false)
  const [allAllowed, setAllAllowed] = React.useState<string[]>([])
  const [selected, setSelected] = React.useState<string[]>([])
  const [listQuery, setListQuery] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : typeof e === 'object' ? JSON.stringify(e) : String(e)
      toast({ title: "Error al enviar", description: message })
    } finally {
      setSending(false)
    }
  }

  const save = async () => {
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
        target_tags: tags,
        scheduled_at: scheduledAt || undefined,
      }
      const res = await fetch("/api/admin/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error al crear campaña")
      // Guardar audiencia seleccionada
      const id = json.item?.id
      if (id && selected.length) {
        const res2 = await fetch(`/api/admin/newsletter/campaigns/${id}/save-audience`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ emails: selected, status: ["subscribed"], tags }),
        })
        const j2 = await res2.json()
        if (!res2.ok || !j2.ok) throw new Error(j2.error || "Error al guardar audiencia")
        toast({ title: "Campaña creada", description: `Audiencia guardada (${j2.saved})` })
        setCampaignId(id)
      } else {
        toast({ title: "Campaña creada", description: json.item?.name || "" })
        setCampaignId(json.item?.id)
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : typeof e === 'object' ? JSON.stringify(e) : String(e)
      toast({ title: "Error", description: message })
    } finally {
      setSaving(false)
    }
  }

  const onCsv = async (file: File) => {
    const text = await file.text()
    setCsvName(file.name)
    // Validar y filtrar por suscritos automáticamente
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      const incoming = Array.from(new Set(text.split(/[,;\n]+/).map(s=>s.trim().toLowerCase()).filter(Boolean)))
      const res = await fetch("/api/admin/newsletter/validate-target", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emails: incoming, status: ["subscribed"], tags }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "CSV inválido")
      if (json.result.not_subscribed.length || json.result.invalid.length) {
        toast({ title: "Algunos correos no son válidos o no están suscritos", description: `${json.result.not_subscribed.length} no suscritos, ${json.result.invalid.length} inválidos`, })
      }
      const merged = Array.from(new Set([...
        selected,
        ...(json.result.allowed as string[]),
      ]))
      setSelected(merged)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : typeof e === 'object' ? JSON.stringify(e) : String(e)
      toast({ title: "Error al procesar CSV", description: message })
    }
  }

  // Cargar lista permitida (suscritos) por tags
  React.useEffect(() => {
    let cancelled = false
    async function run() {
      setListLoading(true)
      try {
        const { data: session } = await supabase.auth.getSession()
        const token = session.session?.access_token
        if (!token) throw new Error("No auth token")
        const body = { emails: [], status: ["subscribed"], tags }
        const res = await fetch("/api/admin/newsletter/validate-target", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        })
        const json = await res.json()
        if (!cancelled && res.ok && json.ok) {
          const list = (json.result?.allowed as string[]) || []
          list.sort()
          setAllAllowed(list)
          // Si el usuario no ha seleccionado nada, preselecciona todos.
          setSelected(sel => sel.length ? sel.filter(e=>list.includes(e)) : list)
        }
      } catch {
        if (!cancelled) { setAllAllowed([]); setSelected([]) }
      } finally {
        if (!cancelled) setListLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [tags])

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-semibold">Nueva campaña</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Editor */}
        <div className="rounded-lg border p-4 bg-muted/5 space-y-4">
          <label className="block text-sm font-body">Nombre
            <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 bg-transparent font-body" />
          </label>
          <label className="block text-sm font-body">Asunto
            <input value={subject} onChange={(e)=>setSubject(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 bg-transparent font-body" />
          </label>
          <div>
            <label className="block text-sm mb-1 font-body">Contenido (Markdown)</label>
            <div className="flex flex-wrap gap-2 mb-2 text-xs">
              <button className="px-2 py-1 border rounded" onClick={()=>setContent(c=>c+"**negrita** ")}>B</button>
              <button className="px-2 py-1 border rounded" onClick={()=>setContent(c=>c+"*itálica* ")}><em>I</em></button>
              <button className="px-2 py-1 border rounded" onClick={()=>setContent(c=>c+"\n## Título\n\n")}>H2</button>
              <button className="px-2 py-1 border rounded" onClick={()=>setContent(c=>c+"\n- Elemento 1\n- Elemento 2\n")}>Lista</button>
              <button className="px-2 py-1 border rounded" onClick={()=>setContent(c=>c+"[enlace](https://)")}>Link</button>
            </div>
            <textarea value={content} onChange={(e)=>setContent(e.target.value)} rows={10} className="w-full border rounded px-3 py-2 bg-transparent font-mono text-sm" placeholder={"## Hola\n\nTexto de la campaña..."} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block text-sm font-body">Programar (opcional)
              <input type="datetime-local" value={scheduledAt} onChange={(e)=>setScheduledAt(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 bg-transparent font-body" />
            </label>
          </div>
          <div className="rounded-md border p-3 bg-muted/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-medium">Audiencia</h3>
                {tags.length > 0 && (
                  <span className="text-[10px] leading-none rounded-full px-2 py-1 bg-accent/30 text-accent-foreground">{tags.length} tag(s)</span>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="Ayuda" className="inline-flex items-center justify-center h-6 w-6 rounded-full border text-xs opacity-80 hover:opacity-100">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.75 15.5h-1.5v-1.5h1.5v1.5zM12 6a3.5 3.5 0 00-3.5 3.5h1.5a2 2 0 114 0c0 1.25-1 1.75-1.78 2.16-.72.38-1.22.64-1.22 1.34V14h1.5v-.55c0-.27.23-.4.93-.77C13.3 12.2 14.5 11.5 14.5 9.5 14.5 7.57 13 6 12 6z"/></svg>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Solo se incluirán suscriptores activos (subscribed). Puedes filtrar por tags, cargar CSV y seleccionar manualmente.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <Menu
                  items={[
                    { label: "Cargar CSV", onClick: ()=>fileInputRef.current?.click() },
                    { label: "Limpiar selección", onClick: ()=>{ setSelected([]); setCsvName(""); setTags([]) } },
                  ]}
                  ariaLabel="Acciones de audiencia"
                />
                <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) onCsv(f) }} className="hidden" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <TagPicker value={tags} onChange={setTags} />
              {csvName && <p className="text-xs text-muted-foreground">CSV: {csvName}</p>}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input className="flex-1 border rounded px-2 py-1 bg-transparent text-sm" placeholder="Buscar email en la lista…" value={listQuery} onChange={(e)=>setListQuery(e.target.value)} />
              <span className={`text-xs rounded-full px-2 py-1 border ${selected.length ? 'bg-emerald-500/10 text-emerald-400 border-emerald-600/40' : 'bg-zinc-500/10 text-zinc-300 border-zinc-600/40'}`}>{selected.length}/{allAllowed.length}</span>
            </div>
            <div className="max-h-64 overflow-auto rounded border">
              {listLoading ? (
                <div className="p-3 text-xs text-muted-foreground animate-pulse">Cargando lista…</div>
              ) : allAllowed.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground">Sin suscriptores para los filtros actuales.</div>
              ) : (
                <ul className="divide-y divide-border/40 text-sm">
                  {allAllowed
                    .filter(e => !listQuery || e.includes(listQuery.toLowerCase()))
                    .map(email => (
                    <li key={email} className="flex items-center gap-2 px-3 py-2">
                      <input type="checkbox" checked={selected.includes(email)} onChange={(e)=>{
                        setSelected(prev => e.target.checked ? [...prev, email] : prev.filter(x=>x!==email))
                      }} />
                      <span className="font-body">{email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={save} disabled={saving || sending} className="border rounded px-4 py-2 bg-primary text-primary-foreground disabled:opacity-60">
              {saving ? "Guardando..." : campaignId ? "Actualizar borrador" : "Guardar borrador"}
            </button>
            {campaignId && (
              <button
                onClick={sendCampaign}
                disabled={sending || saving}
                className="border rounded px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {sending ? "Enviando..." : `Enviar a ${selected.length} suscriptores`}
              </button>
            )}
            <a href="/admin/newsletter/campaigns" className="border rounded px-4 py-2">Volver</a>
          </div>
        </div>
        {/* Right: Live Preview */}
        <div className="rounded-lg border p-4 bg-muted/5 sticky top-24">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading font-medium">Previsualización</h3>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border ${scheduledAt ? 'bg-yellow-500/10 text-yellow-400 border-yellow-600/40' : 'bg-zinc-500/10 text-zinc-300 border-zinc-600/40'}`}>
              {scheduledAt ? 'Programada' : 'Borrador'}
            </span>
          </div>
          <div className="mb-2 space-y-1">
            <p className="text-sm"><span className="text-muted-foreground">Asunto:</span> <span className="font-body">{subject || "(sin asunto)"}</span></p>
            <p className="text-sm"><span className="text-muted-foreground">Nombre de campaña:</span> <span className="font-body">{name || "(sin nombre)"}</span></p>
            <p className="text-xs text-muted-foreground">Tags: {tags.length ? tags.join(", ") : "ninguno"}</p>
          </div>
          <div className="prose prose-invert whitespace-pre-wrap text-sm font-body min-h-[200px] border rounded p-3 bg-background/40">
            {content || "(Empieza a escribir para previsualizar...)"}
          </div>
        </div>
      </div>
    </div>
  )
}
