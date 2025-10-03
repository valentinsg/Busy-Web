import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Playlists | Busy Clothing - Música para tu estilo',
  description:
    'Descubrí nuestras playlists de Spotify cuidadosamente seleccionadas. Hip hop old school, trap y más. Actualizadas semanalmente con los mejores tracks.',
  keywords: [
    'busy playlists',
    'música busy',
    'spotify busy',
    'hip hop playlist',
    'trap playlist',
    'música urbana',
    'playlists argentina',
  ],
  openGraph: {
    title: 'Playlists | Busy Clothing',
    description:
      'Música cuidadosamente seleccionada para acompañar tu estilo. Actualizadas cada semana.',
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
    title: 'Playlists | Busy Clothing',
    description:
      'Música cuidadosamente seleccionada para acompañar tu estilo. Actualizadas cada semana.',
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
