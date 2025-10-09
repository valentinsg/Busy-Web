import { generateSEO } from '@/lib/seo'
import { generateBreadcrumbSchema } from '@/lib/structured-data'
import type { Metadata } from 'next'

const SITE_URL = process.env.SITE_URL || 'https://busy.com.ar'

export const metadata: Metadata = {
  ...generateSEO({
    title: 'Playlists - Música Urbana Curada',
    description:
      'Con nuestras playlists queremos compartir lo que mas nos gusta de la cultura urbana. Actualizadas y curadas semanalmente, vamos a ayudar y posicionar artistas emergentes desde nuestro espacio.',
    url: `${SITE_URL}/playlists`,
    image: `${SITE_URL}/spotify.png`,
  }),
  alternates: {
    canonical: `${SITE_URL}/playlists`,
    languages: {
      'es-AR': `${SITE_URL}/playlists`,
      'en': `${SITE_URL}/playlists`,
    },
  },
}

export default function PlaylistsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Playlists', url: `${SITE_URL}/playlists` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  )
}
