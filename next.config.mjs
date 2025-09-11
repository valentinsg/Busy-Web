import createMDX from '@next/mdx'
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
    unoptimized: true,
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
    ]
  },
  async headers() {
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
    ]
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
