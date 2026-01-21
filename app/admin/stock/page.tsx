"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getProductsAsync } from "@/lib/repo/products"
import { supabase } from "@/lib/supabase/client"
import type { Product } from "@/types"
import { ChevronDown, ChevronRight, Package, Shirt } from "lucide-react"
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

  // For accessories accordion
  const [expandedAccessory, setExpandedAccessory] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const list = await getProductsAsync({ includeInactive: true }) // Fetch all products to manage stock
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

  // Improved categorization
  const isAccessory = (p: Product) => {
    const cat = (p.category || "").toLowerCase()
    return cat === "accesorios" || cat.includes("gorras") || cat.includes("stickers") || cat.includes("pines")
  }

  const regularProducts = React.useMemo(() =>
    products.filter(p => !isAccessory(p)),
    [products]
  )

  const accessories = React.useMemo(() =>
    products.filter(p => isAccessory(p)),
    [products]
  )

  const allSizesRegular = React.useMemo(() => {
    const set = new Set<string>()
    // Standard sorting for clothing sizes
    const order = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"]
    for (const p of regularProducts) {
      for (const s of p.sizes || []) set.add(s)
    }
    return Array.from(set).sort((a, b) => {
      const idxA = order.indexOf(a)
      const idxB = order.indexOf(b)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return a.localeCompare(b)
    })
  }, [regularProducts])

  const filterList = (list: Product[]) => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q)
    )
  }

  const filteredRegular = React.useMemo(() => filterList(regularProducts), [regularProducts, query])
  const filteredAccessories = React.useMemo(() => filterList(accessories), [accessories, query])

  // --- RENDERERS ---

  const renderClothingTable = (productList: Product[], allSizes: string[], emptyMessage: string) => (
    <div className="overflow-x-auto border rounded bg-background">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted border-b">
            <th className="p-3 text-left font-medium">Producto</th>
            <th className="p-3 text-left font-medium">SKU</th>
            {allSizes.map((s) => (
              <th key={s} className="p-3 text-left font-medium w-20">{s}</th>
            ))}
            <th className="p-3 w-24"></th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td className="p-8 text-center text-muted-foreground" colSpan={3 + allSizes.length}>Cargando inventario...</td></tr>
          )}
          {!loading && productList.length === 0 && (
            <tr><td className="p-8 text-center text-muted-foreground" colSpan={3 + allSizes.length}>{emptyMessage}</td></tr>
          )}
          {productList.map((p) => {
            const row = stocks[p.id] || {}
            return (
              <tr
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`border-b last:border-0 transition-colors ${selectedId === p.id ? "bg-accent/40" : "hover:bg-muted/30"}`}
              >
                <td className="p-3 min-w-[240px]">
                  <div className="font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{p.category}</div>
                </td>
                <td className="p-3 text-xs font-mono">{p.sku || "-"}</td>
                {allSizes.map((s) => {
                  const hasSize = p.sizes.includes(s)
                  return (
                    <td key={s} className="p-2">
                      {hasSize ? (
                        <input
                          type="number"
                          min="0"
                          value={row[s] ?? 0}
                          onChange={(e) => onChangeStock(p.id, s, Number(e.target.value))}
                          onFocus={() => setSelectedId(p.id)}
                          className="w-16 h-8 border rounded px-2 bg-background text-center focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                      ) : (
                        <div className="w-16 h-8 flex items-center justify-center text-muted-foreground/20 text-lg select-none">·</div>
                      )}
                    </td>
                  )
                })}
                <td className="p-2 text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); saveRow(p.id); }}
                    className="h-8 px-3 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    disabled={savingId === p.id}
                  >
                    {savingId === p.id ? "..." : "Guardar"}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  const renderAccessoriesList = (productList: Product[], emptyMessage: string) => {
    if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando accesorios...</div>
    if (productList.length === 0) return <div className="p-8 text-center text-muted-foreground">{emptyMessage}</div>

    return (
      <div className="grid gap-4">
        {productList.map((p) => {
          const isExpanded = expandedAccessory === p.id
          const rowStock = stocks[p.id] || {}
          const sizes = p.sizes || []

          return (
            <div key={p.id} className={`border rounded-lg overflow-hidden transition-all duration-200 ${isExpanded ? "ring-2 ring-primary/20 shadow-md" : "hover:border-primary/50"}`}>
              <div
                className="flex items-center justify-between p-4 bg-card cursor-pointer"
                onClick={() => setExpandedAccessory(isExpanded ? null : p.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/50 rounded-md">
                    <Package className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{p.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground hidden sm:block">
                    {sizes.length} variantes
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t bg-muted/10 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">Gestionar variantes</h4>
                    <button
                      onClick={() => saveRow(p.id)}
                      disabled={savingId === p.id}
                      className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-black/80 disabled:opacity-50"
                    >
                      {savingId === p.id ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {sizes.map((size) => (
                      <div key={size} className="flex items-center justify-between p-2 border rounded bg-background">
                        <span className="text-sm font-medium truncate pr-2" title={size}>{size}</span>
                        <input
                          type="number"
                          min="0"
                          value={rowStock[size] ?? 0}
                          onChange={(e) => onChangeStock(p.id, size, Number(e.target.value))}
                          className="w-20 h-8 border rounded px-2 text-right focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    ))}
                    {sizes.length === 0 && (
                      <div className="col-span-full py-4 text-center text-sm text-muted-foreground">
                        Este producto no tiene variantes/talles definidos.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Gestor de stock</h2>
          <p className="text-muted-foreground">Controla el inventario de todos tus productos.</p>
        </div>
        <div className="w-full sm:w-[300px]">
          <input
            placeholder="Buscar por nombre o SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border rounded-md px-4 py-2 bg-background focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </section>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Shirt className="w-4 h-4" />
            Indumentaria ({regularProducts.length})
          </TabsTrigger>
          <TabsTrigger value="accessories" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Accesorios ({accessories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Vista de matriz para talles estándar (S, M, L, etc).
            </p>
          </div>
          {renderClothingTable(filteredRegular, allSizesRegular, "No se encontraron productos de indumentaria.")}
        </TabsContent>

        <TabsContent value="accessories" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Vista de lista para productos con variantes únicas (Gorras, Pines, etc).
            </p>
          </div>
          {renderAccessoriesList(filteredAccessories, "No se encontraron accesorios.")}
        </TabsContent>
      </Tabs>
    </div>
  )
}
