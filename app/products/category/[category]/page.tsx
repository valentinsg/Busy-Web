import ProductsClient from '@/components/products/ProductsClient'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const siteUrl = process.env.SITE_URL || 'https://busy.com.ar'
  const cat = params.category
  const title = `Productos: ${cat}`
  return {
    title,
    description: `Explorá ${cat} en Busy` ,
    alternates: {
      canonical: `${siteUrl}/products/category/${cat}`,
    },
    openGraph: {
      title,
      url: `${siteUrl}/products/category/${cat}`,
      images: [
        { url: `${siteUrl}/og/busy-products.png`, width: 1200, height: 630, alt: title },
      ],
    },
  }
}

export default function ProductsByCategoryPage({ params }: { params: { category: string } }) {
  return (
    <div className="container px-4 py-8 pt-28">
      <div className="max-w-7xl mx-auto">
        <ProductsClient initialCategory={params.category} />
      </div>
    </div>
  )
}
