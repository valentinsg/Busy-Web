import type { MetadataRoute } from 'next'
import getServiceClient from '@/lib/supabase/server'
import { getAllPostsAsync } from '@/lib/blog'

const SITE_URL = process.env.SITE_URL || 'https://busy.com.ar'

function getStaticRoutes() {
  const now = new Date().toISOString()
  const monthly = 'monthly' as const
  const weekly = 'weekly' as const
  const daily = 'daily' as const

  const createLang = (path: string) => ({ 'es-AR': `${SITE_URL}${path}`, en: `${SITE_URL}${path}` })
  
  return [
    // Home - Highest priority
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: daily, priority: 1.0, alternates: { languages: createLang('/') } },
    
    // Main pages - High priority
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: weekly, priority: 0.9, alternates: { languages: createLang('/products') } },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: weekly, priority: 0.8, alternates: { languages: createLang('/blog') } },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: monthly, priority: 0.7, alternates: { languages: createLang('/about') } },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: monthly, priority: 0.7, alternates: { languages: createLang('/contact') } },
    
    // Product categories
    { url: `${SITE_URL}/products/hoodies`, lastModified: now, changeFrequency: weekly, priority: 0.8, alternates: { languages: createLang('/products/hoodies') } },
    { url: `${SITE_URL}/products/tshirts`, lastModified: now, changeFrequency: weekly, priority: 0.8, alternates: { languages: createLang('/products/tshirts') } },
    { url: `${SITE_URL}/products/pants`, lastModified: now, changeFrequency: weekly, priority: 0.8, alternates: { languages: createLang('/products/pants') } },
    { url: `${SITE_URL}/products/category/buzos`, lastModified: now, changeFrequency: weekly, priority: 0.7, alternates: { languages: createLang('/products/category/buzos') } },
    { url: `${SITE_URL}/products/category/remeras`, lastModified: now, changeFrequency: weekly, priority: 0.7, alternates: { languages: createLang('/products/category/remeras') } },
    { url: `${SITE_URL}/products/category/pantalones`, lastModified: now, changeFrequency: weekly, priority: 0.7, alternates: { languages: createLang('/products/category/pantalones') } },
    
    // Utility pages
    { url: `${SITE_URL}/cart`, lastModified: now, changeFrequency: monthly, priority: 0.5, alternates: { languages: createLang('/cart') } },
    { url: `${SITE_URL}/checkout`, lastModified: now, changeFrequency: monthly, priority: 0.4, alternates: { languages: createLang('/checkout') } },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: monthly, priority: 0.6, alternates: { languages: createLang('/faq') } },
    
    // Legal pages
    { url: `${SITE_URL}/legal/cookies`, lastModified: now, changeFrequency: monthly, priority: 0.3, alternates: { languages: createLang('/legal/cookies') } },
    { url: `${SITE_URL}/legal/privacy`, lastModified: now, changeFrequency: monthly, priority: 0.3, alternates: { languages: createLang('/legal/privacy') } },
    { url: `${SITE_URL}/legal/terms`, lastModified: now, changeFrequency: monthly, priority: 0.3, alternates: { languages: createLang('/legal/terms') } },
  ]
}

async function getBlogRoutes() {
  const now = new Date().toISOString()
  try {
    // Get all blog posts from Supabase Storage (production) or local fallback
    const posts = await getAllPostsAsync()
    return posts.map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`
      return {
        url,
        lastModified: post.date || now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: { languages: { 'es-AR': url, en: url } },
      }
    })
  } catch {
    return []
  }
}

async function getProductRoutes() {
  const now = new Date().toISOString()
  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .from('products')
      .select('id')
      .order('created_at', { ascending: false })
    
    if (error || !data) return []
    
    return (data as Array<{ id: string }>)
      .map((row) => row.id)
      .filter(Boolean)
      .map((id: string) => {
        const url = `${SITE_URL}/product/${id}`
        return {
          url,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
          alternates: { languages: { 'es-AR': url, en: url } },
        }
      })
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blog, products] = await Promise.all([getBlogRoutes(), getProductRoutes()])
  const entries = [...getStaticRoutes(), ...blog, ...products]
  return entries
}
