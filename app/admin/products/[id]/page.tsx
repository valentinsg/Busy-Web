"use client"

import * as React from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getProductByIdAsync } from "@/lib/repo/products"
import type { Product } from "@/lib/types"

interface PageProps { params: { id: string } }

export default function EditProductPage({ params }: PageProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [product, setProduct] = React.useState<Product | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  type FormState = {
    name?: string
    price?: number
    currency?: string
    images?: string[]
    colors?: string
    sizes?: string
    tags?: string
    category?: string
    sku?: string
    stock?: number
    description?: string
    imported?: boolean
    careInstructions?: string
    benefitsText?: string // one per line: Title|Subtitle
  }
  const [form, setForm] = React.useState<FormState>({})
  const [stockBySize, setStockBySize] = React.useState<Record<string, number>>({})
  const [uploading, setUploading] = React.useState(false)
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

  // File upload handler for images input (top-level)
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
      setForm((f) => ({ ...f, images: [...(f.images || []), ...uploaded] }))
      toast({ title: "Imágenes subidas", description: `${uploaded.length} archivo(s) agregado(s)` })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
      toast({ title: "Error al subir", description: message })
    } finally {
      setUploading(false)
    }
  }

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
              tags: (p.tags || []).join(","),
              category: p.category,
              sku: p.sku,
              stock: p.stock,
              description: p.description ?? "",
              imported: !!(p as unknown as { imported?: boolean }).imported,
              careInstructions: (p as unknown as { careInstructions?: string }).careInstructions || "",
              benefitsText: Array.isArray((p as unknown as { benefits?: Array<{title:string; subtitle?:string}> }).benefits) ? ((p as unknown as { benefits?: Array<{title:string; subtitle?:string}> }).benefits as Array<{title:string; subtitle?:string}>).map(b=> b.subtitle? `${b.title}|${b.subtitle}`: b.title).join("\n") : "",
            })
            setStockBySize(p.stockBySize || {})
            const sizes = p.sizes || []
            const rows = sizes.map((s) => {
              const mRaw = (p as unknown as { measurementsBySize?: Record<string, unknown> })
                .measurementsBySize?.[s] as unknown
              const m = (mRaw && typeof mRaw === 'object' ? mRaw as Record<string, unknown> : {})
              return {
                size: s,
                chest: typeof m.chest === 'number' ? (m.chest as number) : undefined,
                length: typeof m.length === 'number' ? (m.length as number) : undefined,
                sleeve: typeof m.sleeve === 'number' ? (m.sleeve as number) : undefined,
                waist: typeof m.waist === 'number' ? (m.waist as number) : undefined,
                hip: typeof m.hip === 'number' ? (m.hip as number) : undefined,
                stock: (p.stockBySize || {})[s] ?? undefined,
              }
            })
            setSizeRows(rows)
          }
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
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
      // Build sizes/measurements from table rows
      const uniqueSizes = Array.from(new Set((String(form.sizes||"").split(",").map((s:string)=>s.trim()).filter(Boolean).length ? String(form.sizes||"").split(",") : sizeRows.map(r=>r.size)).map((s:string)=>s.trim()).filter(Boolean)))
      const measurements_by_size = sizeRows.length
        ? Object.fromEntries(
            sizeRows
              .filter((r) => r.size)
              .map((r) => [
                r.size,
                {
                  unit: 'cm',
                  ...(typeof r.chest === 'number' ? { chest: r.chest } : {}),
                  ...(typeof r.length === 'number' ? { length: r.length } : {}),
                  ...(typeof r.sleeve === 'number' ? { sleeve: r.sleeve } : {}),
                  ...(typeof r.waist === 'number' ? { waist: r.waist } : {}),
                  ...(typeof r.hip === 'number' ? { hip: r.hip } : {}),
                },
              ])
          )
        : undefined
      const stockMap = sizeRows.length
        ? Object.fromEntries(sizeRows.filter((r)=>r.size && typeof r.stock === 'number').map((r)=>[r.size, Number(r.stock)]))
        : stockBySize
      // Parse benefits text lines -> array
      const benefits = String(form.benefitsText||"")
        .split("\n")
        .map((l)=>l.trim())
        .filter(Boolean)
        .map((l)=>{
          const [title, subtitle] = l.split("|").map(s=>s.trim())
          return subtitle ? { title, subtitle } : { title }
        })

      const payload = {
        name: form.name,
        price: Number(form.price),
        currency: form.currency,
        images: form.images,
        colors: String(form.colors).split(",").map((s)=>s.trim()).filter(Boolean),
        sizes: uniqueSizes,
        measurements_by_size,
        tags: String(form.tags||"").split(",").map((s)=>s.trim()).filter(Boolean),
        category: form.category,
        sku: form.sku,
        stock: Number(form.stock) || 0,
        description: form.description || "",
        imported: !!form.imported,
        care_instructions: form.careInstructions || undefined,
        benefits: benefits.length ? benefits : undefined,
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
        body: JSON.stringify({ stockBySize: stockMap }),
      })
      const json2 = await res2.json()
      if (!res2.ok || !json2.ok) throw new Error(json2.error || "Error al guardar stock por talle")
      toast({ title: "Cambios guardados", description: "El producto fue actualizado correctamente." })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
      toast({ title: "Error al guardar", description: message })
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
      toast({ title: "Producto eliminado", description: "Se actualizó el listado." })
      router.replace("/admin/products")
      // Fuerza recarga del listado para evitar HTML en caché del history.back()
      setTimeout(() => {
        window.location.reload()
      }, 50)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
      toast({ title: "Error al eliminar", description: message })
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
          <div className="md:col-span-2 flex items-center gap-2">
            <input id="imported" type="checkbox" checked={!!form.imported} onChange={(e)=>setForm({...form, imported: e.target.checked})} />
            <label htmlFor="imported" className="text-sm">Producto importado</label>
          </div>
          <label className="text-sm">Colores (coma)
            <input value={form.colors||""} onChange={(e)=>setForm({...form, colors: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" />
          </label>
          <label className="text-sm">Talles (coma)
            <input value={form.sizes||""} onChange={(e)=>setForm({...form, sizes: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" />
          </label>
          <label className="text-sm md:col-span-2">Tags (coma)
            <input value={form.tags||""} onChange={(e)=>setForm({...form, tags: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" placeholder="featured,pin,no-care,no-free-shipping,no-returns,no-quality,no-default-features" />
          </label>
          <label className="text-sm md:col-span-2">Cuidados (texto)
            <textarea value={form.careInstructions||""} onChange={(e)=>setForm({...form, careInstructions: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" rows={4} placeholder={"• Lavar a máquina con agua fría..."} />
          </label>
          <label className="text-sm md:col-span-2">Beneficios (uno por línea, usar &quot;Título|Subtítulo&quot; opcional)
            <textarea value={form.benefitsText||""} onChange={(e)=>setForm({...form, benefitsText: e.target.value})} className="w-full border rounded px-3 py-2 bg-transparent" rows={4} placeholder={"Envío gratis|En compras superiores a $80.000\nDevoluciones fáciles|Política de 30 días"} />
          </label>
          <div className="md:col-span-2">
            <label className="text-sm">Imágenes
              <input type="file" accept="image/*" multiple onChange={onFileChange} className="block mt-1" />
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(form.images||[]).map((url: string) => (
                <div key={url} className="relative group">
                  <Image src={url} alt="img" className="w-full h-24 object-cover rounded" width={200} height={96} />
                  <button type="button" onClick={() => setForm((f)=>({ ...f, images: (f.images||[]).filter((u:string)=>u!==url) }))} className="absolute top-1 right-1 text-[11px] underline bg-black/60 rounded px-1 py-0.5 opacity-0 group-hover:opacity-100">Quitar</button>
                </div>
              ))}
            </div>
            {uploading && <p className="text-sm text-muted-foreground mt-1">Subiendo...</p>}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-heading font-medium mb-2">Stock por talle</h3>
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
                      <input value={row.size} onChange={(e)=>{
                        const v = e.target.value
                        setSizeRows((rows)=>rows.map((r,i)=> i===idx? { ...r, size: v }: r))
                      }} className="w-24 border rounded px-2 py-1 bg-transparent" />
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
            <button type="button" className="rounded px-3 py-1 border" onClick={()=>setSizeRows(rows=>[...rows, { size: '' }])}>Agregar fila</button>
            <button type="button" className="rounded px-3 py-1 border" onClick={()=>{
              setSizeRows([
                { size: 'S' },
                { size: 'M' },
                { size: 'L' },
                { size: 'XL' },
              ])
            }}>Prefill S-XL</button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="rounded px-3 py-2 bg-black text-white disabled:opacity-60" disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  )
}
