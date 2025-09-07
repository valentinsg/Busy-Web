"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase/client"
import { getProductByIdAsync } from "@/lib/repo/products"
import type { Product } from "@/lib/types"

interface PageProps { params: { id: string } }

export default function EditProductPage({ params }: PageProps) {
  const [product, setProduct] = React.useState<Product | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState<any>({})
  const [stockBySize, setStockBySize] = React.useState<Record<string, number>>({})
  const [measurementsRaw, setMeasurementsRaw] = React.useState<string>("")
  const [measurementsErr, setMeasurementsErr] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const p = await getProductByIdAsync(params.id)
        if (!cancelled) {
          setProduct(p || null)
          if (p) {
            setForm({
              name: p.name,
              price: p.price,
              currency: p.currency,
              images: p.images,
              colors: p.colors.join(","),
              sizes: p.sizes.join(","),
              category: p.category,
              sku: p.sku,
              stock: p.stock,
              description: p.description ?? "",
            })
            setStockBySize(p.stockBySize || {})
            setMeasurementsRaw(p.measurementsBySize ? JSON.stringify(p.measurementsBySize, null, 2) : "")
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [params.id])

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")
      let measurements_by_size: any | undefined
      setMeasurementsErr(null)
      if (measurementsRaw.trim()) {
        try {
          const parsed = JSON.parse(measurementsRaw)
          if (typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error("El JSON debe ser un objeto { TALLE: { chest: 50, ... } }")
          }
          measurements_by_size = parsed
        } catch (e: any) {
          setMeasurementsErr(e?.message || "JSON inválido")
          throw new Error("JSON de medidas inválido")
        }
      }
      const payload = {
        name: form.name,
        price: Number(form.price),
        currency: form.currency,
        images: form.images,
        colors: String(form.colors).split(",").map((s)=>s.trim()).filter(Boolean),
        sizes: String(form.sizes).split(",").map((s)=>s.trim()).filter(Boolean),
        category: form.category,
        sku: form.sku,
        stock: Number(form.stock) || 0,
        description: form.description || "",
        measurements_by_size,
      }
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error al guardar")
      // Save stock by size
      const res2 = await fetch(`/api/admin/stock/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stockBySize }),
      })
      const json2 = await res2.json()
      if (!res2.ok || !json2.ok) throw new Error(json2.error || "Error al guardar stock por talle")
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!confirm("¿Eliminar producto?")) return
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error al eliminar")
      window.history.back()
    } catch (e: any) {
      setError(e?.message || String(e))
    }
  }

  if (loading) return <div className="text-muted-foreground">Cargando...</div>
  if (!product) return <div className="text-muted-foreground">Producto no encontrado</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">Editar producto</h2>
        <button onClick={del} className="text-sm underline">Eliminar</button>
      </div>
      <form onSubmit={saveProduct} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm md:col-span-2">Nombre
            <input value={form.name||""} onChange={(e)=>setForm({...form, name: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" required />
          </label>
          <label className="text-sm">Precio
            <input type="number" value={form.price||0} onChange={(e)=>setForm({...form, price: Number(e.target.value)})} className="w-full border rounded px-3 py-2 bg-transparent" required />
          </label>
          <label className="text-sm">Moneda
            <input value={form.currency||"USD"} onChange={(e)=>setForm({...form, currency: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" />
          </label>
          <label className="text-sm">Categoría
            <input value={form.category||""} onChange={(e)=>setForm({...form, category: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" required />
          </label>
          <label className="text-sm">SKU
            <input value={form.sku||""} onChange={(e)=>setForm({...form, sku: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" required />
          </label>
          <label className="text-sm">Stock
            <input type="number" value={form.stock||0} onChange={(e)=>setForm({...form, stock: Number(e.target.value)})} className="w-full border rounded px-3 py-2 bg-transparent" />
          </label>
          <label className="text-sm md:col-span-2">Descripción
            <textarea value={form.description||""} onChange={(e)=>setForm({...form, description: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" rows={4} />
          </label>
          <label className="text-sm">Colores (coma)
            <input value={form.colors||""} onChange={(e)=>setForm({...form, colors: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" />
          </label>
          <label className="text-sm">Talles (coma)
            <input value={form.sizes||""} onChange={(e)=>setForm({...form, sizes: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" />
          </label>
        </div>

        <div className="mt-4">
          <h3 className="font-heading font-medium mb-2">Stock por talle</h3>
          <div className="flex flex-wrap gap-2">
            {String(form.sizes||"").split(",").map((s)=>s.trim()).filter(Boolean).map((size)=> (
              <label key={size} className="text-sm">
                {size}
                <input type="number" value={stockBySize[size]||0} onChange={(e)=>setStockBySize({...stockBySize, [size]: Number(e.target.value)})} className="ml-2 w-24 border rounded px-2 py-1 bg-transparent" />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-heading font-medium mb-2">Medidas por talle (JSON)</h3>
          <p className="text-xs text-muted-foreground mb-2">Formato ejemplo: {`{"S": { "unit": "cm", "chest": 52, "length": 67, "sleeve": 61 }, "M": { ... }}`}</p>
          <textarea value={measurementsRaw} onChange={(e)=>setMeasurementsRaw(e.target.value)} rows={10} className="w-full border rounded px-3 py-2 bg-transparent font-mono text-xs" placeholder='{"S": { "unit": "cm", "chest": 52, "length": 67 }}' />
          {measurementsErr && <p className="text-xs text-red-500 mt-1">{measurementsErr}</p>}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="rounded px-3 py-2 bg-black text-white disabled:opacity-60" disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  )
}
