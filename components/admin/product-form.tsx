"use client"

import * as React from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { CategorySelector } from "@/components/admin/category-selector"
import { COLOR_PALETTE } from "@/lib/color-utils"
import { PREDEFINED_BENEFITS } from "@/lib/benefits"
import { getSettingsClient } from "@/lib/repo/settings"
import { formatPrice } from "@/lib/format"

export type ProductFormData = {
  id?: string
  name?: string
  price?: number
  currency?: string
  images?: string[]
  colors?: string
  selectedColors?: string[]
  sizes?: string
  tags?: string
  featured?: boolean
  category?: string
  sku?: string
  stock?: number
  description?: string
  imported?: boolean
  careInstructions?: string
  benefitsText?: string
  selectedBenefitKeys?: string[]
  badgeText?: string
  badgeVariant?: string
  discountPercentage?: number
  discountActive?: boolean
}

export type SizeRow = {
  size: string
  chest?: number
  length?: number
  sleeve?: number
  waist?: number
  hip?: number
  stock?: number
}

interface ProductFormProps {
  initialData?: ProductFormData
  initialSizeRows?: SizeRow[]
  onSubmit: (data: ProductFormData, sizeRows: SizeRow[]) => Promise<void>
  submitLabel?: string
  isSubmitting?: boolean
}

function formatSlug(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '-')
}

