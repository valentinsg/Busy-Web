import type { MetadataRoute } from 'next'

const SITE_URL = process.env.SITE_URL || 'https://busy.com.ar'

export default function robots(): MetadataRoute.Robots {
  const sitemap = `${SITE_URL}/sitemap.xml`
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/*.woff2', '/favicon.ico'],
      },
    ],
    sitemap,
    host: (() => {
      try {
        return new URL(SITE_URL).host
      } catch {
        return 'busy.com.ar'
      }
    })(),
  }
}
