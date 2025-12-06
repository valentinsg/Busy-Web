"use client"

export const dynamic = 'force-dynamic'

import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/format"
import { Snowflake, Truck } from "lucide-react"
import * as React from "react"

export default function SettingsPage() {
  const [loading, setLoading] = React.useState(true)

  // Shipping settings
  const [flat, setFlat] = React.useState<number>(25000)
  const [free, setFree] = React.useState<number>(100000)
  const [savingShipping, setSavingShipping] = React.useState(false)

  // Theme settings
  const [christmasMode, setChristmasMode] = React.useState<boolean>(false)
  const [savingTheme, setSavingTheme] = React.useState(false)

  const { toast } = useToast()

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/admin/settings", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" }
        })
        const data = await res.json()
        console.log("[Settings] Loaded from API:", data)
        if (!cancelled && res.ok) {
          setFlat(Number(data.shipping_flat_rate))
          setFree(Number(data.shipping_free_threshold))
          setChristmasMode(Boolean(data.christmas_mode))
        }
      } catch (err) {
        console.error("[Settings] Error loading:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Save only shipping settings
  async function saveShipping(e: React.FormEvent) {
    e.preventDefault()
    setSavingShipping(true)
    try {
      const res = await fetch("/api/admin/settings/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping_flat_rate: flat, shipping_free_threshold: free }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Error guardando cambios")
      toast({
        title: "✅ Envío actualizado",
        description: `Precio: ${formatPrice(flat)} | Gratis desde: ${formatPrice(free)}`,
      })
    } catch (err: unknown) {
      toast({
        title: "❌ Error",
        description: err?.toString() || "Error al guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setSavingShipping(false)
    }
  }

  // Save only theme settings
  async function saveTheme() {
    setSavingTheme(true)
    try {
      const res = await fetch("/api/admin/settings/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ christmas_mode: !christmasMode }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Error guardando cambios")
      setChristmasMode(!christmasMode)
      toast({
        title: !christmasMode ? "🎄 Modo Navidad activado" : "Modo Navidad desactivado",
        description: !christmasMode ? "Los copos de nieve ya están cayendo" : "Efectos navideños desactivados",
      })
    } catch (err: unknown) {
      toast({
        title: "❌ Error",
        description: err?.toString() || "Error al guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setSavingTheme(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-semibold mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Configuración de la tienda</p>
      </div>

      {/* ========== SHIPPING SECTION ========== */}
      <section className="max-w-lg rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium">Configuración de Envío</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Estos valores se usan en el carrito, checkout y cálculo de órdenes.
        </p>

        <form onSubmit={saveShipping} className="space-y-4">
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
            <p className="mt-1 text-xs text-muted-foreground">
              Costo fijo del envío. Mar del Plata siempre tiene envío de $10.000.
            </p>
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
            <p className="mt-1 text-xs text-muted-foreground">
              Si el subtotal supera este monto, el envío es gratuito.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingShipping}
            className="rounded-md bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-50"
          >
            {savingShipping ? "Guardando…" : "Guardar Envío"}
          </button>
        </form>
      </section>

      {/* ========== THEMES SECTION ========== */}
      <section className="max-w-lg rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Snowflake className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-medium">Temas Estacionales</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Activa efectos visuales temporales en toda la web.
        </p>

        <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-red-950/20 to-green-950/20">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎄</div>
            <div>
              <p className="font-medium">Modo Navidad</p>
              <p className="text-xs text-muted-foreground">Copos de nieve y efectos festivos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={saveTheme}
            disabled={savingTheme}
            className="relative inline-flex items-center cursor-pointer disabled:opacity-50"
            aria-label={christmasMode ? "Desactivar modo navidad" : "Activar modo navidad"}
          >
            <div className={`w-11 h-6 rounded-full transition-colors ${christmasMode ? 'bg-green-600' : 'bg-muted'}`}>
              <div className={`absolute top-[2px] h-5 w-5 bg-white border border-gray-300 rounded-full transition-transform ${christmasMode ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
            </div>
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          El cambio se aplica inmediatamente. No se muestra en páginas de admin.
        </p>
      </section>
    </div>
  )
}
