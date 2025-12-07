/**
 * Centralized Image Optimization Configuration
 *
 * This module defines the allowed image widths and provides utilities
 * to minimize CDN transformations while maintaining visual quality.
 *
 * Strategy:
 * - Limit to 6 strategic widths (down from 16)
 * - Use fixed dimensions where possible
 * - Provide proper sizes attributes for responsive images
 * - Normalize URLs to prevent cache misses
 */

// ============================================================================
// ALLOWED WIDTHS - Whitelist for CDN transformations
// ============================================================================

/**
 * Strategic widths optimized for common viewports and 2x displays
 * Reduced from 16 to 6 widths = 62.5% reduction in transformations
 */
export const ALLOWED_IMAGE_WIDTHS = [
  384,   // Mobile (1x: 384px, covers up to 384px wide)
  640,   // Mobile 2x / Tablet 1x (1x: 640px, 2x: 320px)
  828,   // Tablet 2x (2x: 414px like iPhone Pro Max)
  1200,  // Desktop 1x / Tablet landscape 2x (1x: 1200px, 2x: 600px)
  1920,  // Desktop 2x / Large screens 1x (1x: 1920px, 2x: 960px)
  2048,  // Large screens 2x (2x: 1024px)
] as const

/**
 * Minimum cache TTL for optimized images (1 year)
 */
export const IMAGE_CACHE_TTL = 31536000 // 1 year in seconds

/**
 * Supported modern formats (AVIF first, then WebP fallback)
 */
export const IMAGE_FORMATS = ['image/avif', 'image/webp'] as const

// ============================================================================
// IMAGE CATEGORIES - Predefined dimensions for common use cases
// ============================================================================

export const IMAGE_DIMENSIONS = {
  // Hero/Banner images
  hero: {
    width: 1920,
    height: 1080,
    sizes: '100vw',
  },

  // Product cards in grid
  productCard: {
    width: 640,
    height: 640,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw',
  },

  // Product gallery main image
  productGallery: {
    width: 1200,
    height: 1200,
    sizes: '(max-width: 768px) 100vw, 50vw',
  },

  // Product gallery thumbnails
  productThumbnail: {
    width: 384,
    height: 384,
    sizes: '(max-width: 768px) 25vw, 10vw',
  },

  // Blog post cards
  blogCard: {
    width: 828,
    height: 620, // 4:3 aspect ratio
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  },

  // Category cards
  categoryCard: {
    width: 828,
    height: 828,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  },

  // Logo
  logo: {
    width: 200,
    height: 200,
    sizes: '200px',
  },

  // Icons
  icon: {
    width: 48,
    height: 48,
    sizes: '48px',
  },

  // Avatar/Profile
  avatar: {
    width: 384,
    height: 384,
    sizes: '(max-width: 640px) 96px, 128px',
  },

  // Background patterns
  pattern: {
    width: 640,
    height: 640,
    sizes: '100vw',
  },

  // Community/Social icons (large circular)
  socialIcon: {
    width: 384,
    height: 384,
    sizes: '(max-width: 640px) 128px, (max-width: 768px) 144px, (max-width: 1024px) 160px, 192px',
  },
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalizes image URLs by removing query strings and fragments
 * This prevents cache misses from URL variations
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return url

  try {
    const urlObj = new URL(url, 'https://placeholder.com')
    // Remove query string and hash
    return urlObj.origin + urlObj.pathname
  } catch {
    // If URL parsing fails, just remove query string manually
    return url.split('?')[0].split('#')[0]
  }
}

/**
 * Gets the closest allowed width for a given target width
 * This ensures we only request widths that are in our whitelist
 */
export function getClosestAllowedWidth(targetWidth: number): number {
  return ALLOWED_IMAGE_WIDTHS.reduce((prev, curr) => {
    return Math.abs(curr - targetWidth) < Math.abs(prev - targetWidth) ? curr : prev
  })
}

/**
 * Validates if a width is in the allowed list
 */
export function isAllowedWidth(width: number): boolean {
  return (ALLOWED_IMAGE_WIDTHS as readonly number[]).includes(width)
}

/**
 * Gets image configuration for a specific use case
 */
export function getImageConfig(category: keyof typeof IMAGE_DIMENSIONS) {
  return IMAGE_DIMENSIONS[category]
}

/**
 * Generates optimized sizes attribute based on breakpoints
 * This tells the browser which image width to request at each viewport size
 */
export function generateSizesAttribute(config: {
  mobile?: string
  tablet?: string
  desktop?: string
  default: string
}): string {
  const parts: string[] = []

  if (config.mobile) {
    parts.push(`(max-width: 640px) ${config.mobile}`)
  }
  if (config.tablet) {
    parts.push(`(max-width: 1024px) ${config.tablet}`)
  }
  if (config.desktop) {
    parts.push(`(max-width: 1536px) ${config.desktop}`)
  }
  parts.push(config.default)

  return parts.join(', ')
}

// ============================================================================
// SUPABASE STORAGE HELPERS
// ============================================================================

/**
 * Checks if URL is from Supabase Storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('.supabase.co/storage/')
}

/**
 * Optimizes Supabase Storage URL with transformation parameters
 * Note: Supabase Storage supports width/height/quality params
 */
export function optimizeSupabaseUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'origin' | 'webp'
  } = {}
): string {
  if (!isSupabaseStorageUrl(url)) return url

  const normalized = normalizeImageUrl(url)
  const params = new URLSearchParams()

  if (options.width) {
    const allowedWidth = getClosestAllowedWidth(options.width)
    params.set('width', allowedWidth.toString())
  }
  if (options.height) {
    params.set('height', options.height.toString())
  }
  if (options.quality) {
    params.set('quality', options.quality.toString())
  }
  if (options.format) {
    params.set('format', options.format)
  }

  const separator = normalized.includes('?') ? '&' : '?'
  return `${normalized}${separator}${params.toString()}`
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ImageCategory = keyof typeof IMAGE_DIMENSIONS
export type AllowedWidth = typeof ALLOWED_IMAGE_WIDTHS[number]
