import { getAllPostsAsync } from '@/lib/blog'
import { getPublicTournaments } from '@/lib/repo/blacktop'
import { getPublishedPlaylists } from '@/lib/repo/playlists'
import getServiceClient from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.SITE_URL || 'https://busy.com.ar'

function getStaticRoutes() {
  const now = new Date().toISOString()
  const monthly = 'monthly' as const
  const weekly = 'weekly' as const
  const daily = 'daily' as const

  const createLang = (path: string) => ({ 'es-AR': `${SITE_URL}${path}` })

  return [
    // Home - Highest priority
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: daily, priority: 1.0, alternates: { languages: createLang('/') } },

    // Main pages - High priority
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: weekly, priority: 0.9, alternates: { languages: createLang('/products') } },
    { url: `${SITE_URL}/playlists`, lastModified: now, changeFrequency: weekly, priority: 0.8, alternates: { languages: createLang('/playlists') } },
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
    { url: `${SITE_URL}/size-calculator`, lastModified: now, changeFrequency: monthly, priority: 0.7, alternates: { languages: createLang('/size-calculator') } },

    // Legal pages
    { url: `${SITE_URL}/legal/cookies`, lastModified: now, changeFrequency: monthly, priority: 0.3, alternates: { languages: createLang('/legal/cookies') } },
    { url: `${SITE_URL}/legal/privacy`, lastModified: now, changeFrequency: monthly, priority: 0.3, alternates: { languages: createLang('/legal/privacy') } },
    { url: `${SITE_URL}/legal/terms`, lastModified: now, changeFrequency: monthly, priority: 0.3, alternates: { languages: createLang('/legal/terms') } },
    { url: `${SITE_URL}/legal/returns`, lastModified: now, changeFrequency: monthly, priority: 0.3, alternates: { languages: createLang('/legal/returns') } },

    // Blacktop - Torneos de básquet
    { url: `${SITE_URL}/blacktop`, lastModified: now, changeFrequency: weekly, priority: 0.8, alternates: { languages: createLang('/blacktop') } },

    // Archive - Galería de fotos
    { url: `${SITE_URL}/archive`, lastModified: now, changeFrequency: weekly, priority: 0.7, alternates: { languages: createLang('/archive') } },
    { url: `${SITE_URL}/archive/timeline`, lastModified: now, changeFrequency: weekly, priority: 0.6, alternates: { languages: createLang('/archive/timeline') } },

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
        alternates: { languages: { 'es-AR': url } },
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
          alternates: { languages: { 'es-AR': url } },
        }
      })
  } catch {
    return []
  }
}

async function getPlaylistRoutes() {
  try {
    const playlists = await getPublishedPlaylists()
    return playlists.map((playlist) => {
      const url = `${SITE_URL}/playlists/${playlist.slug}`
      return {
        url,
        lastModified: playlist.updated_at || playlist.created_at,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        alternates: { languages: { 'es-AR': url } },
      }
    })
  } catch {
    return []
  }
}

async function getBlacktopRoutes() {
  const now = new Date().toISOString()
  try {
    const tournaments = await getPublicTournaments()
    return tournaments.map((tournament) => {
      const url = `${SITE_URL}/blacktop/${tournament.slug}`
      return {
        url,
        lastModified: tournament.updated_at || now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        alternates: { languages: { 'es-AR': url } },
      }
    })
  } catch {
    return []
  }
}

async function getArchiveRoutes() {
  const now = new Date().toISOString()
  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .schema('archive')
      .from('entries')
      .select('id, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(200) // Limit to most recent 200 entries for better coverage

    if (error || !data) return []

    return data.map((entry) => {
      const url = `${SITE_URL}/archive/${entry.id}`
      return {
        url,
        lastModified: entry.updated_at || now,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
        alternates: { languages: { 'es-AR': url } },
      }
    })
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blog, products, playlists, blacktop, archive] = await Promise.all([
    getBlogRoutes(),
    getProductRoutes(),
    getPlaylistRoutes(),
    getBlacktopRoutes(),
    getArchiveRoutes(),
  ])
  const entries = [...getStaticRoutes(), ...blog, ...products, ...playlists, ...blacktop, ...archive]
  return entries
}
