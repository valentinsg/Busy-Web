"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { getProductByIdAsync } from "@/lib/repo/products"
import { ProductForm, type ProductFormData, type SizeRow } from "@/components/admin/product-form"
import { buildBenefitsFromKeys, PREDEFINED_BENEFITS } from "@/lib/benefits"
import type { Product } from "@/lib/types"

interface PageProps { 
  params: { id: string } 
}

export default function EditProductPage({ params }: PageProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [product, setProduct] = React.useState<Product | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [initialData, setInitialData] = React.useState<ProductFormData>({})
  const [initialSizeRows, setInitialSizeRows] = React.useState<SizeRow[]>([])

  // Load product data
  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const p = await getProductByIdAsync(params.id)
        if (!cancelled && p) {
          setProduct(p)
          
          // Split product benefits into predefined vs custom
          const rawBenefits: Array<{ title: string; subtitle?: string }> = Array.isArray((p as any).benefits)
            ? ((p as any).benefits as Array<{title:string; subtitle?:string}>)
            : []
          const predefinedKeys = new Set(PREDEFINED_BENEFITS.map(b=>b.key))
          const titleToKey = new Map(PREDEFINED_BENEFITS.map(b=>[b.title.toLowerCase(), b.key]))
          const selectedKeys: string[] = []
          const customLines: string[] = []
          for (const b of rawBenefits) {
            const k = titleToKey.get(b.title.toLowerCase())
            if (k && predefinedKeys.has(k)) {
              selectedKeys.push(k)
            } else {
              customLines.push(b.subtitle ? `${b.title}|${b.subtitle}` : b.title)
            }
          }

          setInitialData({
            id: p.id,
            name: p.name,
            price: p.price,
            currency: p.currency,
            images: p.images,
            colors: p.colors.join(","),
            selectedColors: Array.isArray(p.colors) ? p.colors : [],
            sizes: p.sizes.join(","),
            tags: (p.tags || []).join(","),
            featured: Array.isArray(p.tags) ? p.tags.includes('featured') : false,
            category: p.category,
            sku: p.sku,
            stock: p.stock,
            description: p.description ?? "",
            imported: !!(p as any).imported,
            careInstructions: (p as any).careInstructions || "",
            benefitsText: customLines.join("\n"),
            selectedBenefitKeys: Array.from(new Set(selectedKeys)),
            badgeText: (p as any).badgeText || "",
            badgeVariant: (p as any).badgeVariant || "default",
            discountPercentage: (p as any).discountPercentage || 0,
            discountActive: !!(p as any).discountActive,
          })

          const sizes = p.sizes || []
          const rows = sizes.map((s) => {
            const mRaw = (p as any).measurementsBySize?.[s]
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
          setInitialSizeRows(rows)
        }
      } catch (e: unknown) {
        if (!cancelled) {
          toast({
            title: "Error al cargar",
            description: e instanceof Error ? e.message : String(e),
            variant: "destructive"
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [params.id, toast])

  const handleSubmit = async (formData: ProductFormData, sizeRows: SizeRow[]) => {
    setSaving(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")
      
      // Build sizes/measurements from table rows
      const uniqueSizes = Array.from(
        new Set(
          (
            String(formData.sizes || "")
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean).length
              ? String(formData.sizes || "").split(",")
              : sizeRows.map((r) => r.size)
          )
            .map((s: string) => s.trim())
            .filter(Boolean)
        )
      )

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

      // Build stockMap from sizeRows - this is the source of truth
      const stockMap = Object.fromEntries(
        sizeRows
          .filter((r) => r.size && typeof r.stock === 'number')
          .map((r) => [r.size, Number(r.stock)])
      )

      // Parse benefits
      const benefits = String(formData.benefitsText || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [title, subtitle] = l.split("|").map((s) => s.trim())
          return subtitle ? { title, subtitle } : { title }
        })

      // Build from predefined selected keys
      const predefined = buildBenefitsFromKeys(formData.selectedBenefitKeys || [])
      const combinedBenefits = [...predefined, ...benefits]

      const baseTags = (formData.tags || "").split(",").map((s) => s.trim()).filter(Boolean)
      const tags = formData.featured
        ? Array.from(new Set([...baseTags, "featured"]))
        : baseTags.filter((t) => t !== "featured")

      // Calculate total stock from size rows
      const totalStock = sizeRows.reduce((sum, row) => sum + (row.stock || 0), 0)

      const payload = {
        id: formData.id,
        name: formData.name,
        price: Number(formData.price) || 0,
        currency: formData.currency || "USD",
        images: formData.images || [],
        colors: (formData.selectedColors && formData.selectedColors.length > 0)
          ? Array.from(new Set(formData.selectedColors))
          : (formData.colors || "").split(",").map((s) => s.trim()).filter(Boolean),
        sizes: uniqueSizes,
        measurements_by_size,
        category: formData.category || null,
        sku: formData.sku || "",
        stock: totalStock, // Use calculated total from size rows
        stockBySize: stockMap, // Include stockBySize in main payload
        description: formData.description || "",
        tags,
        imported: !!formData.imported,
        care_instructions: formData.careInstructions || undefined,
        benefits: combinedBenefits.length ? combinedBenefits : undefined,
        badge_text: formData.badgeText?.trim() || null,
        badge_variant: formData.badgeVariant || "default",
        discount_percentage: formData.discountPercentage ? Math.floor(Number(formData.discountPercentage)) : null,
        discount_active: !!formData.discountActive,
      }

      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      
      const json = await res.json()
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Error al guardar el producto")
      }

      // Save stock by size - use the new ID from form in case it was changed
      const productId = formData.id || params.id
      const res2 = await fetch(`/api/admin/stock/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stockBySize: stockMap }),
      })
      
      const json2 = await res2.json()
      if (!res2.ok || !json2.ok) {
        throw new Error(json2.error || "Error al guardar stock por talle")
      }

      toast({
        title: "Cambios guardados",
        description: "El producto fue actualizado correctamente.",
      })

      // If ID changed, redirect to the new URL
      if (formData.id && formData.id !== params.id) {
        router.replace(`/admin/products/${formData.id}`)
      } else {
        // Reload the product data to reflect changes
        router.refresh()
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      toast({
        title: "Error al guardar",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
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
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Error al eliminar")
      }
      
      toast({
        title: "Producto eliminado",
        description: "Se actualizó el listado.",
      })
      
      router.push("/admin/products")
      router.refresh()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      toast({
        title: "Error al eliminar",
        description: message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Cargando...</div>
  }

  if (!product) {
    return <div className="text-muted-foreground">Producto no encontrado</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">Editar producto</h2>
        <button onClick={handleDelete} className="text-sm underline text-red-600 hover:text-red-700">
          Eliminar
        </button>
      </div>
      <ProductForm 
        initialData={initialData}
        initialSizeRows={initialSizeRows}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
        isSubmitting={saving}
      />
    </div>
  )
}
