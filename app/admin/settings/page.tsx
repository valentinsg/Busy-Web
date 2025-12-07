"use client"

export const dynamic = 'force-dynamic'

import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/format"
import type { ProvinceRates } from "@/lib/repo/settings"
import { Gift, MapPin, Snowflake, Truck } from "lucide-react"
import * as React from "react"

// Province list for Argentina
const PROVINCES = [
  { code: "MDP", name: "Mar del Plata", zone: "local" },
  { code: "BA", name: "Buenos Aires", zone: "cercana" },
  { code: "CABA", name: "Capital Federal", zone: "cercana" },
  { code: "LP", name: "La Pampa", zone: "cercana" },
  { code: "CB", name: "Córdoba", zone: "media" },
  { code: "SF", name: "Santa Fe", zone: "media" },
  { code: "ER", name: "Entre Ríos", zone: "media" },
  { code: "MZ", name: "Mendoza", zone: "media" },
  { code: "SL", name: "San Luis", zone: "media" },
  { code: "SJ", name: "San Juan", zone: "media" },
  { code: "LR", name: "La Rioja", zone: "media" },
  { code: "CA", name: "Catamarca", zone: "media" },
  { code: "RN", name: "Río Negro", zone: "media" },
  { code: "NQ", name: "Neuquén", zone: "media" },
  { code: "TU", name: "Tucumán", zone: "lejana" },
  { code: "SA", name: "Salta", zone: "lejana" },
  { code: "JU", name: "Jujuy", zone: "lejana" },
  { code: "SE", name: "Santiago del Estero", zone: "lejana" },
  { code: "CH", name: "Chaco", zone: "lejana" },
  { code: "FO", name: "Formosa", zone: "lejana" },
  { code: "CR", name: "Corrientes", zone: "lejana" },
  { code: "MI", name: "Misiones", zone: "lejana" },
  { code: "CT", name: "Chubut", zone: "lejana" },
  { code: "SC", name: "Santa Cruz", zone: "lejana" },
  { code: "TF", name: "Tierra del Fuego", zone: "lejana" },
]

