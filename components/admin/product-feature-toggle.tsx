"use client"

import { useState } from "react"
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
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: Array.from(tags) }),
      })
      if (!res.ok) throw new Error("Error al actualizar producto")
      setFeatured(!featured)
    } catch (e) {
      console.error(e)
      alert("No se pudo actualizar el estado destacado")
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
