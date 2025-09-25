/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '64.media.tumblr.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
      },
      {
        protocol: 'https',
        hostname: 'wbqbupxoyzczwroqzklj.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/blog/cuidar-tus-prendas',
        destination: '/blog/guia-para-cuidar-tu-ropa',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
