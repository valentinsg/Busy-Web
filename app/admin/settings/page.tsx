"use client"

import * as React from "react"

export default function SettingsPage() {
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [flat, setFlat] = React.useState<number>(25000)
  const [free, setFree] = React.useState<number>(100000)
  const [toast, setToast] = React.useState<string>("")

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" })
        const data = await res.json()
        if (!cancelled && res.ok) {
          setFlat(Number(data.shipping_flat_rate ?? 25000))
          setFree(Number(data.shipping_free_threshold ?? 100000))
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setToast("")
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping_flat_rate: flat, shipping_free_threshold: free }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Error guardando cambios")
      setToast("Guardado ✔")
    } catch (err: unknown) {
      setToast(err?.toString() || "Error inesperado")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">Configuración de la tienda</p>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <form onSubmit={onSubmit} className="max-w-lg space-y-5">
          <div>
            <label className="block text-sm mb-1">Precio de envío (ARS)</label>
            <input
              type="number"
              className="w-full rounded-md border bg-background px-3 py-2"
              value={flat}
              min={0}
              step={1}
              onChange={(e) => setFlat(Number(e.target.value))}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">Costo fijo del envío.</p>
          </div>

          <div>
            <label className="block text-sm mb-1">Umbral envío gratis (ARS)</label>
            <input
              type="number"
              className="w-full rounded-md border bg-background px-3 py-2"
              value={free}
              min={0}
              step={1}
              onChange={(e) => setFree(Number(e.target.value))}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">Si el subtotal supera este monto, el envío es gratuito.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
            {toast && <span className="text-xs text-muted-foreground">{toast}</span>}
          </div>
        </form>
      )}
    </div>
  )
}
