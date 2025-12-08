import createMDX from '@next/mdx'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

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
    // Modern formats: AVIF first (better compression), WebP fallback
    formats: ['image/avif', 'image/webp'],

    // OPTIMIZED: Reduced from 16 to 6 widths = 62.5% fewer transformations
    // Strategic widths covering mobile (384, 640), tablet (828), desktop (1200, 1920, 2048)
    deviceSizes: [640, 828, 1200, 1920, 2048],
    imageSizes: [384], // Only one small size for icons/thumbnails

    // Cache optimized images for 1 year (immutable)
    minimumCacheTTL: 31536000,

    // SVG handling
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Remote patterns for Supabase Storage + R2 archive bucket
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev', // Allow all R2 public URLs (pub-*.r2.dev)
      },
    ],

    // Disable device size optimization to use exact widths
    // This prevents Next.js from generating additional sizes
    unoptimized: false,
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
      // SEO landing pages -> real category pages
      {
        source: '/products/hoodies',
        destination: '/products/category/buzos',
        permanent: true,
      },
      {
        source: '/products/tshirts',
        destination: '/products/category/remeras',
        permanent: true,
      },
      {
        source: '/products/pants',
        destination: '/products/category/pantalones',
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
      // Next.js Image Optimization API - aggressive caching
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Static assets
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
