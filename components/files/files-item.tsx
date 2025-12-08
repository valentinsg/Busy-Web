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
 * This bypasses 401 errors when R2 public access isn't configured correctly
 */
function getProxyUrl(url: string | undefined): string {
  if (!url) return '';

  // Check if it's an R2 URL
  const r2Match = url.match(/https:\/\/[^/]+\.r2\.dev\/(.+)/);
  if (r2Match) {
    // Convert to proxy URL
    return `/api/files/image/${r2Match[1]}`;
  }

  return url;
}

export function FilesItem({ entry, className }: FilesItemProps) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const dominantColor = entry.colors?.[0] || '#1a1a1a';

  // Build fallback chain: thumb → medium → full
  const imageUrls = [
    entry.thumb_url,
    entry.medium_url,
    entry.full_url,
  ].filter(Boolean) as string[];

  const currentUrl = imageUrls[currentUrlIndex];
  const hasMoreFallbacks = currentUrlIndex < imageUrls.length - 1;
  const allFailed = currentUrlIndex >= imageUrls.length || imageUrls.length === 0;

  return (
    <div
      className={cn(
        'group relative block overflow-hidden rounded-xl',
        'md:transition-all md:duration-300 md:hover:shadow-xl md:hover:shadow-black/20',
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
          {/* Image with error handling and fallback chain */}
          {!allFailed && currentUrl ? (
            <Image
              key={currentUrl} // Force remount on URL change
              src={getProxyUrl(currentUrl)}
              alt={entry.microcopy || 'Imagen del archivo'}
              width={800}
              height={800}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'w-full h-auto transition-all duration-500',
                'md:group-hover:scale-105', // Only scale on desktop hover
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.error('Image load failed:', currentUrl, '- trying next fallback');
                if (hasMoreFallbacks) {
                  setCurrentUrlIndex(prev => prev + 1);
                  setImageLoaded(false);
                } else {
                  setCurrentUrlIndex(imageUrls.length); // Mark all as failed
                }
              }}
              loading="lazy"
              unoptimized // Using proxy URLs, no need for Next.js optimization
            />
          ) : (
            // Fallback for broken images - show placeholder
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

          {/* Hover overlay - Pinterest style */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent',
              'opacity-0 transition-opacity duration-300',
              'md:group-hover:opacity-100', // Only show on hover for devices with hover capability
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
