"use client"

export const dynamic = 'force-dynamic'

import { useToast } from "@/hooks/use-toast"
import { Snowflake } from "lucide-react"
import * as React from "react"

export default function SettingsPage() {
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [flat, setFlat] = React.useState<number>(25000)
  const [free, setFree] = React.useState<number>(100000)
  const [christmasMode, setChristmasMode] = React.useState<boolean>(false)
  const { toast } = useToast()

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" })
        const data = await res.json()
        if (!cancelled && res.ok) {
          setFlat(Number(data.shipping_flat_rate ?? 25000))
          setFree(Number(data.shipping_free_threshold ?? 100000))
          setChristmasMode(Boolean(data.christmas_mode ?? false))
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
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping_flat_rate: flat, shipping_free_threshold: free, christmas_mode: christmasMode }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Error guardando cambios")
      toast({
        title: "✅ Configuración guardada",
        description: "Los cambios se aplicaron correctamente",
      })
    } catch (err: unknown) {
      toast({
        title: "❌ Error",
        description: err?.toString() || "Error al guardar la configuración",
        variant: "destructive",
      })
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

          {/* Seasonal Themes Section */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Snowflake className="h-5 w-5 text-blue-400" />
              Temas Estacionales
            </h2>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-red-950/20 to-green-950/20">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎄</div>
                <div>
                  <p className="font-medium">Modo Navidad</p>
                  <p className="text-xs text-muted-foreground">Activa copos de nieve y efectos festivos en toda la web</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={christmasMode}
                  onChange={(e) => setChristmasMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