export default function SettingsPage() {
  const [loading, setLoading] = React.useState(true)

  // Shipping settings
  const [flat, setFlat] = React.useState<number>(25000)
  const [free, setFree] = React.useState<number>(100000)
  const [marDelPlataRate, setMarDelPlataRate] = React.useState<number>(10000)
  const [savingShipping, setSavingShipping] = React.useState(false)

  // Free shipping toggle (for special events)
  const [freeShippingEnabled, setFreeShippingEnabled] = React.useState<boolean>(false)
  const [freeShippingMessage, setFreeShippingMessage] = React.useState<string>("Envío gratis en todas las compras")
  const [savingFreeShipping, setSavingFreeShipping] = React.useState(false)

  // Province rates
  const [provinceRates, setProvinceRates] = React.useState<ProvinceRates>({})
  const [showProvinceRates, setShowProvinceRates] = React.useState(false)
  const [savingProvinces, setSavingProvinces] = React.useState(false)

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
          setMarDelPlataRate(Number(data.mar_del_plata_rate ?? 10000))
          setChristmasMode(Boolean(data.christmas_mode))
          setFreeShippingEnabled(Boolean(data.free_shipping_enabled))
          setFreeShippingMessage(data.free_shipping_message || "Envío gratis en todas las compras")
          setProvinceRates(data.province_rates || {})
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

  // Save shipping settings
  async function saveShipping(e: React.FormEvent) {
    e.preventDefault()
    setSavingShipping(true)
    try {
      const res = await fetch("/api/admin/settings/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_flat_rate: flat,
          shipping_free_threshold: free,
          mar_del_plata_rate: marDelPlataRate,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Error guardando cambios")
      toast({
        title: "✅ Envío actualizado",
        description: `Precio: ${formatPrice(flat)} | Gratis desde: ${formatPrice(free)} | MDP: ${formatPrice(marDelPlataRate)}`,
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

  // Toggle free shipping (for special events)
  async function toggleFreeShipping() {
    setSavingFreeShipping(true)
    try {
      const res = await fetch("/api/admin/settings/free-shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          free_shipping_enabled: !freeShippingEnabled,
          free_shipping_message: freeShippingMessage,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Error guardando cambios")
      setFreeShippingEnabled(!freeShippingEnabled)
      toast({
        title: !freeShippingEnabled ? "🎁 Envío gratis activado" : "Envío gratis desactivado",
        description: !freeShippingEnabled
          ? "Todos los pedidos tendrán envío gratis"
          : "Se aplicarán las tarifas normales",
      })
    } catch (err: unknown) {
      toast({
        title: "❌ Error",
        description: err?.toString() || "Error al guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setSavingFreeShipping(false)
    }
  }

  // Save free shipping message
  async function saveFreeShippingMessage(e: React.FormEvent) {
    e.preventDefault()
    setSavingFreeShipping(true)
    try {
      const res = await fetch("/api/admin/settings/free-shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          free_shipping_enabled: freeShippingEnabled,
          free_shipping_message: freeShippingMessage,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Error guardando cambios")
      toast({
        title: "✅ Mensaje actualizado",
        description: "El mensaje de envío gratis se guardó correctamente",
      })
    } catch (err: unknown) {
      toast({
        title: "❌ Error",
        description: err?.toString() || "Error al guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setSavingFreeShipping(false)
    }
  }

  // Save province rates
  async function saveProvinceRates() {
    setSavingProvinces(true)
    try {
      const res = await fetch("/api/admin/settings/provinces", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province_rates: provinceRates }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Error guardando cambios")
      toast({
        title: "✅ Tarifas por provincia actualizadas",
        description: "Las tarifas personalizadas se guardaron correctamente",
      })
    } catch (err: unknown) {
      toast({
        title: "❌ Error",
        description: err?.toString() || "Error al guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setSavingProvinces(false)
    }
  }

  // Update province rate
  function updateProvinceRate(code: string, rate: number) {
    setProvinceRates(prev => ({
      ...prev,
      [code]: { rate, enabled: prev[code]?.enabled ?? true }
    }))
  }

  // Toggle province enabled
  function toggleProvinceEnabled(code: string) {
    setProvinceRates(prev => ({
      ...prev,
      [code]: {
        rate: prev[code]?.rate ?? flat,
        enabled: !(prev[code]?.enabled ?? true)
      }
    }))
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

      {/* ========== FREE SHIPPING TOGGLE (SPECIAL EVENTS) ========== */}
      <section className="max-w-lg rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-5 w-5 text-green-500" />
          <h2 className="text-lg font-medium">Envío Gratis Global</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Activa envío gratis para todos los pedidos. Ideal para Black Friday, Navidad u otros eventos especiales.
        </p>

        <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-green-950/20 to-emerald-950/20 mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎁</div>
            <div>
              <p className="font-medium">Envío Gratis Activado</p>
              <p className="text-xs text-muted-foreground">Todos los pedidos tienen envío gratis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleFreeShipping}
            disabled={savingFreeShipping}
            className="relative inline-flex items-center cursor-pointer disabled:opacity-50"
            aria-label={freeShippingEnabled ? "Desactivar envío gratis" : "Activar envío gratis"}
          >
            <div className={`w-11 h-6 rounded-full transition-colors ${freeShippingEnabled ? 'bg-green-600' : 'bg-muted'}`}>
              <div className={`absolute top-[2px] h-5 w-5 bg-white border border-gray-300 rounded-full transition-transform ${freeShippingEnabled ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
            </div>
          </button>
        </div>

        {freeShippingEnabled && (
          <form onSubmit={saveFreeShippingMessage} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Mensaje personalizado</label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2"
                value={freeShippingMessage}
                onChange={(e) => setFreeShippingMessage(e.target.value)}
                placeholder="Envío gratis en todas las compras"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Este mensaje se mostrará en el carrito y checkout.
              </p>
            </div>
            <button
              type="submit"
              disabled={savingFreeShipping}
              className="rounded-md bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {savingFreeShipping ? "Guardando…" : "Guardar Mensaje"}
            </button>
          </form>
        )}
      </section>

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
            <label className="block text-sm mb-1">Precio de envío base (ARS)</label>
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
              Costo fijo del envío para provincias sin tarifa personalizada.
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

          <div>
            <label className="block text-sm mb-1">Tarifa Mar del Plata (ARS)</label>
            <input
              type="number"
              className="w-full rounded-md border bg-background px-3 py-2"
              value={marDelPlataRate}
              min={0}
              step={1}
              onChange={(e) => setMarDelPlataRate(Number(e.target.value))}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Tarifa especial para envíos locales en Mar del Plata.
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

      {/* ========== PROVINCE RATES SECTION ========== */}
      <section className="max-w-2xl rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium">Tarifas por Provincia</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowProvinceRates(!showProvinceRates)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {showProvinceRates ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Configura tarifas personalizadas por provincia. Si no se configura, se usa la tarifa base.
        </p>

        {showProvinceRates && (
          <div className="space-y-4">
            {/* Zone: Local */}
            <div>
              <h3 className="text-sm font-medium text-green-500 mb-2">Zona Local</h3>
              <div className="space-y-2">
                {PROVINCES.filter(p => p.zone === "local").map(province => (
                  <div key={province.code} className="flex items-center gap-3 p-2 rounded border bg-muted/30">
                    <button
                      type="button"
                      onClick={() => toggleProvinceEnabled(province.code)}
                      className={`w-4 h-4 rounded border ${provinceRates[province.code]?.enabled !== false ? 'bg-green-500 border-green-500' : 'bg-transparent border-muted-foreground'}`}
                    />
                    <span className="flex-1 text-sm">{province.name}</span>
                    <input
                      type="number"
                      className="w-28 rounded-md border bg-background px-2 py-1 text-sm"
                      value={provinceRates[province.code]?.rate ?? marDelPlataRate}
                      onChange={(e) => updateProvinceRate(province.code, Number(e.target.value))}
                      min={0}
                      disabled={provinceRates[province.code]?.enabled === false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Zone: Cercana */}
            <div>
              <h3 className="text-sm font-medium text-blue-500 mb-2">Zona Cercana</h3>
              <div className="space-y-2">
                {PROVINCES.filter(p => p.zone === "cercana").map(province => (
                  <div key={province.code} className="flex items-center gap-3 p-2 rounded border bg-muted/30">
                    <button
                      type="button"
                      onClick={() => toggleProvinceEnabled(province.code)}
                      className={`w-4 h-4 rounded border ${provinceRates[province.code]?.enabled !== false ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-muted-foreground'}`}
                    />
                    <span className="flex-1 text-sm">{province.name}</span>
                    <input
                      type="number"
                      className="w-28 rounded-md border bg-background px-2 py-1 text-sm"
                      value={provinceRates[province.code]?.rate ?? flat}
                      onChange={(e) => updateProvinceRate(province.code, Number(e.target.value))}
                      min={0}
                      disabled={provinceRates[province.code]?.enabled === false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Zone: Media */}
            <div>
              <h3 className="text-sm font-medium text-yellow-500 mb-2">Zona Media</h3>
              <div className="space-y-2">
                {PROVINCES.filter(p => p.zone === "media").map(province => (
                  <div key={province.code} className="flex items-center gap-3 p-2 rounded border bg-muted/30">
                    <button
                      type="button"
                      onClick={() => toggleProvinceEnabled(province.code)}
                      className={`w-4 h-4 rounded border ${provinceRates[province.code]?.enabled !== false ? 'bg-yellow-500 border-yellow-500' : 'bg-transparent border-muted-foreground'}`}
                    />
                    <span className="flex-1 text-sm">{province.name}</span>
                    <input
                      type="number"
                      className="w-28 rounded-md border bg-background px-2 py-1 text-sm"
                      value={provinceRates[province.code]?.rate ?? flat}
                      onChange={(e) => updateProvinceRate(province.code, Number(e.target.value))}
                      min={0}
                      disabled={provinceRates[province.code]?.enabled === false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Zone: Lejana */}
            <div>
              <h3 className="text-sm font-medium text-red-500 mb-2">Zona Lejana</h3>
              <div className="space-y-2">
                {PROVINCES.filter(p => p.zone === "lejana").map(province => (
                  <div key={province.code} className="flex items-center gap-3 p-2 rounded border bg-muted/30">
                    <button
                      type="button"
                      onClick={() => toggleProvinceEnabled(province.code)}
                      className={`w-4 h-4 rounded border ${provinceRates[province.code]?.enabled !== false ? 'bg-red-500 border-red-500' : 'bg-transparent border-muted-foreground'}`}
                    />
                    <span className="flex-1 text-sm">{province.name}</span>
                    <input
                      type="number"
                      className="w-28 rounded-md border bg-background px-2 py-1 text-sm"
                      value={provinceRates[province.code]?.rate ?? flat}
                      onChange={(e) => updateProvinceRate(province.code, Number(e.target.value))}
                      min={0}
                      disabled={provinceRates[province.code]?.enabled === false}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={saveProvinceRates}
              disabled={savingProvinces}
              className="rounded-md bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-50"
            >
              {savingProvinces ? "Guardando…" : "Guardar Tarifas por Provincia"}
            </button>
          </div>
        )}
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
