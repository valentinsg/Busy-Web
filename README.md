# Busy - Premium Streetwear E-commerce

A modern, minimal e-commerce site built with Next.js 15, featuring premium streetwear products with a focus on quality and contemporary design.

## Features

- **Modern Design System**: Monochrome palette with configurable accent colors
- **Product Management**: Complete product catalog with filtering and search
- **Shopping Cart**: Persistent cart with Zustand state management
- **Blog System**: MDX-powered blog with search and tagging
- **SEO Optimized**: Dynamic OG images, structured data, and sitemap generation
- **Responsive Design**: Mobile-first approach with smooth animations
- **Theme Support**: Light/dark mode with system preference detection

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **State Management**: Zustand (cart persistence)
- **Content**: MDX for blog posts
- **SEO**: next-seo + dynamic OG image generation
- **Fonts**: Space Grotesk (headings) + Plus Jakarta Sans (body)

## Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
# Site Configuration
SITE_URL=https://your-domain.com
BRAND_NAME=Busy

# Checkout Configuration
NEXT_PUBLIC_CHECKOUT_MODE=mailto
# Options: "mailto", "whatsapp", "stripe-test"

# Optional: WhatsApp number for checkout
NEXT_PUBLIC_WHATSAPP_NUMBER=1234567890
\`\`\`

## Getting Started

1. **Install dependencies**:
   \`\`\`bash
   npm install
   # or
   pnpm install
   \`\`\`

2. **Run the development server**:
   \`\`\`bash
   npm run dev
   # or
   pnpm dev
   \`\`\`

3. **Open your browser** and navigate to `http://localhost:3000`

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── (pages)/           # Route groups
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── shop/             # E-commerce components
│   └── layout/           # Layout components
├── content/              # Content files
│   ├── blog/            # MDX blog posts
│   └── faqs.json        # FAQ data
├── data/                # Static data
│   └── products.json    # Product catalog
├── lib/                 # Utility functions
└── hooks/               # Custom React hooks
\`\`\`

## Customization

### Brand Colors
Update the CSS variables in `app/globals.css`:
\`\`\`css
:root {
  --accent-brand: 0 0% 20%; /* Your brand color */
}
\`\`\`

### Logo
Replace the logo files in `/public/`:
- `logo-busy-black.png` (for light mode)
- `logo-busy-white.png` (for dark mode)

### Products
Edit `data/products.json` to add/modify products:
\`\`\`json
{
  "id": "product-slug",
  "name": "Product Name",
  "price": 99.99,
  "currency": "USD",
  "images": ["/products/product-slug/1.jpg"],
  "colors": ["black", "white"],
  "sizes": ["S", "M", "L", "XL"],
  "category": "hoodies",
  "sku": "BUSY-H-001",
  "stock": 50,
  "description": "Product description...",
  "tags": ["streetwear", "premium"],
  "rating": 4.8,
  "reviews": 124
}
\`\`\`

### Blog Posts
Add new blog posts in `content/blog/` as `.mdx` files:
\`\`\`mdx
---
title: "Post Title"
description: "Post description"
date: "2025-01-15"
tags: ["tag1", "tag2"]
cover: "/blog/post-cover.jpg"
---

# Your blog content here...
\`\`\`

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
1. Build the project: `npm run build`
2. Start the server: `npm start`
3. Ensure environment variables are set

## SEO Features

- **Dynamic OG Images**: Generated at `/api/og`
- **Structured Data**: JSON-LD for products and organization
- **Sitemap**: Auto-generated with `next-sitemap`
- **Meta Tags**: Optimized for each page type
- **Performance**: Optimized images and fonts

## Checkout Options

Configure checkout behavior with `NEXT_PUBLIC_CHECKOUT_MODE`:

- **mailto**: Opens email client with order details
- **whatsapp**: Sends order via WhatsApp
- **stripe-test**: Placeholder for Stripe integration

## Support

For questions or support, please contact:
- Email: support@busy.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## License

This project is licensed under the MIT License.
