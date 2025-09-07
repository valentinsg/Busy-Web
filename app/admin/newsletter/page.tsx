"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase/client"

interface Subscriber { email: string; created_at: string }

export default function NewsletterAdminPage() {
  const [items, setItems] = React.useState<Subscriber[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")
      const res = await fetch("/api/admin/newsletter", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error")
      setItems(json.items || [])
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { load() }, [load])

  const removeEmail = async (email: string) => {
    if (!confirm(`¿Eliminar ${email}?`)) return
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")
      const res = await fetch(`/api/admin/newsletter?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error")
      setItems((prev) => prev.filter((it) => it.email !== email))
    } catch (e: any) {
      alert(e?.message || String(e))
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-semibold">Newsletter</h2>
      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">Sin suscriptores.</p>
      ) : (
        <div className="rounded border divide-y">
          {items.map((s) => (
            <div key={s.email} className="flex items-center justify-between p-3 text-sm">
              <div>
                <p className="font-medium">{s.email}</p>
                <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => removeEmail(s.email)} className="text-xs underline">Eliminar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
