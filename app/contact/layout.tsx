import { generateSEO } from '@/lib/seo'
import type { Metadata } from 'next'

const siteUrl = process.env.SITE_URL || 'https://busy.com.ar'

export const metadata: Metadata = {
  ...generateSEO({
    title: 'Contacto',
    description:
      'Contactate con nosotros. Visitá nuestro showroom en Mar del Plata, escribinos por WhatsApp o email. Estamos para ayudarte con tus consultas sobre productos, envíos y más.',
    url: `${siteUrl}/contact`,
    image: `${siteUrl}/busy-streetwear.png`,
  }),
  alternates: {
    canonical: `${siteUrl}/contact`,
    languages: {
      'es-AR': `${siteUrl}/contact`,
      en: `${siteUrl}/contact`,
    },
  },
  openGraph: {
    title: 'Contacto',
    description:
      'Visitá nuestro showroom en Mar del Plata o contactanos por WhatsApp. Estamos para ayudarte.',
    url: `${siteUrl}/contact`,
    siteName: 'Busy Streetwear',
    images: [
      {
        url: `${siteUrl}/busy-streetwear.png`,
        width: 1200,
        height: 630,
        alt: 'Contacto - Busy Streetwear',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contacto',
    description: 'Contactate con nosotros. Showroom en Mar del Plata y atención por WhatsApp.',
    images: [`${siteUrl}/busy-streetwear.png`],
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
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
        name: 'Contacto',
        item: `${siteUrl}/contact`,
      },
    ],
  }

  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contacto - Busy Streetwear',
    url: `${siteUrl}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'Busy Streetwear',
      url: siteUrl,
      logo: `${siteUrl}/logo-busy-black.png`,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+54-9-223-682-5268',
          contactType: 'Customer Service',
          email: 'busystreetwear@gmail.com',
          availableLanguage: ['Spanish', 'English'],
          areaServed: 'AR',
        },
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mar del Plata',
        addressRegion: 'Buenos Aires',
        addressCountry: 'AR',
      },
      sameAs: [
        'https://instagram.com/busy_streetwear',
        'https://www.facebook.com/profile.php?id=61581696441351',
        'https://www.tiktok.com/@busy_streetwear',
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      {children}
    </>
  )
}
