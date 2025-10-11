import ProductsClient from '@/components/products/ProductsClient'
import { getProductsAsync } from '@/lib/repo/products'
import type { Metadata } from 'next'

export const revalidate = 1800 // Revalidar cada 30 minutos

export function generateMetadata(): Metadata {
  const siteUrl = process.env.SITE_URL || 'https://busy.com.ar'

  return {
    title: 'Shop',
    description:
      'Conseguí nuestros productos online apartir de 5000$, con envíos a todo el país. Desde remeras oversize o jeans baggy hasta accesorios.',
    alternates: {
      canonical: `${siteUrl}/products`,
      languages: {
        'es-AR': `${siteUrl}/products`,
        en: `${siteUrl}/products`,
      },
    },
    openGraph: {
      title: 'Productos de moda',
      description:
        'Conseguí nuestros productos online apartir de 5000$, con envíos a todo el país. Desde remeras oversize o jeans baggy hasta accesorios.',
      url: `${siteUrl}/products`,
      images: [
        {
          url: `${siteUrl}/og/busy-products.png`,
          width: 1200,
          height: 630,
          alt: 'Shop',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Shop',
      description:
        'Conseguí nuestros productos online apartir de 5000$, con envíos a todo el país. Desde remeras oversize o jeans baggy hasta accesorios.',
      images: [`${siteUrl}/og/busy-products.png`],
    },
    keywords: [
      'Busy',
      'Busy Streetwear',
      'ropa urbana',
      'ropa streetwear Mar del Plata',
      'hoodies oversize',
      'remeras oversize',
      'jeans baggy',
      'gorras',
      'accesorios',
      'ropa unisex',
      'tienda online',
    ],
  }
}

export default async function ProductsPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const siteUrl = process.env.SITE_URL || 'https://busy.com.ar'
  
  // Pre-fetch products on server for better LCP
  const initialProducts = await getProductsAsync().catch(() => [])
  
  return (
    <div className="container px-4 py-8 pt-28">
      {/* JSON-LD: CollectionPage + BreadcrumbList (static SSR) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Productos',
            url: `${siteUrl}/products`,
            about: 'coleccion',
            inLanguage: 'es-AR',
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Inicio',
                item: siteUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Productos',
                item: `${siteUrl}/products`,
              },
            ],
          }),
        }}
      />

      <div className="max-w-7xl mx-auto">
        <ProductsClient 
          initialCategory={typeof searchParams?.category === 'string' ? searchParams?.category : undefined}
          initialProducts={initialProducts}
        />
      </div>
    </div>
  )
}
