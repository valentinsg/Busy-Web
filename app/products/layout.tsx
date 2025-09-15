import type { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'

export const metadata: Metadata = generateSEO({
  title: 'Productos',
  description:
    'Explora nuestra colección de streetwear: hoodies, remeras y accesorios con diseño y calidad premium.',
  url: `${process.env.SITE_URL || 'https://busy.com.ar'}/products`,
})

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