export function ProductForm({ 
  initialData = {}, 
  initialSizeRows = [],
  onSubmit, 
  submitLabel = "Guardar",
  isSubmitting = false 
}: ProductFormProps) {
  const { toast } = useToast()
  const [form, setForm] = React.useState<ProductFormData>(initialData)
  const [sizeRows, setSizeRows] = React.useState<SizeRow[]>(initialSizeRows)
  const [uploading, setUploading] = React.useState(false)
  const [freeThreshold, setFreeThreshold] = React.useState<number>(100000)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await getSettingsClient()
        if (!cancelled) setFreeThreshold(Number(s.shipping_free_threshold ?? 100000))
      } catch {
        // ignore
      }
    })()
    return () => { cancelled = true }
  }, [])

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files.length) return
    setUploading(true)
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
      toast({ title: "Error al subir", description: message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form, sizeRows)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm">ID (slug)
          <input value={form.id || ""} onChange={(e) => setForm({ ...form, id: formatSlug(e.target.value) })} className="w-full border rounded px-3 py-2 bg-transparent" required />
        </label>
        <label className="text-sm">SKU
          <input value={form.sku || ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border rounded px-3 py-2 bg-transparent" required />
        </label>
        <label className="text-sm md:col-span-2">Nombre
          <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2 bg-transparent" required />
        </label>
        <label className="text-sm">Precio
          <input type="number" value={form.price || 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full border rounded px-3 py-2 bg-transparent" required />
        </label>
        <label className="text-sm">Moneda
          <input value={form.currency || "USD"} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full border rounded px-3 py-2 bg-transparent" />
        </label>
        <CategorySelector
          value={form.category || ""}
          onChange={(value) => setForm({ ...form, category: value })}
          required
        />
        <label className="text-sm md:col-span-2">Descripción
          <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2 bg-transparent [field-sizing:content]" rows={4} />
        </label>
        <div className="text-sm md:col-span-2">
          <div className="mb-1">Colores</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
            {COLOR_PALETTE.map((c) => {
              const checked = (form.selectedColors || []).includes(c.key)
              return (
                <label key={c.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const on = e.target.checked
                      setForm((f) => ({
                        ...f,
                        selectedColors: on
                          ? Array.from(new Set([...(f.selectedColors || []), c.key]))
                          : (f.selectedColors || []).filter((k) => k !== c.key)
                      }))
                    }}
                  />
                  <span className="flex items-center gap-2 text-xs">
                    <span className="w-4 h-4 rounded-full border border-border inline-block" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </span>
                </label>
              )
            })}
          </div>
          <div className="text-xs text-muted-foreground mb-1">Opcional: ingresar manual (se usará solo si no seleccionás de la paleta)</div>
          <input value={form.colors || ""} onChange={(e) => setForm({ ...form, colors: e.target.value })} className="w-full border rounded px-3 py-2 bg-transparent" placeholder="negro, crema, #e8dccc" />
        </div>
        <label className="text-sm">Talles (coma)
          <input value={form.sizes || ""} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="w-full border rounded px-3 py-2 bg-transparent" />
        </label>
        <div className="md:col-span-2 flex items-center gap-2">
          <input id="imported" type="checkbox" checked={!!form.imported} onChange={(e) => setForm({ ...form, imported: e.target.checked })} />
          <label htmlFor="imported" className="text-sm">Producto importado</label>
        </div>
        <label className="text-sm md:col-span-2">Tags (coma)
          <input value={form.tags || ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full border rounded px-3 py-2 bg-transparent" placeholder="featured,pin,no-care,no-free-shipping,no-returns,no-quality,no-default-features" />
        </label>
        <div className="md:col-span-2 flex items-center gap-2">
          <input id="featured" type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          <label htmlFor="featured" className="text-sm">Mostrar en Novedades (featured)</label>
        </div>
        <label className="text-sm md:col-span-2">Cuidados (texto)
          <textarea value={form.careInstructions || ""} onChange={(e) => setForm({ ...form, careInstructions: e.target.value })} className="w-full border rounded px-3 py-2 bg-transparent [field-sizing:content]" rows={4} placeholder={"• Lavar a máquina con agua fría..."} />
        </label>
        <div className="md:col-span-2 border rounded p-3">
          <div className="font-medium text-sm mb-2">Beneficios predefinidos</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PREDEFINED_BENEFITS.map((b) => {
              const checked = (form.selectedBenefitKeys || []).includes(b.key)
              const subtitle = b.key === 'free_shipping' ? `A partir de ${formatPrice(freeThreshold)}` : b.subtitle
              return (
                <label key={b.key} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const on = e.target.checked
                      setForm((f) => ({
                        ...f,
                        selectedBenefitKeys: on
                          ? Array.from(new Set([...(f.selectedBenefitKeys || []), b.key]))
                          : (f.selectedBenefitKeys || []).filter((k) => k !== b.key)
                      }))
                    }}
                  />
                  <span>
                    <span className="font-medium">{b.title}</span>
                    {subtitle && <span className="block text-muted-foreground">{subtitle}</span>}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
        <label className="text-sm md:col-span-2">Beneficios (uno por línea, usar &quot;Título|Subtítulo&quot; opcional)
          <textarea value={form.benefitsText || ""} onChange={(e) => setForm({ ...form, benefitsText: e.target.value })} className="w-full border rounded px-3 py-2 bg-transparent [field-sizing:content]" rows={4} placeholder={"Envío gratis|En compras superiores a $100.000\nGarantía de calidad|Materiales de primera calidad\nProducido en Argentina"} />
        </label>

        {/* Badge and Discount Section */}
        <div className="md:col-span-2 border-t pt-4 mt-4">
          <h3 className="font-heading font-medium mb-3 text-base">Badge y Descuentos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              Texto del Badge (ej: &quot;2x1&quot;, &quot;NUEVO&quot;, &quot;OFERTA&quot;)
              <input value={form.badgeText || ""} onChange={(e) => setForm({ ...form, badgeText: e.target.value })} className="w-full border rounded px-3 py-2 bg-transparent" placeholder="Producto Busy" />
            </label>
            <label className="text-sm">
              Estilo del Badge
              <select value={form.badgeVariant || "default"} onChange={(e) => setForm({ ...form, badgeVariant: e.target.value })} className="w-full border rounded px-3 py-2 bg-background text-foreground">
                <option value="default">Default</option>
                <option value="secondary">Secondary (Gris)</option>
                <option value="destructive">Destructive (Rojo)</option>
                <option value="outline">Outline</option>
              </select>
            </label>
            <label className="text-sm">
              Porcentaje de Descuento (0-100)
              <input type="number" min="0" max="100" value={form.discountPercentage || 0} onChange={(e) => setForm({ ...form, discountPercentage: Number(e.target.value) })} className="w-full border rounded px-3 py-2 bg-transparent" />
            </label>
            <div className="flex items-center gap-2">
              <input id="discountActive" type="checkbox" checked={!!form.discountActive} onChange={(e) => setForm({ ...form, discountActive: e.target.checked })} />
              <label htmlFor="discountActive" className="text-sm">Descuento activo</label>
            </div>
            <p className="text-xs text-muted-foreground md:col-span-2">💡 El badge se mostrará siempre si tiene texto. El descuento solo se aplicará si está activo y tiene un porcentaje mayor a 0.</p>
          </div>
        </div>

        <div className="col-span-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-medium text-base">Talles, stock y medidas</h3>
            <div className="text-sm text-muted-foreground">
              Stock total: <span className="font-semibold text-foreground">{sizeRows.reduce((sum, row) => sum + (row.stock || 0), 0)}</span>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-3 text-left font-medium">Talle</th>
                    <th className="p-3 text-left font-medium">Stock</th>
                    <th className="p-3 text-left font-medium">Pecho (cm)</th>
                    <th className="p-3 text-left font-medium">Largo (cm)</th>
                    <th className="p-3 text-left font-medium">Manga (cm)</th>
                    <th className="p-3 text-left font-medium">Cintura (cm)</th>
                    <th className="p-3 text-left font-medium">Cadera (cm)</th>
                    <th className="p-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeRows.map((row, idx) => (
                    <tr key={idx} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <input
                          value={row.size}
                          onChange={(e) => {
                            const v = e.target.value
                            setSizeRows((rows) => rows.map((r, i) => i === idx ? { ...r, size: v } : r))
                          }}
                          className="w-full max-w-[120px] border rounded px-3 py-2 bg-background focus:ring-2 focus:ring-accent-brand/20 transition-shadow"
                          placeholder="S, M, L..."
                        />
                      </td>
                      <td className="p-3">
                        <input type="number" value={row.stock ?? 0} onChange={(e) => {
                          const v = Number(e.target.value)
                          setSizeRows((rows) => rows.map((r, i) => i === idx ? { ...r, stock: v } : r))
                        }} className="w-full max-w-[100px] border rounded px-3 py-2 bg-background focus:ring-2 focus:ring-accent-brand/20 transition-shadow" />
                      </td>
                      <td className="p-3">
                        <input type="number" value={row.chest ?? ''} onChange={(e) => {
                          const v = e.target.value === '' ? undefined : Number(e.target.value)
                          setSizeRows((rows) => rows.map((r, i) => i === idx ? { ...r, chest: v } : r))
                        }} className="w-full max-w-[100px] border rounded px-3 py-2 bg-background focus:ring-2 focus:ring-accent-brand/20 transition-shadow" placeholder="-" />
                      </td>
                      <td className="p-3">
                        <input type="number" value={row.length ?? ''} onChange={(e) => {
                          const v = e.target.value === '' ? undefined : Number(e.target.value)
                          setSizeRows((rows) => rows.map((r, i) => i === idx ? { ...r, length: v } : r))
                        }} className="w-full max-w-[100px] border rounded px-3 py-2 bg-background focus:ring-2 focus:ring-accent-brand/20 transition-shadow" placeholder="-" />
                      </td>
                      <td className="p-3">
                        <input type="number" value={row.sleeve ?? ''} onChange={(e) => {
                          const v = e.target.value === '' ? undefined : Number(e.target.value)
                          setSizeRows((rows) => rows.map((r, i) => i === idx ? { ...r, sleeve: v } : r))
                        }} className="w-full max-w-[100px] border rounded px-3 py-2 bg-background focus:ring-2 focus:ring-accent-brand/20 transition-shadow" placeholder="-" />
                      </td>
                      <td className="p-3">
                        <input type="number" value={row.waist ?? ''} onChange={(e) => {
                          const v = e.target.value === '' ? undefined : Number(e.target.value)
                          setSizeRows((rows) => rows.map((r, i) => i === idx ? { ...r, waist: v } : r))
                        }} className="w-full max-w-[100px] border rounded px-3 py-2 bg-background focus:ring-2 focus:ring-accent-brand/20 transition-shadow" placeholder="-" />
                      </td>
                      <td className="p-3">
                        <input type="number" value={row.hip ?? ''} onChange={(e) => {
                          const v = e.target.value === '' ? undefined : Number(e.target.value)
                          setSizeRows((rows) => rows.map((r, i) => i === idx ? { ...r, hip: v } : r))
                        }} className="w-full max-w-[100px] border rounded px-3 py-2 bg-background focus:ring-2 focus:ring-accent-brand/20 transition-shadow" placeholder="-" />
                      </td>
                      <td className="p-3 text-right">
                        <button type="button" className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium transition-colors" onClick={() => setSizeRows(rows => rows.filter((_, i) => i !== idx))}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="rounded-lg px-4 py-2 border border-border hover:bg-muted transition-colors font-medium text-sm" onClick={() => setSizeRows(rows => [...rows, { size: "" }])}>
              + Agregar fila
            </button>
            <button type="button" className="rounded-lg px-4 py-2 border border-border hover:bg-muted transition-colors font-medium text-sm" onClick={() => {
              setSizeRows([
                { size: 'S' },
                { size: 'M' },
                { size: 'L' },
                { size: 'XL' },
              ])
            }}>
              Prefill S-XL
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm">Imágenes
            <input type="file" accept="image/*" multiple onChange={onFileChange} className="block mt-1" />
          </label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {(form.images || []).map((url) => (
              <div key={url} className="relative group">
                <Image
                  src={url}
                  alt="img"
                  width={200}
                  height={96}
                  className="w-full h-36 sm:h-28 md:h-24 lg:h-20 object-cover rounded"
                />
                <button type="button" onClick={() => setForm((f) => ({ ...f, images: (f.images || []).filter((u) => u !== url) }))} className="absolute top-1 right-1 text-[11px] underline bg-black/60 rounded px-1 py-0.5 opacity-0 group-hover:opacity-100">Quitar</button>
              </div>
            ))}
          </div>
          {uploading && <p className="text-sm text-muted-foreground mt-1">Subiendo...</p>}
        </div>
      </div>
      <button type="submit" className="rounded px-3 py-2 bg-black text-white disabled:opacity-60" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : submitLabel}
      </button>
    </form>
  )
}
