"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const channels = ["web", "instagram", "mercado_libre", "feria", "manual", "marketplace", "grupo_wsp", "other"] as const

type Item = {
  product_id: string
  product_name?: string
  variant_color?: string
  variant_size?: string
  unit_price: number
  quantity: number
  available_sizes?: string[]
  stock_available?: number
  size_stocks?: Record<string, number>
  size_loading?: boolean
}

export default function ManualSalePage() {
  const { toast } = useToast()
  const [channel, setChannel] = useState<(typeof channels)[number]>("manual")
  const [customerId, setCustomerId] = useState<string>("")
  const [customerName, setCustomerName] = useState<string>("")
  const [customerEmail, setCustomerEmail] = useState<string>("")
  const [placedAt, setPlacedAt] = useState<string>(() => new Date().toISOString().slice(0, 16))
  const [currency, setCurrency] = useState<string>("ARS")
  const [discount, setDiscount] = useState<number>(0)
  const [shipping, setShipping] = useState<number>(0)
  const [tax, setTax] = useState<number>(0)
  const [notes, setNotes] = useState<string>("")
  const [isBarter, setIsBarter] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const [items, setItems] = useState<Item[]>([{ product_id: "", product_name: "", unit_price: 0, quantity: 1 }])

  const addItem = () => setItems((arr) => [...arr, { product_id: "", product_name: "", unit_price: 0, quantity: 1 }])
  const removeItem = (idx: number) => setItems((arr) => arr.filter((_, i) => i !== idx))

  const updateItem = (idx: number, patch: Partial<Item>) =>
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)))

  async function fetchItemStock(idx: number, productId?: string, size?: string) {
    const pid = productId ?? items[idx]?.product_id
    if (!pid) return undefined as
      | { sizeStocks: Record<string, number>; stockAvailable?: number }
      | undefined
    try {
      updateItem(idx, { size_loading: true })
      const params = new URLSearchParams({ product_id: pid })
      const res = await fetch(`/api/admin/products/stock?${params.toString()}`)
      const json = await res.json()
      if (res.ok) {
        const sizes: Array<{ size: string; stock: number }> = json.sizes || []
        let stockAvailable: number | undefined = undefined
        if (size) {
          const found = sizes.find((s) => s.size === size)
          stockAvailable = found ? found.stock : 0
        }
        if (stockAvailable === undefined) {
          stockAvailable = json.total ?? undefined
        }
        const sizeStocks: Record<string, number> = Object.fromEntries(
          sizes.map((s) => [s.size, Number(s.stock || 0)])
        )
        updateItem(idx, { quantity: 1 })
        updateItem(idx, {
          stock_available: stockAvailable,
          size_stocks: sizeStocks,
        })
        return { sizeStocks, stockAvailable }
      }
    } catch {
    } finally {
      updateItem(idx, { size_loading: false })
    }
    return undefined
  }

  // Each row is 1 unit by design
  const subtotal = items.reduce((acc, it) => acc + (Number(it.unit_price) || 0), 0)
  const total = subtotal - (Number(discount) || 0) + (Number(shipping) || 0) + (Number(tax) || 0)

  // Count how many units selected per product+size to prevent exceeding stock
  const selectedCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const it of items) {
      if (!it.product_id) continue
      const key = `${it.product_id}__${it.variant_size || ''}`
      m.set(key, (m.get(key) || 0) + 1)
    }
    return m
  }, [items])

  const anyOverStock = items.some((it) => {
    if (!it.product_id) return false
    const key = `${it.product_id}__${it.variant_size || ''}`
    const selected = (selectedCounts.get(key) || 0)
    // available for chosen size or total if no size
    const available = typeof it.stock_available === 'number' ? it.stock_available : undefined
    if (available === undefined) return false
    return selected > available
  })

  const submit = async () => {
    try {
      if (!items.length || items.some((i) => !i.product_id || !i.quantity)) {
        toast({ title: "Faltan datos", description: "Completa al menos un ítem con producto y cantidad.", variant: "destructive" })
        return
      }
      setLoading(true)
      const res = await fetch("/api/admin/sales/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId || null,
          customer_name: customerName || undefined,
          customer_email: customerEmail || undefined,
          channel,
          items: items.map((i) => ({
            product_id: i.product_id,
            product_name: i.product_name || undefined,
            variant_color: i.variant_color || undefined,
            variant_size: i.variant_size || undefined,
            unit_price: Number(i.unit_price) || 0,
            quantity: 1,
          })),
          currency,
          discount: Number(discount) || 0,
          shipping: Number(shipping) || 0,
          tax: Number(tax) || 0,
          notes: notes || undefined,
          placed_at: placedAt || undefined,
          is_barter: isBarter,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Error")
      toast({ title: "Venta creada", description: `Orden ${json.order.id} por ${total.toFixed(2)} ${currency}` })
      // Reset simple
      setItems([{ product_id: "", product_name: "", unit_price: 0, quantity: 1 }])
      setDiscount(0)
      setShipping(0)
      setTax(0)
      setNotes("")
      setIsBarter(false)
    } catch (e: unknown) {
      toast({ title: "Error al crear venta", description: (e instanceof Error ? e.message : String(e)) || "", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="font-heading text-xl font-semibold">Crear venta manual</h1>
              <p className="text-xs text-muted-foreground">Registra ventas offline y gestiona inventario</p>
            </div>
          </div>
          <button
            onClick={submit}
            disabled={
              loading ||
              items.some((i) => (i.available_sizes?.length ? !i.variant_size : false) || (typeof i.stock_available === 'number' && i.stock_available <= 0)) ||
              anyOverStock
            }
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Guardando..." : "Guardar venta"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-5xl mx-auto px-6 py-8 space-y-6">
        
        {/* Detalles de la venta */}
        <div className="bg-background rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-base">Detalles de la venta</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Canal de venta</label>
                <select 
                  value={channel} 
                  onChange={(e) => setChannel(e.target.value as (typeof channels)[number])} 
                  className="w-full border rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {channels.map((c) => (
                    <option key={c} value={c}>{c.replace(/_/g, ' ').charAt(0).toUpperCase() + c.replace(/_/g, ' ').slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Fecha y hora</label>
                <div className="flex gap-2">
                  <input 
                    type="datetime-local" 
                    value={placedAt} 
                    onChange={(e) => setPlacedAt(e.target.value)} 
                    className="flex-1 border rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setPlacedAt(new Date().toISOString().slice(0,16))} 
                    className="px-3 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
                  >
                    Ahora
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Moneda</label>
                <input 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)} 
                  className="w-full border rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cliente</label>
                <CustomerSearchInput
                  value={{ id: customerId, name: customerName, email: customerEmail }}
                  onChange={(c) => {
                    setCustomerId(c?.id || "")
                    setCustomerName(c?.name || "")
                    setCustomerEmail(c?.email || "")
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email <span className="text-muted-foreground font-normal">(opcional)</span></label>
                <input 
                  type="email" 
                  value={customerEmail} 
                  onChange={(e) => setCustomerEmail(e.target.value)} 
                  placeholder="cliente@ejemplo.com"
                  className="w-full border rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-background rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-base">Productos</h2>
            <span className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? 'producto' : 'productos'}</span>
          </div>
          <div className="p-6 space-y-4">
            {items.map((it, idx) => (
              <div key={idx} className="border rounded-lg p-5 space-y-4 bg-muted/30 hover:bg-muted/40 transition-colors">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium">Producto {idx + 1}</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setItems((arr) => {
                        const copy = [...arr]
                        const base = copy[idx]
                        copy.splice(idx + 1, 0, { ...base })
                        return copy
                      })} 
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Duplicar
                    </button>
                    <button 
                      onClick={() => removeItem(idx)} 
                      className="text-xs text-destructive hover:underline font-medium" 
                      disabled={items.length === 1}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Buscar producto</label>
                    <ProductSearchInput
                      value={it.product_id}
                      autoFocus={!it.product_id}
                      onChange={(pid, product) => {
                        updateItem(idx, {
                          product_id: pid,
                          product_name: product?.name,
                          unit_price: Number(product?.price || 0),
                          available_sizes: product?.sizes || undefined,
                        })
                        if (product?.sizes && product.sizes.length) {
                          void (async () => {
                            const res = await fetchItemStock(idx, pid)
                            const sizes = (product.sizes as string[]) || []
                            const sizeStocks = res?.sizeStocks || {}
                            let picked: string | undefined
                            for (const s of sizes) {
                              const st = sizeStocks[s]
                              if (typeof st === 'number' && st > 0) {
                                picked = s
                                break
                              }
                            }
                            updateItem(idx, { variant_size: picked || sizes[0] })
                            void fetchItemStock(idx, pid, picked || sizes[0])
                          })()
                        } else {
                          void fetchItemStock(idx, pid, undefined)
                        }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Talle</label>
                      {it.available_sizes && it.available_sizes.length ? (
                        <div className="flex flex-wrap gap-2">
                          {it.available_sizes.map((s) => {
                            const raw = (it.size_stocks && typeof it.size_stocks[s] === 'number') ? it.size_stocks[s] : undefined
                            const key = `${it.product_id}__${s}`
                            const alreadySelected = selectedCounts.get(key) || 0
                            const thisRowCounts = it.variant_size === s ? 1 : 0
                            const remaining = typeof raw === 'number' ? Math.max(0, raw - (alreadySelected - thisRowCounts)) : 0
                            const disabled = (it.size_loading || !it.size_stocks) ? true : (remaining <= 0)
                            const active = it.variant_size === s
                            return (
                              <button
                                type="button"
                                key={s}
                                disabled={disabled}
                                onClick={() => { updateItem(idx, { variant_size: s }); void fetchItemStock(idx, it.product_id, s) }}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                  active 
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                                    : 'bg-background hover:bg-muted'
                                } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                title={it.size_loading ? 'Cargando stock...' : `Stock ${s}: ${remaining}`}
                              >
                                {s} {it.size_loading ? '...' : `(${remaining})`}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <input 
                          value={it.variant_size || ""} 
                          onChange={(e) => updateItem(idx, { variant_size: e.target.value })} 
                          placeholder="Ej: M, L, XL" 
                          className="w-full border rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                        />
                      )}
                      {typeof it.stock_available === 'number' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Stock disponible {it.variant_size ? `(${it.variant_size})` : ''}: <span className="font-semibold text-foreground">{it.stock_available}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Precio unitario</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={it.unit_price} 
                          onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })} 
                          className="w-full border rounded-lg pl-8 pr-3 py-2.5 bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={addItem} 
              className="w-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 rounded-lg px-4 py-4 text-sm font-medium text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar otro producto
            </button>
          </div>
        </div>

        {/* Ajustes y Resumen */}
        <div className="bg-background rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-base">Ajustes adicionales</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Descuento</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={discount} 
                    onChange={(e) => setDiscount(Number(e.target.value))} 
                    placeholder="0.00"
                    className="w-full border rounded-lg pl-8 pr-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Envío</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={shipping} 
                    onChange={(e) => setShipping(Number(e.target.value))} 
                    placeholder="0.00"
                    className="w-full border rounded-lg pl-8 pr-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Impuesto</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={tax} 
                    onChange={(e) => setTax(Number(e.target.value))} 
                    placeholder="0.00"
                    className="w-full border rounded-lg pl-8 pr-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Notas internas</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Agrega información adicional sobre esta venta..."
                className="w-full border rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] resize-none" 
              />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
              <input 
                id="barter" 
                type="checkbox" 
                checked={isBarter} 
                onChange={(e) => setIsBarter(e.target.checked)} 
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="barter" className="text-sm font-medium cursor-pointer">Esta venta fue un canje (sin pago monetario)</label>
            </div>
          </div>
        </div>

        {/* Resumen Final */}
        <div className="bg-background rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-base">Resumen de la venta</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({items.length} {items.length === 1 ? 'producto' : 'productos'})</span>
                <span className="font-medium tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento</span>
                  <span className="font-medium tabular-nums text-green-600">-${discount.toFixed(2)}</span>
                </div>
              )}
              
              {shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-medium tabular-nums">+${shipping.toFixed(2)}</span>
                </div>
              )}
              
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Impuesto</span>
                  <span className="font-medium tabular-nums">+${tax.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold tabular-nums">${total.toFixed(2)} <span className="text-base font-normal text-muted-foreground">{currency}</span></span>
              </div>
            </div>

            {anyOverStock && (
              <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-destructive">Stock insuficiente</p>
                    <p className="text-xs text-destructive/80 mt-1">Hay más productos seleccionados que stock disponible para algunos talles.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

type CustomerLite = { id: string; name: string; email: string }

function CustomerSearchInput({
  value,
  onChange,
}: {
  value: { id: string; name: string; email: string }
  onChange: (c?: CustomerLite) => void
}) {
  const [q, setQ] = useState("")
  const [list, setList] = useState<CustomerLite[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      if (!q.trim()) {
        setList([])
        setOpen(false)
        return
      }
      try {
        const params = new URLSearchParams({ q, limit: "10" })
        const res = await fetch(`/api/admin/customers/search?${params.toString()}`, { signal: ctrl.signal })
        const json = await res.json()
        if (res.ok) setList((json.customers || []).map((c: { id: string; full_name?: string; email?: string }) => ({ id: c.id, name: c.full_name || "", email: c.email || "" })))
      } catch {}
    }, 200)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [q])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value.name || value.email || q}
        onChange={(e) => {
          setQ(e.target.value)
          if (e.target.value.trim()) {
            setOpen(true)
          }
          onChange(undefined)
        }}
        placeholder="Buscar por nombre o email"
        className="w-full border rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        onFocus={() => {
          if (q.trim() && list.length > 0) {
            setOpen(true)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
      />
      {open && list.length > 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border bg-background shadow-lg max-h-60 overflow-auto">
          {list.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => {
                onChange(c)
                setQ(c.name || c.email)
                setOpen(false)
              }}
              className="w-full text-left px-4 py-3 hover:bg-muted text-sm border-b last:border-b-0 transition-colors"
            >
              <div className="font-medium">{c.name || c.email || c.id}</div>
              {c.email && <div className="text-xs text-muted-foreground mt-0.5">{c.email}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

type ProductLite = { id: string; name: string; price: number; currency: string; sizes?: string[]; stock?: number; category?: string }

function ProductSearchInput({
  value,
  onChange,
  autoFocus,
}: {
  value: string
  onChange: (productId: string, product?: ProductLite) => void
  autoFocus?: boolean
}) {
  const [q, setQ] = useState("")
  const [list, setList] = useState<ProductLite[]>([])
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      if (!q.trim()) {
        setList([])
        setOpen(false)
        return
      }
      try {
        const params = new URLSearchParams({ q, limit: "10" })
        const res = await fetch(`/api/admin/products/search?${params.toString()}`, { signal: ctrl.signal })
        const json = await res.json()
        if (res.ok) setList(json.products || [])
      } catch {}
    }, 200)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [q])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        value={value || q}
        onChange={(e) => {
          setQ(e.target.value)
          if (e.target.value.trim()) {
            setOpen(true)
          }
          onChange("")
        }}
        placeholder="Buscar por nombre, categoría, id o sku"
        className="w-full border rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        onFocus={() => {
          if (q.trim() && list.length > 0) {
            setOpen(true)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && open) {
            e.preventDefault()
            const first = list[0]
            if (first) {
              onChange(first.id, first)
              setQ(first.name)
              setOpen(false)
            }
          }
          if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
      />
      {open && list.length > 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border bg-background shadow-lg max-h-60 overflow-auto">
          {list.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => {
                onChange(p.id, p)
                setQ(p.name)
                setOpen(false)
              }}
              className="w-full text-left px-4 py-3 hover:bg-muted text-sm border-b last:border-b-0 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{p.name}</div>
                {p.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {p.category}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span className="text-muted-foreground/60">{p.id}</span>
                <span>·</span>
                <span className="font-semibold text-foreground">${Number(p.price || 0).toFixed(2)} {p.currency}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
