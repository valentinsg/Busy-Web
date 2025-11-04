import { generateSEO } from '@/lib/seo'
import type { Metadata } from 'next'

const SITE_URL = process.env.SITE_URL || 'https://busy.com.ar'

export const metadata: Metadata = {
  ...generateSEO({
    title:
      'Historia de Busy Streetwear – Fundada en Mar del Plata por Valentín S. Guevara y Agustín B. Molina',
    description:
      'Conocé la historia de Busy Streetwear: marca argentina de cultura urbana nacida en Mar del Plata en 2024. Fundada por Valentín Sánchez Guevara y Agustín Bernardo Molina. Roadmap 2024-2026: de showroom a primer local físico.',
    url: `${SITE_URL}/about`,
    image: '/busy-og-image.png',
  }),
  alternates: {
    canonical: `${SITE_URL}/about`,
    languages: {
      'es-AR': `${SITE_URL}/about`,
      en: `${SITE_URL}/about`,
    },
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Structured Data para la página About */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'AboutPage',
              name: 'Historia de Busy Streetwear',
              description:
                'Historia completa de Busy Streetwear: fundadores, roadmap 2024-2026 y valores de marca',
              url: `${SITE_URL}/about`,
              mainEntity: {
                '@type': 'Organization',
                name: 'Busy Streetwear',
                foundingDate: '2024',
                founder: [
                  {
                    '@type': 'Person',
                    name: 'Valentín Sánchez Guevara',
                    jobTitle: 'Fundador, Programador, Director Creativo',
                    description:
                      'Fundador de Busy Streetwear, responsable de la idea de Busy, el desarrollo web y estrategia digital',
                  },
                  {
                    '@type': 'Person',
                    name: 'Agustín Bernardo Molina',
                    jobTitle: 'Co-fundador, Diseñador y embajador',
                    description:
                      'Co-fundador de Busy Streetwear, responsable del diseño de productos y dirección de la marca',
                  },
                ],
                foundingLocation: {
                  '@type': 'Place',
                  name: 'Mar del Plata, Buenos Aires, Argentina',
                },
                description:
                  'Marca argentina de cultura urbana que combina moda, contenido y comunidad. Más que ropa: cultura, música, básquet y actitud.',
                slogan: 'Busy hace para los que hacen',
                url: SITE_URL,
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
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: '¿Qué significa ser Busy?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Ser Busy no se trata de trabajar sin parar, sino de vivir con propósito, curiosidad y disfrute. Es una actitud consciente hacia la vida, no productivista.',
                  },
                },
                {
                  '@type': 'Question',
                  name: '¿Quiénes fundaron Busy Streetwear?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Busy Streetwear fue fundada en 2024 por Valentín Sánchez Guevara (programador y estrategia digital) y Agustín Bernardo Molina (diseñador y dirección creativa) en Mar del Plata, Argentina.',
                  },
                },
                {
                  '@type': 'Question',
                  name: '¿Dónde está ubicado Busy Streetwear?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Actualmente tenemos un showroom provisional en María Curie 5457, Mar del Plata. Nuestro plan es abrir el primer local físico en 2026.',
                  },
                },
                {
                  '@type': 'Question',
                  name: '¿Busy es solo una marca de ropa?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No. Busy es una plataforma creativa que combina moda, contenido editorial, playlists de Spotify, podcast (Busy Talks), eventos culturales y comunidad. Impulsamos artistas emergentes y cultura urbana real.',
                  },
                },
                {
                  '@type': 'Question',
                  name: '¿Cuál es el roadmap de Busy para 2026?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Para 2026 planeamos abrir nuestro primer local físico, producir eventos culturales, lanzar la app Busy, desarrollar un equipo de básquet propio y consolidar Busy Talks como podcast referente de cultura urbana.',
                  },
                },
              ],
            },
          ]),
        }}
      />
      {children}
    </>
  )
}
