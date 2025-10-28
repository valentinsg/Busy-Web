# Image Optimization Checklist

Quick reference for developers when adding or modifying images in Busy.

## Before Adding an Image

- [ ] Is this image necessary? (Consider CSS, SVG alternatives)
- [ ] Is the source image optimized? (Use tools like TinyPNG, Squoosh)
- [ ] Is the aspect ratio correct for its use case?
- [ ] Do I have 2x resolution for retina displays?

## When Writing Code

### 1. Import Required Utilities

```typescript
import Image from 'next/image'
import { getImageConfig, normalizeImageUrl } from '@/lib/imageConfig'
```

### 2. Choose Appropriate Category

- [ ] `hero` - Full-width banners
- [ ] `productCard` - Product grid cards
- [ ] `productGallery` - Product detail main image
- [ ] `productThumbnail` - Gallery thumbnails
- [ ] `blogCard` - Blog post cards
- [ ] `categoryCard` - Category cards
- [ ] `logo` - Logo images
- [ ] `icon` - Small icons
- [ ] `avatar` - Profile pictures
- [ ] `pattern` - Background patterns
- [ ] `socialIcon` - Large social icons

### 3. Apply Configuration

```typescript
const config = getImageConfig('productCard') // Your chosen category

<Image
  src={normalizeImageUrl(imageUrl)}
  alt="Descriptive alt text"
  fill // or width={config.width} height={config.height}
  sizes={config.sizes}
  priority={isAboveFold}
  loading={isAboveFold ? "eager" : "lazy"}
/>
```

### 4. Component-Specific Checks

#### For `fill` Images
- [ ] Parent container has defined dimensions
- [ ] Added `sizes` attribute
- [ ] URL normalized with `normalizeImageUrl()`

#### For Fixed Dimensions
- [ ] Used config values: `width={config.width}` `height={config.height}`
- [ ] Added `sizes={config.sizes}`
- [ ] URL normalized

#### For SVGs
- [ ] Added `unoptimized` prop
- [ ] Fixed width/height provided

#### For Small Icons (<48px)
- [ ] Added `unoptimized` prop
- [ ] Consider using CSS/SVG instead

#### For Above-the-Fold Images
- [ ] Added `priority` prop
- [ ] Added `loading="eager"`

#### For Below-the-Fold Images
- [ ] Added `loading="lazy"`
- [ ] No `priority` prop

## Code Review Checklist

### Required
- [ ] Uses `getImageConfig()` for sizes
- [ ] Uses `normalizeImageUrl()` for external URLs
- [ ] Has proper alt text
- [ ] Has width/height or parent with dimensions
- [ ] No arbitrary sizes like "100vw"

### Recommended
- [ ] Priority set correctly (above/below fold)
- [ ] Loading attribute appropriate
- [ ] SVGs marked as unoptimized
- [ ] Small images (<48px) marked as unoptimized

### Performance
- [ ] No layout shift (CLS)
- [ ] Appropriate image size for use case
- [ ] Not loading unnecessarily large images
- [ ] Using modern formats (AVIF/WebP via Next.js)

## Common Patterns

### Product Card
```typescript
<Image
  src={normalizeImageUrl(product.image)}
  alt={product.name}
  fill
  sizes={getImageConfig('productCard').sizes}
  priority={index < 4} // First 4 products
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

### Hero/Banner
```typescript
<Image
  src="/hero.jpg"
  alt="Hero banner"
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
  alt="Company logo"
  width={config.width}
  height={config.height}
  sizes={config.sizes}
/>
```

### Icon
```typescript
<Image
  src="/icon.svg"
  alt="Icon"
  width={24}
  height={24}
  unoptimized
/>
```

## Troubleshooting

### Image not loading
- [ ] Check URL is in `remotePatterns` (next.config.mjs)
- [ ] Verify file exists in public folder or remote server
- [ ] Check browser console for errors

### Blurry on retina displays
- [ ] Using appropriate config category (widths support 2x)
- [ ] Source image is high enough resolution
- [ ] Not forcing small width via CSS

### Layout shift (CLS)
- [ ] Parent has defined dimensions (for `fill`)
- [ ] Width/height provided (for fixed)
- [ ] No conflicting CSS affecting dimensions

### Too large file size
- [ ] Using correct category (not hero for small images)
- [ ] Source image is optimized
- [ ] Quality setting appropriate (default 75 is good)

## Testing

Before committing:

- [ ] Test on mobile viewport
- [ ] Test on tablet viewport
- [ ] Test on desktop viewport
- [ ] Test on 2x retina display
- [ ] Check browser DevTools Network tab (sizes loaded)
- [ ] Run Lighthouse audit
- [ ] Verify no console errors
- [ ] Check no layout shift

## Resources

- Full guide: `docs/images.md`
- Config file: `lib/imageConfig.ts`
- Report: `docs/IMAGE_OPTIMIZATION_REPORT.md`
- Next.js docs: https://nextjs.org/docs/app/building-your-application/optimizing/images

---

**Quick Reference Card**

```typescript
// Standard pattern
import { getImageConfig, normalizeImageUrl } from '@/lib/imageConfig'

<Image
  src={normalizeImageUrl(url)}
  alt="Description"
  fill
  sizes={getImageConfig('category').sizes}
  priority={isAboveFold}
/>
```

**Remember:**
1. Always normalize URLs
2. Always use config for sizes
3. Always provide alt text
4. Always set priority correctly
5. SVGs = unoptimized
