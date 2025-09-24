"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function SupplierPurchasesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // suppliers
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([])
  const [supplierId, setSupplierId] = useState<string>("")

  // list
  type PurchaseRow = { id: string; placed_at?: string; status: string; currency: string; total: number }
  const [rows, setRows] = useState<PurchaseRow[]>([])

  // form
  const [currency, setCurrency] = useState("USD")
  const [shipping, setShipping] = useState<number>(0)
  const [tax, setTax] = useState<number>(0)
  const [notes, setNotes] = useState("")
  const [placedAt, setPlacedAt] = useState<string>(() => new Date().toISOString().slice(0,16))

  type Item = { product_id: string; name?: string; quantity: number; unit_cost: number }
  const [items, setItems] = useState<Item[]>([{ product_id: "", quantity: 1, unit_cost: 0 }])

  const addItem = () => setItems((a) => [...a, { product_id: "", quantity: 1, unit_cost: 0 }])
  const removeItem = (i: number) => setItems((a) => a.filter((_, idx) => idx !== i))
  const updateItem = (i: number, patch: Partial<Item>) => setItems((a) => a.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))

  const subtotal = items.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unit_cost) || 0), 0)
  const total = subtotal + (Number(shipping) || 0) + (Number(tax) || 0)

  const loadSuppliers = useMemo(
    () => async () => {
      try {
        const res = await fetch("/api/admin/suppliers")
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || "Error")
        setSuppliers((json.data || []).map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })))
      } catch (e: unknown) {
        toast({ title: "Error cargando proveedores", description: (e instanceof Error ? e.message : String(e)) || "", variant: "destructive" })
      }
    },
    [toast],
  )

  const loadPurchases = useMemo(
    () => async (sid?: string) => {
      if (!sid) return
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/suppliers/purchases?supplier_id=${encodeURIComponent(sid)}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || "Error")
        setRows((json.data || []) as PurchaseRow[])
      } catch (e: unknown) {
        toast({ title: "Error cargando compras", description: (e instanceof Error ? e.message : String(e)) || "", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const submit = async () => {
    try {
      if (!supplierId) return toast({ title: "Proveedor requerido", variant: "destructive" })
      if (!items.length || items.some((i) => !i.product_id || !i.quantity)) return toast({ title: "Items inválidos", variant: "destructive" })
      setLoading(true)
      const res = await fetch("/api/admin/suppliers/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_id: supplierId,
          items: items.map((i) => ({ product_id: i.product_id, quantity: Number(i.quantity) || 0, unit_cost: Number(i.unit_cost) || 0 })),
          currency,
          shipping: Number(shipping) || 0,
          tax: Number(tax) || 0,
          notes: notes || undefined,
          placed_at: placedAt || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Error")
      toast({ title: "Compra creada", description: json.purchase.id })
      setItems([{ product_id: "", quantity: 1, unit_cost: 0 }])
      setShipping(0); setTax(0); setNotes("")
      await loadPurchases(supplierId)
    } catch (e: unknown) {
      toast({ title: "Error al crear compra", description: (e instanceof Error ? e.message : String(e)) || "", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [loadSuppliers])

  useEffect(() => {
    if (supplierId) loadPurchases(supplierId)
  }, [supplierId, loadPurchases])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Compras a proveedores</h1>
          <p className="text-sm text-muted-foreground">Crea órdenes de compra y revisa el historial por proveedor.</p>
        </div>
        <Link href="/admin" className="text-sm text-primary underline-offset-2 hover:underline">Volver al panel</Link>
      </div>

      <section className="rounded border p-4 space-y-3">
        <div className="grid md:grid-cols-3 gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">Proveedor</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="border rounded px-2 py-1 bg-background">
              <option value="">Seleccionar</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">Fecha</label>
            <div className="flex gap-2">
              <input type="datetime-local" value={placedAt} onChange={(e) => setPlacedAt(e.target.value)} className="border rounded px-2 py-1 bg-background" />
              <button type="button" onClick={() => setPlacedAt(new Date().toISOString().slice(0,16))} className="rounded bg-muted px-2 text-xs">Ahora</button>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-2 items-end">
          <div>
            <label className="text-xs text-muted-foreground">Moneda</label>
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border rounded px-2 py-1 bg-background" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Envío</label>
            <input type="number" step="0.01" value={shipping} onChange={(e) => setShipping(Number(e.target.value))} className="w-full border rounded px-2 py-1 bg-background" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Impuesto</label>
            <input type="number" step="0.01" value={tax} onChange={(e) => setTax(Number(e.target.value))} className="w-full border rounded px-2 py-1 bg-background" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Notas</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded px-2 py-1 bg-background min-h-[80px]" />
        </div>

        <div className="space-y-2">
          <div className="font-medium">Ítems</div>
          {items.map((it, idx) => (
            <div key={idx} className="grid md:grid-cols-6 gap-2 items-end border rounded p-2">
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground">Producto</label>
                <ProductPicker
                  value={it.product_id}
                  onChange={(p) => updateItem(idx, { product_id: p?.id || "", name: p?.name })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Nombre (opcional)</label>
                <input value={it.name || ""} onChange={(e) => updateItem(idx, { name: e.target.value })} className="w-full border rounded px-2 py-1 bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Cant.</label>
                <input type="number" min={1} value={it.quantity} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} className="w-full border rounded px-2 py-1 bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Costo unit.</label>
                <input type="number" step="0.01" value={it.unit_cost} onChange={(e) => updateItem(idx, { unit_cost: Number(e.target.value) })} className="w-full border rounded px-2 py-1 bg-background" />
              </div>
              <div className="md:col-span-6 flex justify-between">
                <button onClick={() => removeItem(idx)} className="text-sm text-red-600 hover:underline" disabled={items.length === 1}>Eliminar</button>
              </div>
            </div>
          ))}
          <button onClick={addItem} className="rounded bg-muted px-3 py-1 text-sm hover:bg-muted/80">Agregar ítem</button>
        </div>

        <div className="border-t pt-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">${" "}{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Total</span><span className="tabular-nums font-medium">${" "}{total.toFixed(2)}</span></div>
        </div>

        <button onClick={submit} disabled={loading} className="rounded bg-primary text-primary-foreground px-3 py-2 text-sm disabled:opacity-60">
          {loading ? "Creando..." : "Crear compra"}
        </button>
      </section>

      <section className="rounded border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Historial</div>
          <button onClick={() => loadPurchases(supplierId)} disabled={loading || !supplierId} className="rounded bg-muted px-3 py-1 text-sm">{loading ? "Cargando..." : "Actualizar"}</button>
        </div>
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-3 py-2">Fecha</th>
                <th className="text-left px-3 py-2">Estado</th>
                <th className="text-left px-3 py-2">Moneda</th>
                <th className="text-right px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-muted-foreground" colSpan={4}>{loading ? "Cargando..." : "Sin datos"}</td>
                </tr>
              )}
              {rows.map((r: PurchaseRow) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.placed_at ? new Date(r.placed_at).toLocaleString() : "-"}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">{r.currency}</td>
                  <td className="px-3 py-2 text-right">${" "}{Number(r.total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function ProductPicker({ value, onChange }: { value: string; onChange: (p?: { id: string; name: string }) => void }) {
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
    <div className="relative">
      <input
        value={value || q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); onChange(undefined) }}
        className="w-full border rounded px-2 py-1 bg-background"
        placeholder="Buscar producto"
        onFocus={() => setOpen(true)}
      />
      {open && list.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded border bg-background shadow">
          {list.map((p) => (
            <button key={p.id} type="button" onClick={() => { onChange(p); setQ(p.name); setOpen(false) }} className="w-full text-left px-2 py-1 hover:bg-muted text-sm">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.id}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
