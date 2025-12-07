'use client';

import { ArchiveItemMenu } from '@/components/archive/archive-item-menu';
import { cn } from '@/lib/utils';
import { ArchiveEntry } from '@/types/archive';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';

// Pinterest-style aspect ratios for variety
export type AspectRatioVariant = 'square' | 'tall' | 'wide' | 'portrait' | 'landscape';

const ASPECT_RATIO_CLASSES: Record<AspectRatioVariant, string> = {
  square: 'aspect-square',           // 1:1
  tall: 'aspect-[3/4]',              // 3:4 - vertical
  wide: 'aspect-[4/3]',              // 4:3 - horizontal
  portrait: 'aspect-[2/3]',          // 2:3 - very tall
  landscape: 'aspect-[16/10]',       // 16:10 - wide
};

interface ArchiveItemProps {
  entry: ArchiveEntry;
  className?: string;
  aspectRatio?: AspectRatioVariant;
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
    return `/api/archive/image/${r2Match[1]}`;
  }

  return url;
}

export function ArchiveItem({ entry, className, aspectRatio = 'square' }: ArchiveItemProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const dominantColor = entry.colors?.[0] || '#1a1a1a';
  const aspectClass = ASPECT_RATIO_CLASSES[aspectRatio];

  // Long press handlers for mobile
  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowMenu(true);
    }, 500); // 500ms long press
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <div
      className={cn(
        'group relative block overflow-hidden rounded-xl transition-all duration-300',
        'hover:shadow-xl hover:shadow-black/20',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowMenu(true);
      }}
    >
      <Link
        href={`/archive/${entry.id}`}
        className="block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-label={`Ver ${entry.microcopy || 'entrada del archivo'}`}
      >
        <div
          className={cn('relative overflow-hidden rounded-xl', aspectClass)}
          style={{ backgroundColor: dominantColor }}
        >
          {/* Image with error handling and fallback chain */}
          {!imageError ? (
            <Image
              src={getProxyUrl(entry.thumb_url) || getProxyUrl(entry.medium_url) || getProxyUrl(entry.full_url)}
              alt={entry.microcopy || 'Imagen del archivo'}
              width={400}
              height={400}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'w-full h-auto object-cover transition-all duration-500',
                'group-hover:scale-105',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.error('Image load failed:', entry.thumb_url);
                setImageError(true);
              }}
              loading="lazy"
              unoptimized // Using proxy URLs, no need for Next.js optimization
            />
          ) : (
            // Fallback for broken images - show URL for debugging
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2"
              style={{ backgroundColor: dominantColor }}
            >
              <span className="font-body text-xs text-white/60 text-center">
                Error cargando imagen
              </span>
              <span className="font-mono text-[8px] text-white/30 break-all text-center line-clamp-3">
                {entry.thumb_url?.substring(0, 60)}...
              </span>
            </div>
          )}

          {/* Hover overlay - Pinterest style */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
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

      {/* Menu button - visible on hover (desktop) or always visible on mobile when triggered */}
      <div
        className={cn(
          'absolute top-2 right-2 transition-opacity duration-200',
          'opacity-0 group-hover:opacity-100',
          showMenu && 'opacity-100'
        )}
      >
        <ArchiveItemMenu entry={entry} />
      </div>
    </div>
  );
}
