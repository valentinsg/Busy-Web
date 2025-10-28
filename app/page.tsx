import { AutoSliderBanner } from '@/components/home/auto-slider-banner'
import { FeaturedProducts } from '@/components/home/featured-products'
import HomeLatestBlog from '@/components/home/latest-blog'
import HomeClient from '@/components/home/home-client'
import { getProductsAsync } from '@/lib/repo/products'

export const revalidate = 3600 // Revalidar cada hora

export default async function Home() {
  // Pre-fetch products on server for better LCP
  const featuredProducts = await getProductsAsync({ featuredOnly: true, sortBy: 'newest' }).then(list => list.slice(0,4)).catch(() => [])

  return (
    <div className="flex flex-col overflow-x-hidden">
      <AutoSliderBanner />

      {/* Latest Collection - Server-rendered for better LCP */}
      <FeaturedProducts products={featuredProducts} />
      
      {/* Client-side sections with i18n and animations */}
      <HomeClient />

      {/* Latest Blog Section */}
      <HomeLatestBlog />
    </div>
  )
}
