import Link from "next/link"
import { getProductsAsync } from "@/lib/repo/products"
import { ProductCard } from "@/components/shop/product-card"
import type { Product } from "@/lib/types"
import ProductFeatureToggle from "@/components/admin/product-feature-toggle"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function AdminProductsPage() {
  const products: Product[] = await getProductsAsync({ sortBy: "newest" })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-heading text-lg sm:text-xl font-semibold">Productos</h2>
        <Link href="/admin/products/new" className="text-xs sm:text-sm underline hover:no-underline">+ Nuevo producto</Link>
      </div>

      {products.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground">No hay productos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <div key={p.id} className="relative space-y-2">
              <ProductCard product={p} adminEditHref={`/admin/products/${p.id}`} />
              <div className="flex gap-2 flex-wrap">
                <ProductFeatureToggle productId={p.id} initialFeatured={(p.tags || []).includes("featured")} initialTags={p.tags} />
                <Link href={`/admin/products/${p.id}`} className="text-xs underline hover:no-underline">Editar</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
