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
          sizes.map((s: any) => [s.size, Number(s.stock || 0)])
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

  const anyOverStock = items.some((it, idx) => {
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
    } catch (e: any) {
      toast({ title: "Error al crear venta", description: e?.message || "", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Venta manual</h1>
          <p className="text-sm text-muted-foreground">Registra ventas fuera de la web y descuenta stock.</p>
        </div>
        <Link href="/admin" className="text-sm text-primary underline-offset-2 hover:underline">
          Volver al panel
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4 space-y-3 md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground">Canal</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value as any)} className="border rounded px-2 py-1 bg-background">
                {channels.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground">Cliente</label>
              <CustomerSearchInput
                value={{ id: customerId, name: customerName, email: customerEmail }}
                onChange={(c) => {
                  setCustomerId(c?.id || "")
                  setCustomerName(c?.name || "")
                  setCustomerEmail(c?.email || "")
                }}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground">Fecha</label>
              <div className="flex gap-2">
                <input type="datetime-local" value={placedAt} onChange={(e) => setPlacedAt(e.target.value)} className="border rounded px-2 py-1 bg-background" />
                <button type="button" onClick={() => setPlacedAt(new Date().toISOString().slice(0,16))} className="rounded bg-muted px-2 text-xs">Ahora</button>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground">Nombre cliente (opcional)</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="border rounded px-2 py-1 bg-background" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground">Email cliente (opcional)</label>
              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="border rounded px-2 py-1 bg-background" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-medium">Ítems</div>
            {items.map((it, idx) => (
              <div key={idx} className="grid md:grid-cols-6 gap-2 border rounded p-3 items-end bg-muted/5">
                <div className="md:col-span-3">
                  <label className="text-xs text-muted-foreground">Producto</label>
                  <ProductSearchInput
                    value={it.product_id}
                    autoFocus={!it.product_id}
                    onChange={(pid, product) => {
                      updateItem(idx, {
                        product_id: pid,
                        product_name: product?.name,
                        unit_price: Number(product?.price || 0),
                        available_sizes: (product?.sizes as any) || undefined,
                      })
                      // Auto-select first size with stock > 0 using freshly fetched data
                      if (product?.sizes && product.sizes.length) {
                        void (async () => {
                          const res = await fetchItemStock(idx, pid)
                          const sizes = (product.sizes as any as string[]) || []
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
                <div>
                  <label className="text-xs text-muted-foreground">Nombre (opcional)</label>
                  <input value={it.product_name || ""} onChange={(e) => updateItem(idx, { product_name: e.target.value })} className="w-full border rounded px-2 py-1 bg-background" />
                </div>
                {/* Color removido según pedido */}
                <div>
                  <label className="text-xs text-muted-foreground">Talle</label>
                  {it.available_sizes && it.available_sizes.length ? (
                    <div className="flex flex-wrap gap-2">
                      {it.available_sizes.map((s) => {
                        const raw = (it.size_stocks && typeof it.size_stocks[s] === 'number') ? it.size_stocks[s] : undefined
                        const key = `${it.product_id}__${s}`
                        const alreadySelected = selectedCounts.get(key) || 0
                        const thisRowCounts = it.variant_size === s ? 1 : 0
                        // Treat undefined stock for a size as 0 (no stock)
                        const remaining = typeof raw === 'number' ? Math.max(0, raw - (alreadySelected - thisRowCounts)) : 0
                        // Disable if loading or if there is no remaining stock for that size
                        const disabled = (it.size_loading || !it.size_stocks)
                          ? true
                          : (remaining <= 0)
                        const active = it.variant_size === s
                        return (
                          <button
                            type="button"
                            key={s}
                            disabled={disabled}
                            onClick={() => { updateItem(idx, { variant_size: s }); void fetchItemStock(idx, it.product_id, s) }}
                            className={`px-2 py-1 rounded border text-xs ${active ? 'bg-primary text-primary-foreground' : 'bg-background'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted'}`}
                            title={it.size_loading ? 'Cargando stock...' : `Stock ${s}: ${remaining}`}
                          >
                            {s}{it.size_loading ? ' • ...' : ` • ${remaining}`}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <input value={it.variant_size || ""} onChange={(e) => updateItem(idx, { variant_size: e.target.value })} placeholder="p.ej. M" className="w-full border rounded px-2 py-1 bg-background" />
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Precio</label>
                  <input type="number" step="0.01" value={it.unit_price} onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })} className="w-full border rounded px-2 py-1 bg-background" />
                  {typeof it.stock_available === 'number' && (
                    <div className="text-[11px] text-muted-foreground mt-1">Stock {it.variant_size ? `(${it.variant_size})` : ''}: {it.stock_available}</div>
                  )}
                </div>
                <div className="md:col-span-7 flex justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeItem(idx)} className="text-sm text-red-600 hover:underline" disabled={items.length === 1}>Eliminar</button>
                    <button onClick={() => setItems((arr) => {
                      const copy = [...arr]
                      const base = copy[idx]
                      copy.splice(idx + 1, 0, { ...base })
                      return copy
                    })} className="text-sm text-muted-foreground hover:underline">Duplicar</button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addItem} className="rounded bg-muted px-3 py-1 text-sm hover:bg-muted/80">Agregar ítem</button>
          </div>
        </div>

        <div className="rounded border p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Moneda</label>
              <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border rounded px-2 py-1 bg-background" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Descuento</label>
              <input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full border rounded px-2 py-1 bg-background" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Envío</label>
              <input type="number" step="0.01" value={shipping} onChange={(e) => setShipping(Number(e.target.value))} className="w-full border rounded px-2 py-1 bg-background" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Impuesto</label>
              <input type="number" step="0.01" value={tax} onChange={(e) => setTax(Number(e.target.value))} className="w-full border rounded px-2 py-1 bg-background" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Notas</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded px-2 py-1 bg-background min-h-[80px]" />
          </div>
          <div className="flex items-center gap-2">
            <input id="barter" type="checkbox" checked={isBarter} onChange={(e) => setIsBarter(e.target.checked)} />
            <label htmlFor="barter" className="text-sm">Fue canje</label>
          </div>

          <div className="border-t pt-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">${" "}{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Total</span><span className="tabular-nums font-medium">${" "}{total.toFixed(2)}</span></div>
          </div>

          <button
            onClick={submit}
            disabled={
              loading ||
              items.some((i) => (i.available_sizes?.length ? !i.variant_size : false) || (typeof i.stock_available === 'number' && i.stock_available <= 0)) ||
              anyOverStock
            }
            className="w-full rounded bg-primary text-primary-foreground px-3 py-2 text-sm disabled:opacity-60"
          >
            {loading ? "Creando..." : "Crear venta"}
          </button>
          {anyOverStock && (
            <div className="text-xs text-red-500">Hay más ítems seleccionados que stock disponible para algún talle.</div>
          )}
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

  useEffect(() => {
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q, limit: "10" })
        const res = await fetch(`/api/admin/customers/search?${params.toString()}`, { signal: ctrl.signal })
        const json = await res.json()
        if (res.ok) setList((json.customers || []).map((c: any) => ({ id: c.id, name: c.full_name || "", email: c.email || "" })))
      } catch {}
    }, 200)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [q])

  return (
    <div className="relative">
      <input
        value={value.name || value.email || q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
          onChange(undefined)
        }}
        placeholder="Buscar por nombre o email"
        className="w-full border rounded px-2 py-1 bg-background"
        onFocus={() => setOpen(true)}
      />
      {open && list.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded border bg-background shadow">
          {list.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => {
                onChange(c)
                setQ(c.name || c.email)
                setOpen(false)
              }}
              className="w-full text-left px-2 py-1 hover:bg-muted text-sm"
            >
              <div className="font-medium">{c.name || c.email || c.id}</div>
              {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

type ProductLite = { id: string; name: string; price: number; currency: string; sizes?: string[]; stock?: number }

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

  useEffect(() => {
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q, limit: "10" })
        const res = await fetch(`/api/admin/products/search?${params.toString()}`, { signal: ctrl.signal })
        const json = await res.json()
        if (res.ok) setList(json.products || [])
        // If user typed exact id/sku/name and the first result id matches exactly, auto-pick on Enter-like behavior
        const first = (json.products || [])[0]
        if (first && q && (first.id === q || String(first.sku || "") === q)) {
          // do not auto pick immediately; wait for Enter. We'll store list and handle onKeyDown
        }
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

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value || q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
          onChange("")
        }}
        placeholder="Buscar por id, nombre o sku"
        className="w-full border rounded px-2 py-1 bg-background"
        onFocus={() => setOpen(true)}
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
        }}
      />
      {open && list.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded border bg-background shadow">
          {list.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => {
                onChange(p.id, p)
                setQ(p.name)
                setOpen(false)
              }}
              className="w-full text-left px-2 py-1 hover:bg-muted text-sm"
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.id} · ${" "}{Number(p.price || 0).toFixed(2)} {p.currency}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
