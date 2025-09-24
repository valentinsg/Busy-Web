"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Order, CartItem } from "@/lib/types"

type Metric = "spend" | "frequency" | "recency"

type Row = {
  customer_id: string
  email: string | null
  full_name: string | null
  orders_count: number
  total_spent: number
  last_purchase_at: string | null
}

export default function CustomersRankingPage() {
  const { toast } = useToast()
  const [metric, setMetric] = useState<Metric>("spend")
  const [limit, setLimit] = useState<number>(20)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<{ full_name: string; email: string; phone: string; tags: string } | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null)
  const [ordersCache, setOrdersCache] = useState<Record<string, Order[]>>({})
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const load = useMemo(
    () => async (opts?: { quiet?: boolean }) => {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/analytics/customer-ranking?metric=${metric}&limit=${limit}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || "Error")
        setRows(json.data || [])
        if (!opts?.quiet) {
          toast({ title: "Ranking actualizado", description: `Métrica: ${metric.toUpperCase()} | TOP ${limit}` })
        }
      } catch (e: unknown) {
        toast({ title: "Error al cargar ranking", description: e?.toString() || "", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    },
    [metric, limit, toast],
  )

  useEffect(() => {
    // Initial load
    load({ quiet: true })
  }, [metric, limit, load])

  async function openEdit(row: Row) {
    setEditingId(row.customer_id)
    setEditData({ full_name: row.full_name || "", email: row.email || "", phone: "", tags: "" })
  }

  async function saveEdit() {
    if (!editingId || !editData) return
    if (editData.email && !emailRegex.test(editData.email)) {
      toast({ title: "Email inválido", variant: "destructive" })
      return
    }
    try {
      setSaving(true)
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          full_name: editData.full_name || null,
          email: editData.email || null,
          phone: editData.phone || null,
          tags: editData.tags ? editData.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Error')
      toast({ title: 'Cliente actualizado' })
      setEditingId(null)
      setEditData(null)
      await load({ quiet: true })
    } catch (e: unknown) {
      toast({ title: 'Error al actualizar', description: e?.toString() || '', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function deleteCustomer(id: string) {
    if (!confirm('¿Eliminar cliente? Esta acción es permanente.')) return
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/customers?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Error')
      toast({ title: 'Cliente eliminado' })
      await load({ quiet: true })
    } catch (e: unknown) {
      toast({ title: 'Error al eliminar', description: e?.toString() || '', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function toggleOrders(row: Row) {
    const id = row.customer_id
    if (expandedCustomerId === id) {
      setExpandedCustomerId(null)
      return
    }
    setExpandedCustomerId(id)
    if (!ordersCache[id]) {
      try {
        const res = await fetch(`/api/admin/customers/orders?customer_id=${encodeURIComponent(id)}&limit=10`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Error')
        setOrdersCache((m) => ({ ...m, [id]: json.orders || [] }))
      } catch (e: unknown) {
        toast({ title: 'Error al cargar compras', description: e?.toString() || '', variant: 'destructive' })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Ranking de clientes</h1>
          <p className="text-sm text-muted-foreground">Top clientes por gasto, frecuencia o recencia.</p>
        </div>
        <Link href="/admin" className="text-sm text-primary underline-offset-2 hover:underline">
          Volver al panel
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm">Métrica</label>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as Metric)}
          className="border rounded px-2 py-1 bg-background"
        >
          <option value="spend">Gasto</option>
          <option value="frequency">Frecuencia</option>
          <option value="recency">Recencia</option>
        </select>
        <label className="text-sm">TOP</label>
        <input
          type="number"
          min={1}
          max={200}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value || 20))}
          className="w-20 border rounded px-2 py-1 bg-background"
        />
        <button
          onClick={() => load()}
          disabled={loading}
          className="rounded bg-primary text-primary-foreground px-3 py-1 text-sm disabled:opacity-60"
        >
          {loading ? "Cargando..." : "Aplicar"}
        </button>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2">Cliente</th>
              <th className="text-left px-3 py-2">Pedidos</th>
              <th className="text-left px-3 py-2">Gasto total</th>
              <th className="text-left px-3 py-2">Última compra</th>
              <th className="text-left px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={4}>
                  {loading ? "Cargando..." : "Sin datos"}
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <>
                <tr key={r.customer_id} className="border-t align-top">
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{r.full_name || r.email || r.customer_id.slice(0, 6)}</span>
                      {r.email && <span className="text-muted-foreground text-xs">{r.email}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2">{r.orders_count}</td>
                  <td className="px-3 py-2">${" "}{r.total_spent.toFixed(2)}</td>
                  <td className="px-3 py-2">{r.last_purchase_at ? new Date(r.last_purchase_at).toLocaleString() : "-"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button className="text-primary hover:underline" onClick={() => openEdit(r)}>Editar</button>
                      <button className="text-red-600 hover:underline" onClick={() => deleteCustomer(r.customer_id)}>Eliminar</button>
                      <button className="text-muted-foreground hover:underline" onClick={() => toggleOrders(r)} onMouseEnter={() => toggleOrders(r)}>
                        {expandedCustomerId === r.customer_id ? 'Ocultar compras' : 'Ver compras'}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedCustomerId === r.customer_id && (
                  <tr className="border-t bg-muted/10">
                    <td colSpan={5} className="px-3 py-2">
                      {!ordersCache[r.customer_id] ? (
                        <div className="text-xs text-muted-foreground">Cargando compras…</div>
                      ) : ordersCache[r.customer_id].length === 0 ? (
                        <div className="text-xs text-muted-foreground">Sin compras registradas</div>
                      ) : (
                        <div className="space-y-3">
                          {ordersCache[r.customer_id].map((o: Order) => (
                            <div key={o.id} className="rounded border p-2">
                              <div className="flex flex-wrap justify-between text-xs">
                                <div>
                                  <div><span className="text-muted-foreground">Orden</span>: {o.id}</div>
                                  <div><span className="text-muted-foreground">Fecha</span>: {new Date(o.created_at).toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                  <div>Subtotal: ${" "}{Number(o.total).toFixed(2)} {o.currency}</div>
                                  <div>Desc.: ${" "}{Number(o.discount).toFixed(2)}</div>
                                  <div>Env.: ${" "}{Number(o.shipping).toFixed(2)}</div>
                                  <div>Imp.: ${" "}{Number(o.tax).toFixed(2)}</div>
                                  <div className="font-medium">Total: ${" "}{Number(o.total).toFixed(2)} {o.currency}</div>
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="text-xs text-muted-foreground mb-1">Ítems</div>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-xs">
                                    <thead className="bg-muted/30">
                                      <tr>
                                        <th className="text-left px-2 py-1">Producto</th>
                                        <th className="text-left px-2 py-1">Talle</th>
                                        <th className="text-left px-2 py-1">Cant.</th>
                                        <th className="text-left px-2 py-1">Precio</th>
                                        <th className="text-left px-2 py-1">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {o.items.map((it: CartItem, i: number) => (
                                        <tr key={i} className="border-t">
                                          <td className="px-2 py-1">{it.product.name}</td>
                                          <td className="px-2 py-1">{it.selectedSize || '-'}</td>
                                          <td className="px-2 py-1">{it.quantity}</td>
                                          <td className="px-2 py-1">${" "}{Number(it.product.price).toFixed(2)}</td>
                                          <td className="px-2 py-1">${" "}{Number(it.product.price * it.quantity).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              {o.notes && (
                                <div className="mt-2 text-xs"><span className="text-muted-foreground">Notas:</span> {o.notes}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {editingId && editData && (
        <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center p-4" onClick={() => { if (!saving) { setEditingId(null); setEditData(null) }}}>
          <div className="bg-background rounded shadow-lg w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <div className="font-medium mb-3">Editar cliente</div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Nombre</label>
                <input className="w-full border rounded px-2 py-1 bg-background" value={editData.full_name} onChange={(e) => setEditData((d) => d ? { ...d, full_name: e.target.value } : d)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Email</label>
                <input className="w-full border rounded px-2 py-1 bg-background" value={editData.email} onChange={(e) => setEditData((d) => d ? { ...d, email: e.target.value } : d)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Teléfono</label>
                <input className="w-full border rounded px-2 py-1 bg-background" value={editData.phone} onChange={(e) => setEditData((d) => d ? { ...d, phone: e.target.value } : d)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Tags (separadas por coma)</label>
                <input className="w-full border rounded px-2 py-1 bg-background" value={editData.tags} onChange={(e) => setEditData((d) => d ? { ...d, tags: e.target.value } : d)} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="text-sm text-muted-foreground hover:underline" disabled={saving} onClick={() => { setEditingId(null); setEditData(null) }}>Cancelar</button>
              <button className="rounded bg-primary text-primary-foreground px-3 py-1 text-sm disabled:opacity-60" disabled={saving || (!!editData.email && !emailRegex.test(editData.email))} onClick={saveEdit}>{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
