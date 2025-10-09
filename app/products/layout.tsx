import { generateSEO } from '@/lib/seo'
import { generateBreadcrumbSchema, generateCollectionSchema } from '@/lib/structured-data'
import type { Metadata } from 'next'

const SITE_URL = process.env.SITE_URL || 'https://busy.com.ar'

export const metadata: Metadata = {
  ...generateSEO({
    title: 'Productos - Tienda Streetwear',
    description:
      'Comprá ropa streetwear online: hoodies, remeras, pantalones y más. Envíos a todo el país. Diseños únicos que representan la cultura urbana.',
    url: `${SITE_URL}/products`,
  }),
  alternates: {
    canonical: `${SITE_URL}/products`,
    languages: {
      'es-AR': `${SITE_URL}/products`,
      'en': `${SITE_URL}/products`,
    },
  },
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Productos', url: `${SITE_URL}/products` },
  ])

  const collectionSchema = generateCollectionSchema({
    name: 'Productos Busy Streetwear',
    description: 'Colección completa de ropa streetwear: hoodies, remeras, pantalones y accesorios',
    url: `${SITE_URL}/products`,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {children}
    </>
  )
}
