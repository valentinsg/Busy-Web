import { generateSEO } from '@/lib/seo'
import type { Metadata } from 'next'

const SITE_URL = process.env.SITE_URL || 'https://busy.com.ar'

export const metadata: Metadata = {
  ...generateSEO({
    title: 'Sobre Busy - Historia y Valores',
    description:
      'Conocé nuestra historia, valores, el compromiso de Busy con la cultura de la moda y lo que fomentamos como comunidad. Roadmap 2023-2026.',
    url: `${SITE_URL}/about`,
  }),
  alternates: {
    canonical: `${SITE_URL}/about`,
    languages: {
      'es-AR': `${SITE_URL}/about`,
      'en': `${SITE_URL}/about`,
    },
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Structured Data para la página About */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'Sobre Busy Streetwear',
            description: 'Historia, valores y roadmap de Busy Streetwear desde 2023',
            url: `${SITE_URL}/about`,
            mainEntity: {
              '@type': 'Organization',
              name: 'Busy Streetwear',
              foundingDate: '2023',
              foundingLocation: {
                '@type': 'Place',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Mar del Plata',
                  addressRegion: 'Buenos Aires',
                  addressCountry: 'AR',
                },
              },
              description: 'Marca de streetwear auténtico que representa a los que hacen',
              slogan: 'Busy hace para los que hacen',
            },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Inicio',
                  item: SITE_URL,
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Sobre Nosotros',
                  item: `${SITE_URL}/about`,
                },
              ],
            },
          }),
        }}
      />
      {children}
    </>
  )
}
