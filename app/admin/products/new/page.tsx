"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = React.useState({
    id: "",
    name: "",
    price: 0,
    currency: "USD",
    category: "",
    sku: "",
    stock: 0,
    description: "",
    colors: "",
    sizes: "",
    images: [] as string[],
  })
  // Dynamic size rows for per-size stock and measurements
  const [sizeRows, setSizeRows] = React.useState<
    Array<{
      size: string
      chest?: number
      length?: number
      sleeve?: number
      waist?: number
      hip?: number
      stock?: number
    }>
  >([])
  const [uploading, setUploading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files.length) return
    setUploading(true)
    setError(null)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        const json = await res.json()
        if (!res.ok || !json.ok) throw new Error(json.error || "Upload failed")
        uploaded.push(json.url as string)
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }))
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (!form.id) throw new Error("Debes definir un ID único (slug)")
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")
      // Build sizes, measurements_by_size and stockBySize from table if provided
      const tableSizes = sizeRows.map((r) => r.size).filter(Boolean)
      const uniqueSizes = Array.from(new Set((tableSizes.length ? tableSizes : form.sizes.split(",")).map((s) => s.trim()).filter(Boolean)))
      const measurements_by_size = sizeRows.length
        ? Object.fromEntries(
            sizeRows
              .filter((r) => r.size)
              .map((r) => [
                r.size,
                {
                  unit: "cm",
                  ...(typeof r.chest === 'number' ? { chest: r.chest } : {}),
                  ...(typeof r.length === 'number' ? { length: r.length } : {}),
                  ...(typeof r.sleeve === 'number' ? { sleeve: r.sleeve } : {}),
                  ...(typeof r.waist === 'number' ? { waist: r.waist } : {}),
                  ...(typeof r.hip === 'number' ? { hip: r.hip } : {}),
                },
              ])
          )
        : undefined
      const stockBySize = sizeRows.length
        ? Object.fromEntries(sizeRows.filter((r) => r.size && typeof r.stock === 'number').map((r) => [r.size, Number(r.stock)]))
        : undefined

      const payload = {
        id: form.id,
        name: form.name,
        price: Number(form.price),
        currency: form.currency,
        images: form.images,
        colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
        sizes: uniqueSizes,
        measurements_by_size,
        category: form.category,
        sku: form.sku,
        stock: Number(form.stock) || 0,
        description: form.description || "",
        tags: [],
        stockBySize,
      }
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error al guardar")
      router.replace("/admin/products")
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-semibold">Nuevo producto</h2>
      <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm">ID (slug)
            <input value={form.id} onChange={(e)=>setForm({...form, id: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" required />
          </label>
          <label className="text-sm">SKU
            <input value={form.sku} onChange={(e)=>setForm({...form, sku: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" required />
          </label>
          <label className="text-sm md:col-span-2">Nombre
            <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" required />
          </label>
          <label className="text-sm">Precio
            <input type="number" value={form.price} onChange={(e)=>setForm({...form, price: Number(e.target.value)})} className="w-full border rounded px-3 py-2 bg-transparent" required />
          </label>
          <label className="text-sm">Moneda
            <input value={form.currency} onChange={(e)=>setForm({...form, currency: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" />
          </label>
          <label className="text-sm">Categoría
            <input value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" required />
          </label>
          <label className="text-sm">Stock
            <input type="number" value={form.stock} onChange={(e)=>setForm({...form, stock: Number(e.target.value)})} className="w-full border rounded px-3 py-2 bg-transparent" />
          </label>
          <label className="text-sm md:col-span-2">Descripción
            <textarea value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" rows={4} />
          </label>
          <label className="text-sm">Colores (coma)
            <input value={form.colors} onChange={(e)=>setForm({...form, colors: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" />
          </label>
          <label className="text-sm">Talles (coma)
            <input value={form.sizes} onChange={(e)=>setForm({...form, sizes: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" />
          </label>
          <div className="md:col-span-2">
            <h3 className="font-heading font-medium mb-2">Talles, stock y medidas</h3>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left">Talle</th>
                    <th className="p-2 text-left">Stock</th>
                    <th className="p-2 text-left">Pecho (cm)</th>
                    <th className="p-2 text-left">Largo (cm)</th>
                    <th className="p-2 text-left">Manga (cm)</th>
                    <th className="p-2 text-left">Cintura (cm)</th>
                    <th className="p-2 text-left">Cadera (cm)</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {sizeRows.map((row, idx) => (
                    <tr key={idx} className="border-t border-border">
                      <td className="p-2">
                        <input
                          value={row.size}
                          onChange={(e)=>{
                            const v = e.target.value
                            setSizeRows((rows)=>rows.map((r,i)=> i===idx? { ...r, size: v }: r))
                          }}
                          className="w-24 border rounded px-2 py-1 bg-transparent"
                          placeholder="S"
                        />
                      </td>
                      <td className="p-2">
                        <input type="number" value={row.stock ?? 0} onChange={(e)=>{
                          const v = Number(e.target.value)
                          setSizeRows((rows)=>rows.map((r,i)=> i===idx? { ...r, stock: v }: r))
                        }} className="w-24 border rounded px-2 py-1 bg-transparent" />
                      </td>
                      <td className="p-2">
                        <input type="number" value={row.chest ?? ''} onChange={(e)=>{
                          const v = e.target.value === '' ? undefined : Number(e.target.value)
                          setSizeRows((rows)=>rows.map((r,i)=> i===idx? { ...r, chest: v }: r))
                        }} className="w-24 border rounded px-2 py-1 bg-transparent" />
                      </td>
                      <td className="p-2">
                        <input type="number" value={row.length ?? ''} onChange={(e)=>{
                          const v = e.target.value === '' ? undefined : Number(e.target.value)
                          setSizeRows((rows)=>rows.map((r,i)=> i===idx? { ...r, length: v }: r))
                        }} className="w-24 border rounded px-2 py-1 bg-transparent" />
                      </td>
                      <td className="p-2">
                        <input type="number" value={row.sleeve ?? ''} onChange={(e)=>{
                          const v = e.target.value === '' ? undefined : Number(e.target.value)
                          setSizeRows((rows)=>rows.map((r,i)=> i===idx? { ...r, sleeve: v }: r))
                        }} className="w-24 border rounded px-2 py-1 bg-transparent" />
                      </td>
                      <td className="p-2">
                        <input type="number" value={row.waist ?? ''} onChange={(e)=>{
                          const v = e.target.value === '' ? undefined : Number(e.target.value)
                          setSizeRows((rows)=>rows.map((r,i)=> i===idx? { ...r, waist: v }: r))
                        }} className="w-24 border rounded px-2 py-1 bg-transparent" />
                      </td>
                      <td className="p-2">
                        <input type="number" value={row.hip ?? ''} onChange={(e)=>{
                          const v = e.target.value === '' ? undefined : Number(e.target.value)
                          setSizeRows((rows)=>rows.map((r,i)=> i===idx? { ...r, hip: v }: r))
                        }} className="w-24 border rounded px-2 py-1 bg-transparent" />
                      </td>
                      <td className="p-2">
                        <button type="button" className="text-sm underline" onClick={()=>setSizeRows(rows=>rows.filter((_,i)=>i!==idx))}>Quitar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex gap-2">
              <button type="button" className="rounded px-3 py-1 border" onClick={()=>setSizeRows(rows=>[...rows, { size: "" }])}>Agregar fila</button>
              <button type="button" className="rounded px-3 py-1 border" onClick={()=>{
                // Prefill typical S-XL
                setSizeRows([
                  { size: 'S' },
                  { size: 'M' },
                  { size: 'L' },
                  { size: 'XL' },
                ])
              }}>Prefill S-XL</button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Imágenes
              <input type="file" accept="image/*" multiple onChange={onFileChange} className="block mt-1" />
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {form.images.map((url) => (
                <img key={url} src={url} alt="img" className="w-full h-24 object-cover rounded" />
              ))}
            </div>
            {uploading && <p className="text-sm text-muted-foreground mt-1">Subiendo...</p>}
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="rounded px-3 py-2 bg-black text-white disabled:opacity-60" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  )
}
