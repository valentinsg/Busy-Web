"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const categories = ["supplier", "fixed_cost", "marketing", "shipping", "taxes", "other"]

export default function ExpensesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<Array<any>>([])

  // filters
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [category, setCategory] = useState("")

  // create form
  const [cCategory, setCCategory] = useState("other")
  const [cAmount, setCAmount] = useState<number>(0)
  const [cCurrency, setCCurrency] = useState("USD")
  const [cSupplierId, setCSupplierId] = useState("")
  const [cDescription, setCDescription] = useState("")
  const [cChannel, setCChannel] = useState("")
  const [cDate, setCDate] = useState("")

  const load = useMemo(
    () => async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (from) params.set("from", from)
        if (to) params.set("to", to)
        if (category) params.set("category", category)
        const res = await fetch(`/api/admin/expenses?${params.toString()}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || "Error")
        setRows(json.data || [])
      } catch (e: any) {
        toast({ title: "Error al cargar gastos", description: e?.message || "", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    },
    [from, to, category, toast],
  )

  const create = async () => {
    try {
      if (!cAmount || cAmount <= 0) {
        toast({ title: "Monto inválido", variant: "destructive" })
        return
      }
      setLoading(true)
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: cCategory,
          amount: Number(cAmount) || 0,
          currency: cCurrency || undefined,
          description: cDescription || undefined,
          supplier_id: cSupplierId || undefined,
          channel: cChannel || undefined,
          incurred_at: cDate || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Error")
      toast({ title: "Gasto creado", description: `${json.expense.category} ${json.expense.amount} ${json.expense.currency}` })
      // reset simple
      setCCategory("other")
      setCAmount(0)
      setCDescription("")
      setCSupplierId("")
      setCChannel("")
      setCDate("")
      await load()
    } catch (e: any) {
      toast({ title: "Error al crear gasto", description: e?.message || "", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const total = rows.reduce((acc: number, r: any) => acc + Number(r.amount || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Gastos</h1>
          <p className="text-sm text-muted-foreground">Registrar y revisar gastos por período y categoría.</p>
        </div>
        <Link href="/admin" className="text-sm text-primary underline-offset-2 hover:underline">Volver al panel</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded border p-4 md:col-span-2 space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground">Desde</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-2 py-1 bg-background" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground">Hasta</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-2 py-1 bg-background" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground">Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded px-2 py-1 bg-background">
                <option value="">Todas</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button onClick={load} disabled={loading} className="rounded bg-muted px-3 py-1 text-sm">{loading ? "Cargando..." : "Aplicar"}</button>
            <div className="ml-auto text-sm">
              <span className="text-muted-foreground">Total en vista:</span> <span className="font-medium tabular-nums">${" "}{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2">Fecha</th>
                  <th className="text-left px-3 py-2">Categoría</th>
                  <th className="text-left px-3 py-2">Proveedor</th>
                  <th className="text-left px-3 py-2">Canal</th>
                  <th className="text-right px-3 py-2">Monto</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>{loading ? "Cargando..." : "Sin datos"}</td>
                  </tr>
                )}
                {rows.map((r: any) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{r.incurred_at ? new Date(r.incurred_at).toLocaleString() : "-"}</td>
                    <td className="px-3 py-2">{r.category}</td>
                    <td className="px-3 py-2">{r.supplier_id || "-"}</td>
                    <td className="px-3 py-2">{r.channel || "-"}</td>
                    <td className="px-3 py-2 text-right">${" "}{Number(r.amount || 0).toFixed(2)} <span className="text-xs text-muted-foreground">{r.currency}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded border p-4 space-y-3">
          <div className="font-medium">Nuevo gasto</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Categoría</label>
              <select value={cCategory} onChange={(e) => setCCategory(e.target.value)} className="w-full border rounded px-2 py-1 bg-background">
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Monto</label>
              <input type="number" step="0.01" value={cAmount} onChange={(e) => setCAmount(Number(e.target.value))} className="w-full border rounded px-2 py-1 bg-background" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Moneda</label>
              <input value={cCurrency} onChange={(e) => setCCurrency(e.target.value)} className="w-full border rounded px-2 py-1 bg-background" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Proveedor (UUID, opcional)</label>
              <input value={cSupplierId} onChange={(e) => setCSupplierId(e.target.value)} className="w-full border rounded px-2 py-1 bg-background" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Canal (opcional)</label>
              <input value={cChannel} onChange={(e) => setCChannel(e.target.value)} className="w-full border rounded px-2 py-1 bg-background" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Fecha (opcional)</label>
              <input type="datetime-local" value={cDate} onChange={(e) => setCDate(e.target.value)} className="w-full border rounded px-2 py-1 bg-background" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Descripción</label>
            <textarea value={cDescription} onChange={(e) => setCDescription(e.target.value)} className="w-full border rounded px-2 py-1 bg-background min-h-[80px]" />
          </div>
          <button onClick={create} disabled={loading} className="w-full rounded bg-primary text-primary-foreground px-3 py-2 text-sm disabled:opacity-60">
            {loading ? "Creando..." : "Crear gasto"}
          </button>
        </div>
      </div>
    </div>
  )
}
