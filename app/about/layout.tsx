import type { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'

export const metadata: Metadata = generateSEO({
  title: 'Sobre Busy',
  description:
    'Conocé la historia, valores y compromiso de Busy con el streetwear de calidad y diseño.',
  url: `${process.env.SITE_URL || 'https://busy.com.ar'}/about`,
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
