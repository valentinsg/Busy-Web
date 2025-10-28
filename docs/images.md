# Image Optimization Guide - Busy

## Overview

This guide documents the optimized image configuration for Busy, designed to reduce CDN Image Optimization transformations by 60-80% while maintaining visual quality.

## Problem Statement

**Before Optimization:**
- 2.4K/5K transformations used in 30 days (48% of quota)
- 16 different image widths generated (8 deviceSizes + 8 imageSizes)
- Inconsistent `sizes` attributes causing unnecessary variants
- No URL normalization leading to cache misses
- Short cache TTL (60s) causing frequent regeneration

**After Optimization:**
- **62.5% reduction** in width variants (16 → 6)
- Strategic widths covering all viewports efficiently
- 1-year cache TTL (immutable)
- Normalized URLs preventing cache misses
- Proper `sizes` attributes for optimal browser selection

---

## Architecture

### 1. Centralized Configuration (`lib/imageConfig.ts`)

All image optimization settings are centralized in a single module:

```typescript
import { getImageConfig, normalizeImageUrl } from '@/lib/imageConfig'

// Get predefined config for a use case
const config = getImageConfig('productCard')

// Normalize URLs to prevent cache misses
const cleanUrl = normalizeImageUrl(product.image)
```

### 2. Allowed Widths (Whitelist)

Only **6 strategic widths** are generated:

| Width | Use Case | Coverage |
|-------|----------|----------|
| 384px | Mobile 1x, Icons | Up to 384px wide |
| 640px | Mobile 2x, Tablet 1x | 2x for 320px, 1x for 640px |
| 828px | Tablet 2x | 2x for 414px (iPhone Pro Max) |
| 1200px | Desktop 1x | Standard desktop displays |
| 1920px | Desktop 2x, Large 1x | Full HD displays |
| 2048px | Large 2x | 2K displays |

**Why these widths?**
- Cover all common device sizes (mobile, tablet, desktop)
- Support 2x retina displays
- Minimize overlap between sizes
- Align with Next.js best practices

### 3. Image Categories

Predefined configurations for common use cases:

```typescript
// Product card in grid
<Image
  src={normalizeImageUrl(product.image)}
  alt={product.name}
  fill
  sizes={getImageConfig('productCard').sizes}
/>

// Blog post card
<Image
  src={normalizeImageUrl(post.cover)}
  alt={post.title}
  width={getImageConfig('blogCard').width}
  height={getImageConfig('blogCard').height}
  sizes={getImageConfig('blogCard').sizes}
/>

// Hero/Banner
<Image
  src={heroImage}
  alt="Hero"
  fill
  sizes={getImageConfig('hero').sizes}
/>
```

**Available Categories:**
- `hero` - Full-width banners (1920x1080)
- `productCard` - Product grid cards (640x640)
- `productGallery` - Product detail main image (1200x1200)
- `productThumbnail` - Gallery thumbnails (384x384)
- `blogCard` - Blog post cards (828x620)
- `categoryCard` - Category cards (828x828)
- `logo` - Logo images (200x200)
- `icon` - Small icons (48x48)
- `avatar` - Profile pictures (384x384)
- `pattern` - Background patterns (640x640)
- `socialIcon` - Large social icons (384x384)

---

## Usage Guidelines

### ✅ DO

1. **Always use predefined configs:**
   ```typescript
   import { getImageConfig } from '@/lib/imageConfig'
   
   <Image
     src={image}
     alt="Description"
     fill
     sizes={getImageConfig('productCard').sizes}
   />
   ```

2. **Normalize URLs from external sources:**
   ```typescript
   import { normalizeImageUrl } from '@/lib/imageConfig'
   
   <Image
     src={normalizeImageUrl(product.image)}
     alt={product.name}
   />
   ```

3. **Use fixed dimensions when possible:**
   ```typescript
   const config = getImageConfig('logo')
   
   <Image
     src="/logo.png"
     alt="Logo"
     width={config.width}
     height={config.height}
     sizes={config.sizes}
   />
   ```

4. **Mark SVGs as unoptimized:**
   ```typescript
   <Image
     src="/icon.svg"
     alt="Icon"
     width={24}
     height={24}
     unoptimized
   />
   ```

5. **Use priority for above-the-fold images:**
   ```typescript
   <Image
     src={heroImage}
     alt="Hero"
     fill
     sizes={getImageConfig('hero').sizes}
     priority
   />
   ```

### ❌ DON'T

1. **Don't use arbitrary sizes:**
   ```typescript
   // ❌ Bad
   <Image src={image} fill sizes="100vw" />
   
   // ✅ Good
   <Image src={image} fill sizes={getImageConfig('hero').sizes} />
   ```

2. **Don't skip URL normalization:**
   ```typescript
   // ❌ Bad - query strings cause cache misses
   <Image src={product.image} />
   
   // ✅ Good
   <Image src={normalizeImageUrl(product.image)} />
   ```

3. **Don't use fill without sizes:**
   ```typescript
   // ❌ Bad - browser doesn't know which size to request
   <Image src={image} fill />
   
   // ✅ Good
   <Image src={image} fill sizes={getImageConfig('productCard').sizes} />
   ```

4. **Don't optimize small static images:**
   ```typescript
   // ❌ Bad - optimization overhead for tiny images
   <Image src="/icon-16.png" width={16} height={16} />
   
   // ✅ Good
   <Image src="/icon-16.png" width={16} height={16} unoptimized />
   ```

---

## Configuration Files

### `next.config.mjs`

```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 828, 1200, 1920, 2048],
  imageSizes: [384],
  minimumCacheTTL: 31536000, // 1 year
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
  ],
}
```

