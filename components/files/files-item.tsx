'use client';

import { FilesItemMenu } from '@/components/files/files-item-menu';
import { cn } from '@/lib/utils';
import { ArchiveEntry } from '@/types/files';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface FilesItemProps {
  entry: ArchiveEntry;
  className?: string;
}


/**
 * Convert R2 direct URLs to proxy URLs that use signed URLs
 * Returns null if URL is invalid to prevent rendering broken images
 */
function getProxyUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string' || url.trim() === '') return null;

  // Check if it's an R2 URL
  const r2Match = url.match(/https:\/\/[^/]+\.r2\.dev\/(.+)/);
  if (r2Match) {
    // Convert to proxy URL
    return `/api/files/image/${r2Match[1]}`;
  }

  return url;
}

/**
 * Build fallback chain for an entry
 * Returns array of valid proxy URLs in order of preference
 */
function buildFallbackChain(entry: ArchiveEntry | null | undefined): string[] {
  if (!entry) return [];

  // For grid items, prefer thumb first (smaller, faster)
  const urls = [entry.thumb_url, entry.medium_url, entry.full_url];
  return urls
    .map(url => getProxyUrl(url))
    .filter((url): url is string => url !== null);
}

export function FilesItem({ entry, className }: FilesItemProps) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const dominantColor = entry.colors?.[0] || '#1a1a1a';

  // Build fallback chain: thumb → medium → full (already proxied)
  const imageUrls = buildFallbackChain(entry);

  const currentUrl = imageUrls[currentUrlIndex] ?? null;
  const hasMoreFallbacks = currentUrlIndex < imageUrls.length - 1;
  const allFailed = currentUrlIndex >= imageUrls.length || imageUrls.length === 0;

  return (
    <div
      className={cn(
        'group relative block overflow-hidden rounded-xl',
        // Only apply hover effects on devices that support hover
        '[@media(hover:hover)]:transition-all [@media(hover:hover)]:duration-300',
        '[@media(hover:hover)]:hover:shadow-xl [@media(hover:hover)]:hover:shadow-black/20',
        className
      )}
    >
      <Link
        href={`/files/${entry.id}`}
        className="block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-label={`Ver ${entry.microcopy || 'entrada de files'}`}
      >
        <div
          className="relative overflow-hidden rounded-xl"
          style={{ backgroundColor: dominantColor }}
        >
          {/* Image with natural dimensions - no forced aspect ratio */}
          {!allFailed && currentUrl ? (
            <Image
              key={currentUrl}
              src={currentUrl}
              alt={entry.microcopy || 'Imagen del archivo'}
              width={400}
              height={400}
              className={cn(
                'w-full h-auto transition-opacity duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                if (hasMoreFallbacks) {
                  setCurrentUrlIndex(prev => prev + 1);
                  setImageLoaded(false);
                } else {
                  setCurrentUrlIndex(imageUrls.length);
                }
              }}
              loading="lazy"
              unoptimized
            />
          ) : (
            // Fallback for broken images - show placeholder with fixed aspect
            <div
              className="aspect-square flex flex-col items-center justify-center gap-2 p-4"
              style={{ backgroundColor: dominantColor }}
            >
              <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-body text-xs text-white/50 text-center">
                Imagen no disponible
              </span>
            </div>
          )}

          {/* Hover overlay - Pinterest style (desktop only) */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent',
              'opacity-0 transition-opacity duration-300',
              'pointer-events-none', // Prevent overlay from blocking clicks
              // Use @media (hover: hover) via Tailwind - only show on devices that support hover
              'group-hover:[@media(hover:hover)]:opacity-100',
              'flex flex-col justify-end p-3 md:p-4'
            )}
          >
            {entry.microcopy && (
              <p className="font-body text-white text-xs md:text-sm line-clamp-2 leading-relaxed pr-8">
                {entry.microcopy}
              </p>
            )}
          </div>

        </div>
      </Link>

      {/* Menu button - only visible on desktop hover */}
      <div
        className="absolute top-2 right-2 transition-opacity duration-200 opacity-0 md:group-hover:opacity-100 hidden md:block"
      >
        <FilesItemMenu entry={entry} />
      </div>
    </div>
  );
}
