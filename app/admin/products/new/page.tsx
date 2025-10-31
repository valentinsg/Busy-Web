"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ProductForm, type ProductFormData, type SizeRow } from "@/components/admin/product-form"
import { buildBenefitsFromKeys } from "@/lib/benefits"

export default function NewProductPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [saving, setSaving] = React.useState(false)

  const initialData: ProductFormData = {
    id: "",
    name: "",
    price: 0,
    currency: "USD",
    images: [],
    colors: "",
    selectedColors: [],
    sizes: "",
    tags: "",
    featured: false,
    category: "",
    sku: "",
    stock: 0,
    description: "",
    imported: false,
    careInstructions: "",
    benefitsText: "",
    selectedBenefitKeys: [],
    badgeText: "",
    badgeVariant: "default",
    discountPercentage: 0,
    discountActive: false,
  }

  const handleSubmit = async (formData: ProductFormData, sizeRows: SizeRow[]) => {
    setSaving(true)
    try {
      if (!formData.id) throw new Error("Debes definir un ID único (slug)")
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

      const stockBySize = sizeRows.length
        ? Object.fromEntries(
            sizeRows
              .filter((r) => r.size && typeof r.stock === 'number')
              .map((r) => [r.size, Number(r.stock)])
          )
        : undefined

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
        description: formData.description || "",
        tags,
        imported: !!formData.imported,
        care_instructions: formData.careInstructions || undefined,
        benefits: combinedBenefits.length ? combinedBenefits : undefined,
        badge_text: formData.badgeText?.trim() || null,
        badge_variant: formData.badgeVariant || "default",
        discount_percentage: formData.discountPercentage ? Math.floor(Number(formData.discountPercentage)) : null,
        discount_active: !!formData.discountActive,
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
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Error al guardar el producto")
      }
      
      toast({
        title: "Producto creado",
        description: `"${formData.name}" ha sido creado exitosamente`,
      })
      
      router.push("/admin/products")
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

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-semibold">Nuevo producto</h2>
      <ProductForm 
        initialData={initialData}
        initialSizeRows={[]}
        onSubmit={handleSubmit}
        submitLabel="Guardar"
        isSubmitting={saving}
      />
    </div>
  )
}
