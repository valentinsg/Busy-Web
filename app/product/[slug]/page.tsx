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

  return {
    title: `${product.name} - Busy`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.map((image) => ({
        url: image,
        alt: product.name,
      })),
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
      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </div>
  )
}
