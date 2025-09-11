import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'
export const revalidate = 60 * 60 * 24 // 24 hours

const SITE_URL = process.env.SITE_URL || 'https://busy.com.ar'

export default function robots(): MetadataRoute.Robots {
  const sitemap = `${SITE_URL}/sitemap.xml`
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap,
    host: SITE_URL,
  }
}