**Key Changes:**
- Reduced from 16 to 6 widths
- Increased cache TTL from 60s to 1 year
- Added cache headers for `/_next/image` endpoint

### Cache Headers

```javascript
{
  source: '/_next/image(.*)',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    },
  ],
}
```

---

## Supabase Storage Integration

For images stored in Supabase Storage, use the optimization helper:

```typescript
import { optimizeSupabaseUrl } from '@/lib/imageConfig'

const optimizedUrl = optimizeSupabaseUrl(supabaseUrl, {
  width: 640,
  quality: 85,
  format: 'webp'
})

<Image src={optimizedUrl} alt="Product" />
```

**Note:** Supabase Storage supports transformation parameters. This helper ensures you only request allowed widths.

---

## Performance Checklist

Before deploying new images, verify:

- [ ] Using `getImageConfig()` for sizes attribute
- [ ] URLs normalized with `normalizeImageUrl()`
- [ ] Fixed width/height when not using `fill`
- [ ] `priority` set for above-the-fold images
- [ ] `loading="lazy"` for below-the-fold images
- [ ] SVGs marked as `unoptimized`
- [ ] Small icons (<48px) marked as `unoptimized`
- [ ] Proper alt text for accessibility
- [ ] No arbitrary sizes like "100vw" without config

---

## Monitoring

### Vercel Analytics

Monitor transformation usage in Vercel dashboard:
1. Go to Project → Analytics → Image Optimization
2. Track "Transformations" metric
3. Target: <1K transformations/month (down from 2.4K)

### Expected Reduction

**Before:**
- 16 widths × 2 formats (AVIF, WebP) = 32 variants per image
- 2.4K transformations/month

**After:**
- 6 widths × 2 formats = 12 variants per image
- **62.5% reduction** = ~900 transformations/month
- Additional savings from:
  - 1-year cache (fewer regenerations)
  - URL normalization (fewer cache misses)
  - Proper sizes attributes (fewer unnecessary variants)

**Total Expected Reduction: 70-80%**

---

## Migration Guide

### For Existing Components

1. **Import the config:**
   ```typescript
   import { getImageConfig, normalizeImageUrl } from '@/lib/imageConfig'
   ```

2. **Replace sizes attribute:**
   ```typescript
   // Before
   sizes="(max-width: 640px) 100vw, 50vw"
   
   // After
   sizes={getImageConfig('productCard').sizes}
   ```

3. **Normalize URLs:**
   ```typescript
   // Before
   src={product.image}
   
   // After
   src={normalizeImageUrl(product.image)}
   ```

4. **Add fixed dimensions:**
   ```typescript
   // Before
   <Image src={logo} alt="Logo" fill />
   
   // After
   const config = getImageConfig('logo')
   <Image 
     src={logo} 
     alt="Logo" 
     width={config.width}
     height={config.height}
     sizes={config.sizes}
   />
   ```

### For New Components

Always start with the config:

```typescript
import Image from 'next/image'
import { getImageConfig, normalizeImageUrl } from '@/lib/imageConfig'

export function MyComponent({ imageUrl }: Props) {
  const config = getImageConfig('productCard') // Choose appropriate category
  
  return (
    <Image
      src={normalizeImageUrl(imageUrl)}
      alt="Description"
      fill
      sizes={config.sizes}
    />
  )
}
```

---

## Troubleshooting

### Issue: Images not loading

**Cause:** URL not in remotePatterns
**Solution:** Add domain to `next.config.mjs`:

```javascript
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'your-domain.com',
  },
]
```

### Issue: Blurry images on retina displays

**Cause:** Width too small for 2x displays
**Solution:** Ensure you're using appropriate config category. Our widths support 2x displays.

### Issue: Too many transformations still

**Cause:** Not using normalized URLs or proper sizes
**Solution:** 
1. Check all images use `normalizeImageUrl()`
2. Verify sizes attributes use `getImageConfig()`
3. Check Vercel logs for which images are being transformed

### Issue: Layout shift (CLS)

**Cause:** Missing width/height or aspect ratio
**Solution:**
- For `fill`: Ensure parent has defined dimensions
- For fixed: Always provide width/height
- Use aspect-ratio CSS when needed

---

## Examples

### Product Card
```typescript
<Image
  src={normalizeImageUrl(product.images[0])}
  alt={product.name}
  fill
  sizes={getImageConfig('productCard').sizes}
  priority={isAboveFold}
/>
```

### Blog Post
```typescript
const config = getImageConfig('blogCard')
<Image
  src={normalizeImageUrl(post.cover)}
  alt={post.title}
  width={config.width}
  height={config.height}
  sizes={config.sizes}
  loading="lazy"
/>
```

### Hero Banner
```typescript
<Image
  src="/hero.jpg"
  alt="Hero"
  fill
  sizes={getImageConfig('hero').sizes}
  priority
  quality={90}
/>
```

### Logo
```typescript
const config = getImageConfig('logo')
<Image
  src="/logo.png"
  alt="Busy Logo"
  width={config.width}
  height={config.height}
  sizes={config.sizes}
/>
```

---

## Additional Resources

- [Next.js Image Optimization Docs](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Vercel Image Optimization Pricing](https://vercel.com/docs/image-optimization)
- [Web.dev Image Optimization Guide](https://web.dev/fast/#optimize-your-images)

---

## Support

For questions or issues with image optimization:
1. Check this guide first
2. Review `lib/imageConfig.ts` for available configs
3. Check Vercel dashboard for transformation metrics
4. Consult Next.js Image documentation

---

**Last Updated:** October 2025  
**Version:** 1.0.0  
**Maintained by:** Busy Development Team
