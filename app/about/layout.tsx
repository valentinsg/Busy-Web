import { generateSEO } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateSEO({
  title: 'Sobre Busy',
  description:
    'Conocé nuestra historia, valores, el compromiso de Busy con la cultura streetwear y lo que fomentamos como comunidad.',
  url: `${process.env.SITE_URL || 'https://busy.com.ar'}/about`,
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
