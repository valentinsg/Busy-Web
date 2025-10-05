import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Playlists',
  description:
    'Con nuestras playlists queremos compartir lo que mas nos gusta de la cultura urbana. Actualizadas y curadas semanalmente, vamos a ayudar y posicionar artistas emergentes desde nuestro espacio.',
  keywords: [
    'playlists',
    'spotify',
    'música',
    'hip hop',
    'trap',
    'r&b',
    'busy',
    'streetwear',
    'cultura urbana',
  ],
  openGraph: {
    title: 'Playlists',
    description:
      'Con nuestras playlists queremos compartir lo que mas nos gusta de la cultura urbana. Actualizadas y curadas semanalmente, buscamos ayudar a posicionar artistas emergentes desde nuestro espacio.',
    type: 'website',
    images: [
      {
        url: '/spotify.png',
        width: 1200,
        height: 630,
        alt: 'Busy Playlists',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playlists',
    description:
      'Con nuestras playlists queremos compartir lo que mas nos gusta de la cultura urbana. Actualizadas y curadas semanalmente, buscamos ayudar a posicionar artistas emergentes desde nuestro espacio.',
    images: ['/spotify.png'],
  },
}

export default function PlaylistsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
