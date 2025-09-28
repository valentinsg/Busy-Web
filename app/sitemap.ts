import type { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import getServiceClient from '@/lib/supabase/server'

const SITE_URL = process.env.SITE_URL || 'https://busy.com.ar'

function getStaticRoutes() {
  const now = new Date().toISOString()
  const monthly = 'monthly' as const
  const weekly = 'weekly' as const
  const daily = 'daily' as const

  const langs = { 'es-AR': SITE_URL + '/', en: SITE_URL + '/' }
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: daily, priority: 1.0, alternates: { languages: langs } },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: monthly, priority: 0.6, alternates: { languages: { 'es-AR': `${SITE_URL}/about`, en: `${SITE_URL}/about` } } },
    { url: `${SITE_URL}/cart`, lastModified: now, changeFrequency: monthly, priority: 0.6, alternates: { languages: { 'es-AR': `${SITE_URL}/cart`, en: `${SITE_URL}/cart` } } },
    { url: `${SITE_URL}/checkout`, lastModified: now, changeFrequency: monthly, priority: 0.6, alternates: { languages: { 'es-AR': `${SITE_URL}/checkout`, en: `${SITE_URL}/checkout` } } },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: monthly, priority: 0.6, alternates: { languages: { 'es-AR': `${SITE_URL}/contact`, en: `${SITE_URL}/contact` } } },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: monthly, priority: 0.7, alternates: { languages: { 'es-AR': `${SITE_URL}/blog`, en: `${SITE_URL}/blog` } } },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: monthly, priority: 0.6, alternates: { languages: { 'es-AR': `${SITE_URL}/faq`, en: `${SITE_URL}/faq` } } },
    { url: `${SITE_URL}/legal/cookies`, lastModified: now, changeFrequency: monthly, priority: 0.6, alternates: { languages: { 'es-AR': `${SITE_URL}/legal/cookies`, en: `${SITE_URL}/legal/cookies` } } },
    { url: `${SITE_URL}/legal/privacy`, lastModified: now, changeFrequency: monthly, priority: 0.6, alternates: { languages: { 'es-AR': `${SITE_URL}/legal/privacy`, en: `${SITE_URL}/legal/privacy` } } },
    { url: `${SITE_URL}/legal/terms`, lastModified: now, changeFrequency: monthly, priority: 0.6, alternates: { languages: { 'es-AR': `${SITE_URL}/legal/terms`, en: `${SITE_URL}/legal/terms` } } },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: weekly, priority: 0.8, alternates: { languages: { 'es-AR': `${SITE_URL}/products`, en: `${SITE_URL}/products` } } },
    { url: `${SITE_URL}/products/hoodies`, lastModified: now, changeFrequency: weekly, priority: 0.7, alternates: { languages: { 'es-AR': `${SITE_URL}/products/hoodies`, en: `${SITE_URL}/products/hoodies` } } },
    { url: `${SITE_URL}/products/tshirts`, lastModified: now, changeFrequency: weekly, priority: 0.7, alternates: { languages: { 'es-AR': `${SITE_URL}/products/tshirts`, en: `${SITE_URL}/products/tshirts` } } },
    { url: `${SITE_URL}/products/pants`, lastModified: now, changeFrequency: weekly, priority: 0.7, alternates: { languages: { 'es-AR': `${SITE_URL}/products/pants`, en: `${SITE_URL}/products/pants` } } },
  ]
}

function getBlogRoutes() {
  const blogDir = path.join(process.cwd(), 'content', 'blog')
  const now = new Date().toISOString()
  try {
    const files = fs.readdirSync(blogDir)
    return files
      .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
      .map((f) => {
        const slug = f.replace(/\.(mdx|md)$/i, '')
        const url = `${SITE_URL}/blog/${slug}`
        return {
          url,
          lastModified: now,
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
  // First try Supabase (production source of truth)
  try {
    const sb = getServiceClient()
    // Only select id for URL; order by created desc
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await sb
      .from('products')
      .select('id')
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return (data as Array<{ id: string }> )
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
  } catch {}

  // Fallback to local JSON if available
  try {
    const dataFile = path.join(process.cwd(), 'data', 'products.json')
    const raw = fs.readFileSync(dataFile, 'utf-8')
    const items = JSON.parse(raw) as Array<{ id?: string; slug?: string; handle?: string }>
    const ids = items
      .map((p) => p.id || p.slug || p.handle)
      .filter((v): v is string => typeof v === 'string' && v.length > 0)
    return ids.map((id) => {
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
  const [blog, products] = [getBlogRoutes(), await getProductRoutes()]
  const entries = [...getStaticRoutes(), ...blog, ...products]
  return entries
}
