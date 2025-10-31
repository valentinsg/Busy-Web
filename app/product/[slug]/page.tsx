import { ProductDetail } from "@/components/shop/product-detail"
import { getProductById, getProductsByCategory } from "@/lib/products"
import { getProductByIdAsync, getProductsAsync } from "@/lib/repo/products"
import type { Product } from "@/lib/types"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  // Prefer Supabase data (includes measurementsBySize), fallback to local JSON
  let product: Product | undefined
  try {
    product = await getProductByIdAsync(params.slug)
  } catch {}
  if (!product) {
    product = getProductById(params.slug)
  }

  if (!product) {
    return {
      title: "Producto no encontrado",
    }
  }

  const base = process.env.SITE_URL || "https://busy.com.ar"
  const safeProduct = product as Product
  const canonical = `${base}/product/${safeProduct.id}`

  return {
    title: `🔥 ${safeProduct.name}`,
    description: safeProduct.description,
    openGraph: {
      title: safeProduct.name,
      description: safeProduct.description,
      url: canonical,
      images: safeProduct.images.map((image) => ({
        url: image,
        alt: safeProduct.name,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${safeProduct.name} - Busy`,
      description: safeProduct.description,
      images: safeProduct.images.length ? [safeProduct.images[0]] : undefined,
    },
    alternates: {
      canonical,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Prefer Supabase data, fallback to local JSON
  let product: Product | undefined
  try {
    product = await getProductByIdAsync(params.slug)
  } catch {}
  if (!product) {
    product = getProductById(params.slug)
  }

  if (!product) {
    notFound()
  }

  // After notFound(), assert product is defined for TypeScript
  const currentProduct = product as Product

  let relatedProducts: Product[] = getProductsByCategory(currentProduct.category)
    .filter((p) => p.id !== currentProduct.id)
    .slice(0, 4)

  try {
    const sameCategory = await getProductsAsync({ category: currentProduct.category })
    relatedProducts = sameCategory.filter((p) => p.id !== currentProduct.id).slice(0, 4)
  } catch {}

  // Fallback: if there are not enough related items, fill with newest products
  if (!relatedProducts || relatedProducts.length === 0) {
    try {
      const newest = await getProductsAsync({})
      relatedProducts = newest.filter((p) => p.id !== currentProduct.id).slice(0, 4)
    } catch {}
  }

  return (
    <div className="container px-4 py-6 pt-20 sm:py-8 sm:pt-28 font-body">
      {/* JSON-LD Product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: currentProduct.name,
            description: currentProduct.description,
            image: currentProduct.images,
            sku: currentProduct.id,
            brand: {
              "@type": "Brand",
              name: "Busy",
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "ARS",
              price: currentProduct.price,
              availability: "https://schema.org/InStock",
              url: `${process.env.SITE_URL || "https://busy.com.ar"}/product/${currentProduct.id}`,
            },
          }),
        }}
      />
      {/* JSON-LD Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Inicio",
                item: process.env.SITE_URL || "https://busy.com.ar",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Productos",
                item: `${process.env.SITE_URL || "https://busy.com.ar"}/products`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: currentProduct.name,
                item: `${process.env.SITE_URL || "https://busy.com.ar"}/product/${currentProduct.id}`,
              },
            ],
          }),
        }}
      />
      <ProductDetail product={currentProduct} relatedProducts={relatedProducts} />
    </div>
  )
}
