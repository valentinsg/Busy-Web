"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

type Props = {
  productId: string
  initialFeatured?: boolean
  initialTags?: string[]
}

export default function ProductFeatureToggle({ productId, initialFeatured, initialTags }: Props) {
  const [loading, setLoading] = useState(false)
  const [featured, setFeatured] = useState(!!initialFeatured)

  async function toggle() {
    try {
      setLoading(true)
      const tags = new Set(initialTags || [])
      if (featured) {
        tags.delete("featured")
      } else {
        tags.add("featured")
      }
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ tags: Array.from(tags) }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({} as any))
        throw new Error(json?.error || "Error al actualizar producto")
      }
      setFeatured(!featured)
    } catch (e) {
      console.error(e)
      alert("No se pudo actualizar el estado destacado. Asegúrate de haber iniciado sesión como admin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant={featured ? "secondary" : "outline"} size="sm" onClick={toggle} disabled={loading} className="font-body">
      {featured ? "Quitar destacado" : "Destacar"}
    </Button>
  )
}
