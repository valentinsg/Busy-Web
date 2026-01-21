"use client"

import dynamic from "next/dynamic"

export const CopyLinkButton = dynamic(() => import('@/components/blog/copy-link-button'), { ssr: false })
export const ShareButton = dynamic(() => import('@/components/blog/share-button'), { ssr: false })
export const TableOfContents = dynamic(
  () => import('@/components/blog/table-of-contents').catch(() => ({ default: () => null })),
  { ssr: false }
)
export const NewsletterSignup = dynamic(() => import('@/components/blog/newsletter-signup'), { ssr: false })
export const RatingStars = dynamic(() => import('@/components/blog/rating-stars'), { ssr: false })
export const CommentsForm = dynamic(() => import('@/components/blog/comments-form'), { ssr: false })
