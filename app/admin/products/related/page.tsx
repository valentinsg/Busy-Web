"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function RelatedProductsAdminPage() {
  const { toast } = useToast()
  const [base, setBase] = useState<{ id: string; name: string } | null>(null)
  const [list, setList] = useState<Array<{ id: string; related_product_id: string; relation_type: string; weight: number; name?: string }>>([])
  const [loading, setLoading] = useState(false)

  const load = useMemo(
    () => async (product_id?: string) => {
      if (!product_id) return
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/related-products?product_id=${encodeURIComponent(product_id)}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || "Error")
        // fetch product names for the related ids
        const ids = (json.data || []).map((r: { related_product_id: string }) => r.related_product_id)
        const names: Record<string, string> = {}
        if (ids.length) {
          const pr = await fetch(`/api/admin/products/search?${new URLSearchParams({ q: "", limit: String(ids.length) }).toString()}`)
          const pj = await pr.json()
          if (pr.ok) {
            for (const p of pj.products || []) names[p.id] = p.name
          }
        }
        setList((json.data || []).map((r: { related_product_id: string }) => ({ ...r, name: names[r.related_product_id] })))
      } catch (e: unknown) {
        toast({ title: "Error al cargar relaciones", description: e?.toString() || String(e), variant: "destructive" })
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    if (base?.id) load(base.id)
  }, [base?.id, load])

  async function addRelation(rel: { related_product_id: string; relation_type: string; weight: number }) {
    if (!base?.id) return
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/related-products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: base.id, ...rel }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Error")
      toast({ title: "Relación creada" })
      await load(base.id)
    } catch (e: unknown) {
      toast({ title: "Error al crear relación", description: e?.toString() || String(e), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function removeRelation(id: string) {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/related-products?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Error")
      toast({ title: "Relación eliminada" })
      setList((arr) => arr.filter((r) => r.id !== id))
    } catch (e: unknown) {
      toast({ title: "Error al eliminar relación", description: e?.toString() || String(e), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Upsell / Cross-sell</h1>
          <p className="text-sm text-muted-foreground">Asociá productos relacionados para sugerencias en la tienda y emails.</p>
        </div>
        <Link href="/admin" className="text-sm text-primary underline-offset-2 hover:underline">Volver al panel</Link>
      </div>

      <section className="rounded border p-4 space-y-3">
        <div className="font-medium">Producto base</div>
        <ProductPicker onSelect={(p) => setBase(p)} />
        {base && (
          <div className="text-sm text-muted-foreground">Seleccionado: <span className="font-medium">{base.name}</span> <span className="text-xs">({base.id})</span></div>
        )}
      </section>

      {base && (
        <>
          <section className="rounded border p-4 space-y-3">
            <div className="font-medium">Agregar relación</div>
            <AddRelationForm onAdd={addRelation} disabled={loading} />
          </section>

          <section className="rounded border p-4 space-y-3">
            <div className="font-medium">Relaciones actuales</div>
            <div className="overflow-x-auto rounded border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-3 py-2">Relacionado</th>
                    <th className="text-left px-3 py-2">Tipo</th>
                    <th className="text-left px-3 py-2">Peso</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">{loading ? "Cargando..." : "Sin relaciones"}</td>
                    </tr>
                  )}
                  {list.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2">{r.name || r.related_product_id}</td>
                      <td className="px-3 py-2">{r.relation_type}</td>
                      <td className="px-3 py-2">{Number(r.weight).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => removeRelation(r.id)} className="text-sm text-red-600 hover:underline">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function ProductPicker({ onSelect }: { onSelect: (p: { id: string; name: string }) => void }) {
  const [q, setQ] = useState("")
  const [list, setList] = useState<Array<{ id: string; name: string }>>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/products/search?${new URLSearchParams({ q, limit: "10" }).toString()}`, { signal: ctrl.signal })
        const json = await res.json()
        if (res.ok) setList((json.products || []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })))
      } catch {}
    }, 200)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [q])

  return (
    <div className="relative max-w-xl">
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true) }} placeholder="Buscar producto base" className="w-full border rounded px-2 py-1 bg-background" />
      {open && list.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded border bg-background shadow">
          {list.map((p) => (
            <button key={p.id} type="button" onClick={() => { onSelect(p); setQ(p.name); setOpen(false) }} className="w-full text-left px-2 py-1 hover:bg-muted text-sm">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.id}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AddRelationForm({ onAdd, disabled }: { onAdd: (r: { related_product_id: string; relation_type: string; weight: number }) => void; disabled?: boolean }) {
  const [related, setRelated] = useState<{ id: string; name: string } | null>(null)
  const [type, setType] = useState("manual")
  const [weight, setWeight] = useState<number>(1)

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-3 gap-2 items-end">
        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground">Producto relacionado</label>
          <ProductPicker onSelect={(p) => setRelated(p)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded px-2 py-1 bg-background">
            <option value="upsell">upsell</option>
            <option value="cross_sell">cross_sell</option>
            <option value="accessory">accessory</option>
            <option value="manual">manual</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Peso</label>
          <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full border rounded px-2 py-1 bg-background" />
        </div>
        <div className="md:col-span-3">
          <button
            disabled={!related || disabled}
            onClick={() => related && onAdd({ related_product_id: related.id, relation_type: type, weight })}
            className="rounded bg-primary text-primary-foreground px-3 py-1 text-sm disabled:opacity-60"
          >
            Agregar relación
          </button>
        </div>
      </div>
    </div>
  )
}
