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

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: daily, priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: monthly, priority: 0.6 },
    { url: `${SITE_URL}/cart`, lastModified: now, changeFrequency: monthly, priority: 0.6 },
    { url: `${SITE_URL}/checkout`, lastModified: now, changeFrequency: monthly, priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: monthly, priority: 0.6 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: monthly, priority: 0.7 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: monthly, priority: 0.6 },
    { url: `${SITE_URL}/legal/cookies`, lastModified: now, changeFrequency: monthly, priority: 0.6 },
    { url: `${SITE_URL}/legal/privacy`, lastModified: now, changeFrequency: monthly, priority: 0.6 },
    { url: `${SITE_URL}/legal/terms`, lastModified: now, changeFrequency: monthly, priority: 0.6 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: weekly, priority: 0.8 },
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
        return {
          url: `${SITE_URL}/blog/${slug}`,
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
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
    return data
      .map((row: any) => row.id)
      .filter(Boolean)
      .map((id: string) => ({
        url: `${SITE_URL}/product/${id}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
  } catch {}

  // Fallback to local JSON if available
  try {
    const dataFile = path.join(process.cwd(), 'data', 'products.json')
    const raw = fs.readFileSync(dataFile, 'utf-8')
    const items = JSON.parse(raw) as Array<{ id?: string; slug?: string; handle?: string }>
    return items
      .map((p: any) => p.id || p.slug || p.handle)
      .filter(Boolean)
      .map((id: string) => ({
        url: `${SITE_URL}/product/${id}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blog, products] = [getBlogRoutes(), await getProductRoutes()]
  const entries = [...getStaticRoutes(), ...blog, ...products]
  return entries
}
