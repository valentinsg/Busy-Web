import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ProductDetail } from "@/components/shop/product-detail"
import { getProductById, getProductsByCategory } from "@/lib/products"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = getProductById(params.slug)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  const base = process.env.SITE_URL || "https://busy.com.ar"
  const canonical = `${base}/product/${product.id}`

  return {
    title: `${product.name} - Busy`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      url: canonical,
      images: product.images.map((image) => ({
        url: image,
        alt: product.name,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - Busy`,
      description: product.description,
      images: product.images.length ? [product.images[0]] : undefined,
    },
    alternates: {
      canonical,
    },
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductById(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="container px-4 py-8 pt-20">
      {/* JSON-LD Product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.images,
            sku: product.id,
            brand: {
              "@type": "Brand",
              name: "Busy",
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              price: product.price,
              availability: "https://schema.org/InStock",
              url: `${process.env.SITE_URL || "https://busy.com.ar"}/product/${product.id}`,
            },
          }),
        }}
      />
      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </div>
  )
}
