"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

type Props = {
  productId: string
  initialActive?: boolean
}

export default function ProductActiveToggle({ productId, initialActive = true }: Props) {
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(initialActive)

  async function toggle() {
    try {
      setLoading(true)
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ is_active: !active }),
      })
      if (!res.ok) {
        let errMsg = "Error al actualizar producto"
        try {
          const json = (await res.json()) as { error?: string }
          if (json && typeof json.error === "string" && json.error) errMsg = json.error
        } catch {}
        throw new Error(errMsg)
      }
      setActive(!active)
    } catch (e) {
      console.error(e)
      alert("No se pudo actualizar el estado del producto.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={active ? "outline" : "destructive"}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="font-body gap-1.5"
      title={active ? "Desactivar producto" : "Activar producto"}
    >
      {active ? (
        <>
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Visible</span>
        </>
      ) : (
        <>
          <EyeOff className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Oculto</span>
        </>
      )}
    </Button>
  )
}
