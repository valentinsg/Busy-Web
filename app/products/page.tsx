import ProductsClient from '@/components/products/ProductsClient'
import { getProductsAsync } from '@/lib/repo/products'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const revalidate = 1800 // Revalidar cada 30 minutos

export function generateMetadata(): Metadata {
  const siteUrl = process.env.SITE_URL || 'https://busy.com.ar'

  return {
    title: 'Tienda Busy Streetwear | Moda Urbana, Básicos y Reventa',
    description:
      'Shop online de Busy Streetwear: básicos propios, marcas amigas y reventa curada. Hoodies, remeras oversize, jeans baggy y accesorios. Envíos a todo Argentina desde Mar del Plata.',
    alternates: {
      canonical: `${siteUrl}/products`,
      languages: {
        'es-AR': `${siteUrl}/products`,
        en: `${siteUrl}/products`,
      },
    },
    openGraph: {
      title: 'Tienda Busy Streetwear | Moda Urbana Argentina',
      description:
        'Shop de Busy: básicos propios, marcas amigas y reventa curada. Hoodies, remeras, jeans y accesorios. Envíos a todo el país.',
      url: `${siteUrl}/products`,
      images: [
        {
          url: `${siteUrl}/busy-og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Tienda Busy Streetwear',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Tienda Busy Streetwear',
      description:
        'Shop de Busy: básicos propios, marcas amigas y reventa curada. Hoodies, remeras, jeans y accesorios.',
      images: [`${siteUrl}/busy-og-image.png`],
    },
    keywords: [
      'busy streetwear',
      'tienda streetwear argentina',
      'ropa urbana mar del plata',
      'hoodies oversize',
      'remeras oversize',
      'jeans baggy',
      'streetwear básicos',
      'marcas amigas',
      'reventa streetwear',
      'ropa unisex',
      'tienda online argentina',
      'cultura urbana',
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
