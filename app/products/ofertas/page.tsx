import ProductsClient from '@/components/products/ProductsClient'
import { getProductsAsync } from '@/lib/repo/products'
import type { Metadata } from 'next'

export const revalidate = 1800 // Revalidar cada 30 minutos

export function generateMetadata(): Metadata {
  const siteUrl = process.env.SITE_URL || 'https://busy.com.ar'

  return {
    title: 'Ofertas - Productos en Descuento',
    description:
      'Aprovechá nuestras ofertas especiales en productos seleccionados. Descuentos exclusivos en remeras, buzos y accesorios de streetwear.',
    alternates: {
      canonical: `${siteUrl}/products/ofertas`,
      languages: {
        'es-AR': `${siteUrl}/products/ofertas`,
        en: `${siteUrl}/products/ofertas`,
      },
    },
    openGraph: {
      title: 'Ofertas - Productos en Descuento',
      description:
        'Aprovechá nuestras ofertas especiales en productos seleccionados. Descuentos exclusivos en remeras, buzos y accesorios de streetwear.',
      url: `${siteUrl}/products/ofertas`,
      images: [
        {
          url: `${siteUrl}/og/busy-products.png`,
          width: 1200,
          height: 630,
          alt: 'Ofertas Busy Streetwear',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Ofertas - Productos en Descuento',
      description:
        'Aprovechá nuestras ofertas especiales en productos seleccionados. Descuentos exclusivos en remeras, buzos y accesorios de streetwear.',
      images: [`${siteUrl}/og/busy-products.png`],
    },
    keywords: [
      'ofertas streetwear',
      'descuentos busy',
      'promociones ropa urbana',
      'ofertas remeras',
      'ofertas buzos',
      'descuentos accesorios',
      'ropa en oferta',
      'streetwear barato',
    ],
  }
}

export default async function OfertasPage() {
  const siteUrl = process.env.SITE_URL || 'https://busy.com.ar'
  
  // Pre-fetch products on server
  const initialProducts = await getProductsAsync().catch(() => [])
  
  return (
    <div className="container px-4 py-8 pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Ofertas',
            url: `${siteUrl}/products/ofertas`,
            about: 'Productos en descuento',
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
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Ofertas',
                item: `${siteUrl}/products/ofertas`,
              },
            ],
          }),
        }}
      />

      <div className="max-w-7xl mx-auto">
        <ProductsClient 
          initialCategory="ofertas"
          initialProducts={initialProducts}
        />
      </div>
    </div>
  )
}
