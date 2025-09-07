import { getProductsAsync } from "@/lib/repo/products"
import { ProductCard } from "@/components/shop/product-card"
import type { Product } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const products: Product[] = await getProductsAsync({})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold">Productos</h2>
        <a href="/admin/products/new" className="text-sm underline">Nuevo producto</a>
      </div>

      {products.length === 0 ? (
        <p className="font-body text-muted-foreground">No hay productos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="relative">
              <ProductCard product={p} />
              <div className="absolute top-2 right-2 flex gap-2">
                <a href={`/admin/products/${p.id}`} className="text-xs font-body underline">Editar</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
