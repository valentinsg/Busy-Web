import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    mdxRs: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '64.media.tumblr.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
      },
    ],
  },
  productionBrowserSourceMaps: false,
  async redirects() {
    return [
      // Force non-www (www.busy.com.ar -> busy.com.ar)
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'www.busy.com.ar' },
        ],
        destination: 'https://busy.com.ar/:path*',
        permanent: true,
      },
      // Blog legacy slug -> new slug
      {
        source: '/blog/cuidar-tus-prendas',
        destination: '/blog/guia-para-cuidar-tu-ropa',
        permanent: true,
      },
      // FAQs alias
      {
        source: '/faqs',
        destination: '/faq',
        permanent: true,
      },
    ]
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    if (!isProd) {
      // In development, avoid adding HSTS or indexing headers to prevent sticky browser behavior
      return []
    }
    return [
      {
        source: '/:all*(js|css|png|jpg|jpeg|gif|svg|webp|ico|ttf|otf|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Prevent indexing of font files via X-Robots-Tag
      {
        source: '/:all*(woff|woff2|ttf|otf)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      // Prevent indexing of favicon (requested)
      {
        source: '/favicon.ico',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      // Security: HSTS (enforce HTTPS on supporting browsers)
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  },
}

const withMDX = createMDX({
  options: {
    // Global MDX remark plugins
    remarkPlugins: [remarkGfm, remarkBreaks],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
