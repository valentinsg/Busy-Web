"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getProductsAsync } from "@/lib/repo/products"
import { supabase } from "@/lib/supabase/client"
import type { Product } from "@/types"
import * as React from "react"

type StockMap = Record<string, number>

export default function AdminStockPage() {
  const { toast } = useToast()
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [savingId, setSavingId] = React.useState<string | null>(null)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [stocks, setStocks] = React.useState<Record<string, StockMap>>({})
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const list = await getProductsAsync()
        if (cancelled) return
        setProducts(list)
        const initial: Record<string, StockMap> = {}
        for (const p of list) {
          initial[p.id] = { ...(p.stockBySize || {}) }
        }
        setStocks(initial)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const onChangeStock = (productId: string, size: string, value: number) => {
    setStocks((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [size]: value },
    }))
  }

  const saveRow = async (productId: string) => {
    setSavingId(productId)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")
      const stockBySize = stocks[productId] || {}
      const res = await fetch(`/api/admin/stock/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stockBySize }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error al guardar stock")
      toast({ title: "Stock actualizado", description: "Se guardaron los cambios." })
    } catch (e: unknown) {
      toast({ title: "Error", description: e?.toString() || String(e) })
    } finally {
      setSavingId(null)
    }
  }

  // Separate products and accessories
  const regularProducts = React.useMemo(() =>
    products.filter(p => p.category !== "Accesorios"),
    [products]
  )

  const accessories = React.useMemo(() =>
    products.filter(p => p.category === "Accesorios"),
    [products]
  )

  const allSizesRegular = React.useMemo(() => {
    const set = new Set<string>()
    for (const p of regularProducts) {
      for (const s of p.sizes || []) set.add(s)
    }
    return Array.from(set)
  }, [regularProducts])

  const allSizesAccessories = React.useMemo(() => {
    const set = new Set<string>()
    for (const p of accessories) {
      for (const s of p.sizes || []) set.add(s)
    }
    return Array.from(set)
  }, [accessories])

  const filteredRegular = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return regularProducts
    return regularProducts.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q)
    )
  }, [regularProducts, query])

  const filteredAccessories = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return accessories
    return accessories.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q)
    )
  }, [accessories, query])

  const renderStockTable = (productList: Product[], allSizes: string[], emptyMessage: string) => (
    <div className="overflow-x-auto border rounded">
      <table className="w-full text-base">
        <thead>
          <tr className="bg-muted">
            <th className="p-3 text-left">Producto</th>
            <th className="p-3 text-left">SKU</th>
            {allSizes.map((s) => (
              <th key={s} className="p-3 text-left">{s}</th>
            ))}
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td className="p-4 text-muted-foreground" colSpan={3 + allSizes.length}>Cargando...</td></tr>
          )}
          {!loading && productList.length === 0 && (
            <tr><td className="p-4 text-muted-foreground" colSpan={3 + allSizes.length}>{emptyMessage}</td></tr>
          )}
          {productList.map((p) => {
            const row = stocks[p.id] || {}
            return (
              <tr
                key={p.id}
                onClick={()=> setSelectedId(p.id)}
                className={`border-t border-border cursor-pointer transition-all ${selectedId===p.id ? "ring-4 ring-accent/60 bg-accent/10 shadow-lg" : "hover:bg-accent/5"}`}
              >
                <td className="p-3 min-w-[260px]">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.category}</div>
                </td>
                <td className="p-3">{p.sku || "-"}</td>
                {allSizes.map((s) => (
                  <td key={s} className="p-3">
                    <input
                      type="number"
                      value={row[s] ?? 0}
                      onChange={(e)=> onChangeStock(p.id, s, Number(e.target.value))}
                      onFocus={()=> setSelectedId(p.id)}
                      className="w-24 border rounded px-3 py-2 bg-transparent text-base"
                    />
                  </td>
                ))}
                <td className="p-3 text-right min-w-[140px]">
                  <button
                    onClick={()=> saveRow(p.id)}
                    className="rounded px-4 py-2 border bg-black text-white disabled:opacity-60 text-base"
                    disabled={savingId === p.id}
                  >
                    {savingId === p.id ? "Guardando..." : "Guardar"}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      <section className="flex items-end justify-between gap-6">
        <div>
          <h2 className="font-heading text-2xl font-semibold mb-2">Gestor de stock</h2>
          <p className="font-body text-base text-muted-foreground">Edita el stock por talle rápidamente.</p>
        </div>
        <div className="min-w-[260px]">
          <label className="block text-sm mb-1">Buscar</label>
          <input
            placeholder="Nombre o SKU"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            className="w-full border rounded px-4 py-2.5 bg-transparent text-base"
          />
        </div>
      </section>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products">
            Productos ({regularProducts.length})
          </TabsTrigger>
          <TabsTrigger value="accessories">
            Accesorios ({accessories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Gestiona el stock de remeras, buzos y otros productos de indumentaria
            </p>
          </div>
          {renderStockTable(filteredRegular, allSizesRegular, "Sin productos")}
        </TabsContent>

        <TabsContent value="accessories" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Gestiona el stock de gorras, stickers y otros accesorios
            </p>
          </div>
          {renderStockTable(filteredAccessories, allSizesAccessories, "Sin accesorios")}
        </TabsContent>
      </Tabs>

      <p className="text-sm text-muted-foreground">Tip: haz click en una fila para seleccionarla. La fila seleccionada se resalta.</p>
    </div>
  )
}
