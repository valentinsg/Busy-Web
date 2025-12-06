'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ArchiveEntry } from '@/types/archive';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Download, ExternalLink, Heart, Info, Link2, Maximize2, MoreHorizontal, Pause, Play, Share2, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { RecommendationGrid } from './recommendation-grid';

interface ArchiveDetailProps {
  entry: ArchiveEntry;
  recommendations?: ArchiveEntry[];
}

/**
 * Convert R2 direct URLs to proxy URLs that use signed URLs
 */
function getProxyUrl(url: string | undefined): string {
  if (!url) return '';
  const r2Match = url.match(/https:\/\/[^/]+\.r2\.dev\/(.+)/);
  if (r2Match) {
    return `/api/archive/image/${r2Match[1]}`;
  }
  return url;
}

// Vibes mode filter options
const VIBES_FILTERS = [
  { id: 'bw', label: 'B&W', class: 'grayscale' },
  { id: 'vintage', label: 'Vintage', class: 'sepia brightness-90' },
  { id: 'contrast', label: 'Contraste', class: 'contrast-125 saturate-110' },
  { id: 'fade', label: 'Fade', class: 'brightness-110 contrast-90 saturate-75' },
  { id: 'cool', label: 'Frío', class: 'hue-rotate-15 saturate-90' },
  { id: 'warm', label: 'Cálido', class: 'hue-rotate-[-15deg] saturate-110' },
  { id: 'vivid', label: 'Vivid', class: 'saturate-150 contrast-110' },
  { id: 'muted', label: 'Muted', class: 'saturate-50 brightness-95' },
  { id: 'noir', label: 'Noir', class: 'grayscale contrast-150 brightness-90' },
  { id: 'dreamy', label: 'Dreamy', class: 'brightness-105 saturate-75 blur-[0.5px]' },
];

const LOCAL_STORAGE_KEY = 'busy-archive-liked-ids';

export function ArchiveDetail({ entry }: ArchiveDetailProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(entry.likes ?? 0);
  const [vibesMode, setVibesMode] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(-1);
  const [slideshow, setSlideshow] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [imageKey, setImageKey] = useState(0); // For slide transitions
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Fetch recommendations for fullscreen navigation
  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations', entry.id],
    queryFn: async () => {
      const res = await fetch(`/api/archive/recommend?id=${entry.id}&limit=12`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.recommendations || []);
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const currentFullscreenEntry = fullscreenIndex === -1 ? entry : recommendations[fullscreenIndex];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    setLiked(ids.includes(entry.id));
  }, [entry.id]);

  // Keyboard navigation for fullscreen mode
  useEffect(() => {
    if (!fullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'Escape') {
        setFullscreen(false);
        setSlideshow(false);
      } else if (e.key === ' ') {
        e.preventDefault();
        setSlideshow(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreen, recommendations.length]);

  // Slideshow auto-advance
  useEffect(() => {
    if (!slideshow || !fullscreen || recommendations.length === 0) return;

    const interval = setInterval(() => {
      goToNext();
    }, 4000); // 4 seconds per image

    return () => clearInterval(interval);
  }, [slideshow, fullscreen, recommendations.length, fullscreenIndex]);

  // Hide body scroll when fullscreen
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [fullscreen]);

  const goToNext = () => {
    setFullscreenIndex((prev) => {
      const next = prev + 1;
      return next >= recommendations.length ? -1 : next;
    });
    setImageKey((k) => k + 1); // Trigger transition
  };

  const goToPrev = () => {
    setFullscreenIndex((prev) => {
      const next = prev - 1;
      return next < -1 ? recommendations.length - 1 : next;
    });
    setImageKey((k) => k + 1); // Trigger transition
  };

  // Touch handlers for swipe navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && recommendations.length > 0) {
      goToNext();
    } else if (isRightSwipe && recommendations.length > 0) {
      goToPrev();
    }
  };

  // Toggle like (for button click)
  const toggleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => newLiked ? prev + 1 : Math.max(0, prev - 1));

    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      if (newLiked && !ids.includes(entry.id)) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...ids, entry.id]));
      } else if (!newLiked) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids.filter(id => id !== entry.id)));
      }
    }

    try {
      await fetch('/api/archive/like', {
        method: newLiked ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id }),
      });
    } catch (error) {
      console.error('Error toggling like', error);
    }
  };

  // Add like only (for double click - can't remove) + Instagram animation
  const handleLike = async () => {
    // Always show animation on double tap
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);

    if (liked) return; // Already liked, just show animation
    setLiked(true);
    setLikes((prev) => prev + 1);

    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      if (!ids.includes(entry.id)) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...ids, entry.id]));
      }
    }

    try {
      await fetch('/api/archive/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id }),
      });
    } catch (error) {
      console.error('Error liking entry', error);
    }
  };

  const handleShare = useCallback(async () => {
    const shareUrl = `https://busy.com.ar/archive/${entry.id}`;
    const shareTitle = entry.title || 'Busy Archive';
    const shareText = `Mirá lo que encontré en Busy 👀🔥\n\n${shareTitle}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    }
  }, [entry]);

  const handleCopyLink = useCallback(async () => {
    const shareUrl = `https://busy.com.ar/archive/${entry.id}`;
    await navigator.clipboard.writeText(shareUrl);
  }, [entry.id]);

  // Download image with applied filter
  const handleDownload = useCallback(async (imageUrl: string, entryId: string) => {
    // If no filter is applied, download original
    if (!vibesMode || !selectedFilter) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `busy-archive-${entryId}.jpg`;
      a.click();
      return;
    }

    // Get filter CSS values
    const filter = VIBES_FILTERS.find(f => f.id === selectedFilter);
    if (!filter) return;

    try {
      // Load image
      const img = new window.Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Parse filter class to CSS filter
      let cssFilter = '';
      const filterClass = filter.class;

      if (filterClass.includes('grayscale')) cssFilter += 'grayscale(100%) ';
      if (filterClass.includes('sepia')) cssFilter += 'sepia(100%) ';
      if (filterClass.includes('brightness-90')) cssFilter += 'brightness(0.9) ';
      if (filterClass.includes('brightness-95')) cssFilter += 'brightness(0.95) ';
      if (filterClass.includes('brightness-105')) cssFilter += 'brightness(1.05) ';
      if (filterClass.includes('brightness-110')) cssFilter += 'brightness(1.1) ';
      if (filterClass.includes('contrast-90')) cssFilter += 'contrast(0.9) ';
      if (filterClass.includes('contrast-110')) cssFilter += 'contrast(1.1) ';
      if (filterClass.includes('contrast-125')) cssFilter += 'contrast(1.25) ';
      if (filterClass.includes('contrast-150')) cssFilter += 'contrast(1.5) ';
      if (filterClass.includes('saturate-50')) cssFilter += 'saturate(0.5) ';
      if (filterClass.includes('saturate-75')) cssFilter += 'saturate(0.75) ';
      if (filterClass.includes('saturate-90')) cssFilter += 'saturate(0.9) ';
      if (filterClass.includes('saturate-110')) cssFilter += 'saturate(1.1) ';
      if (filterClass.includes('saturate-150')) cssFilter += 'saturate(1.5) ';
      if (filterClass.includes('hue-rotate-15')) cssFilter += 'hue-rotate(15deg) ';
      if (filterClass.includes('hue-rotate-[-15deg]')) cssFilter += 'hue-rotate(-15deg) ';

      ctx.filter = cssFilter.trim() || 'none';
      ctx.drawImage(img, 0, 0);

      // Download
      const link = document.createElement('a');
      link.download = `busy-archive-${entryId}-${selectedFilter}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (error) {
      console.error('Error downloading with filter:', error);
      // Fallback to original download
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `busy-archive-${entryId}.jpg`;
      a.click();
    }
  }, [vibesMode, selectedFilter]);

  const dominantColor = entry.colors?.[0] ?? '#020617';

  // Get filter class based on vibes mode and selected filter
  const filterClass = useMemo(() => {
    if (!vibesMode) return '';
    if (!selectedFilter) return 'grayscale';
    return VIBES_FILTERS.find(f => f.id === selectedFilter)?.class || 'grayscale';
  }, [vibesMode, selectedFilter]);

  // Format date
  const formattedDate = useMemo(() => {
    return new Date(entry.created_at).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [entry.created_at]);

  return (
    <>
      {/* Pinterest-style layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* LEFT COLUMN: Image + Info below */}
        <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0">
          {/* Top bar with actions */}
          <div className="flex items-center justify-end mb-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLike}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-sm font-medium transition-all',
                  liked
                    ? 'bg-rose-500/10 text-rose-400'
                    : 'hover:bg-muted active:scale-95'
                )}
              >
                <Heart className={cn('h-4 w-4', liked && 'fill-rose-500 text-rose-500')} />
                <span>{likes}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={async () => {
                      await navigator.clipboard.writeText(`https://busy.com.ar/archive/${entry.id}`);
                    }}
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Copiar link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownload(getProxyUrl(entry.full_url), entry.id)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {vibesMode && selectedFilter ? `Descargar (${VIBES_FILTERS.find(f => f.id === selectedFilter)?.label})` : 'Descargar'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => window.open(`/archive/${entry.id}`, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir en nueva pestaña
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main Image */}
          <div
            className="relative w-full overflow-hidden rounded-2xl"
            style={{ backgroundColor: dominantColor }}
          >
            {/* Use object-contain to show full image without cropping */}
            <div className="relative w-full">
              <Image
                src={getProxyUrl(entry.full_url)}
                alt={entry.title || entry.microcopy || 'Busy Archive'}
                width={800}
                height={800}
                className={cn(
                  'w-full h-auto object-contain transition-all duration-500',
                  filterClass
                )}
                sizes="(max-width: 768px) 100vw, 480px"
                priority
                unoptimized
              />

              {/* Fullscreen button */}
              <button
                type="button"
                onClick={() => {
                  setFullscreenIndex(-1);
                  setFullscreen(true);
                }}
                className="absolute bottom-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all backdrop-blur-sm"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Info below image */}
          <div className="mt-4 space-y-3">
            {/* Date */}
            <p className="font-body text-xs text-muted-foreground">
              {formattedDate}
            </p>

            {/* Title */}
            <h1 className="font-heading text-lg font-semibold tracking-tight">
              {entry.title || 'Busy Archive'}
            </h1>

            {/* Description */}
            {entry.microcopy && (
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {entry.microcopy}
              </p>
            )}

            {/* Color palette */}
            {entry.colors && entry.colors.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                <span className="font-body text-xs text-muted-foreground">Paleta:</span>
                <div className="flex gap-1">
                  {entry.colors.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-white/10"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Vibes mode filters */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVibesMode(!vibesMode)}
                className={cn(
                  'px-3 py-1.5 rounded-full font-body text-xs transition-all',
                  vibesMode
                    ? 'bg-white text-black'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                )}
              >
                ✨ Vibes
              </button>

              {vibesMode && VIBES_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSelectedFilter(selectedFilter === filter.id ? null : filter.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full font-body text-xs transition-all',
                    selectedFilter === filter.id
                      ? 'bg-white text-black'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recommendations Grid */}
        <div className="flex-1 min-w-0">
          <RecommendationGrid entryId={entry.id} />
        </div>
      </div>

      {/* Fullscreen mode - rendered via portal to cover everything */}
      {fullscreen && currentFullscreenEntry && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black touch-pan-y"
          onClick={(e) => {
            e.stopPropagation();
            setShowUI((prev) => !prev); // Toggle UI on tap
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Instagram-style like animation */}
          {showLikeAnimation && (
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <Heart
                className="h-32 w-32 text-white fill-white animate-[likePopIn_0.6s_ease-out_forwards] drop-shadow-2xl"
                style={{
                  animation: 'likePopIn 0.6s ease-out forwards',
                }}
              />
            </div>
          )}

          {/* Close button - always visible */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreen(false);
              setSlideshow(false);
              setVibesMode(false);
              setShowInfo(false);
            }}
            className="absolute top-4 right-4 z-20 rounded-full bg-black/40 backdrop-blur-sm p-2.5 text-white hover:bg-black/60 transition-all"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Navigation arrows - show/hide with UI */}
          {recommendations.length > 0 && showUI && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 backdrop-blur-sm p-3 text-white hover:bg-black/60 transition-all animate-in fade-in slide-in-from-left-2 duration-200"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 backdrop-blur-sm p-3 text-white hover:bg-black/60 transition-all animate-in fade-in slide-in-from-right-2 duration-200"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image container with slide transition */}
          <div
            key={imageKey}
            className="relative h-full w-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => {
              e.stopPropagation();
              setShowUI((prev) => !prev);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
          >
            <Image
              src={getProxyUrl(currentFullscreenEntry.full_url)}
              alt={currentFullscreenEntry.title || currentFullscreenEntry.microcopy || 'Busy Archive'}
              fill
              className={cn('object-contain transition-all duration-500', filterClass)}
              sizes="100vw"
              priority
              unoptimized
            />
          </div>

          {/* Info panel - title and description */}
          {showInfo && currentFullscreenEntry && (
            <div
              className="absolute top-16 left-4 right-4 z-20 max-w-md mx-auto bg-black/70 backdrop-blur-md rounded-xl p-4 animate-in fade-in slide-in-from-top-4 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {currentFullscreenEntry.title && (
                <h3 className="font-heading text-lg text-white mb-1">{currentFullscreenEntry.title}</h3>
              )}
              {currentFullscreenEntry.microcopy && (
                <p className="font-body text-sm text-white/80">{currentFullscreenEntry.microcopy}</p>
              )}
              {currentFullscreenEntry.place && (
                <p className="font-body text-xs text-white/50 mt-2">📍 {currentFullscreenEntry.place}</p>
              )}
            </div>
          )}

          {/* Bottom action bar - show/hide with UI */}
          {showUI && (
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent py-6 px-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-md mx-auto flex items-center justify-center gap-6">
                {/* Like (toggle) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike();
                  }}
                  className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-all active:scale-90"
                >
                  <Heart className={cn('h-6 w-6 transition-all', liked && 'fill-red-500 text-red-500 scale-110')} />
                  <span className="font-body text-xs">{likes}</span>
                </button>

                {/* Info toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInfo(!showInfo);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 transition-all active:scale-90',
                    showInfo ? 'text-blue-400' : 'text-white/80 hover:text-white'
                  )}
                >
                  <Info className="h-6 w-6" />
                  <span className="font-body text-xs">Info</span>
                </button>

                {/* More options (share, download, copy link) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-all active:scale-90"
                    >
                      <MoreHorizontal className="h-6 w-6" />
                      <span className="font-body text-xs">Más</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48 font-body z-[10000]">
                    <DropdownMenuItem onClick={handleShare} className="gap-2 cursor-pointer">
                      <Share2 className="h-4 w-4" />
                      Compartir
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
                      <Link2 className="h-4 w-4" />
                      Copiar link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDownload(getProxyUrl(currentFullscreenEntry.full_url), currentFullscreenEntry.id)}
                      className="gap-2 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      {vibesMode && selectedFilter ? `Descargar (${VIBES_FILTERS.find(f => f.id === selectedFilter)?.label})` : 'Descargar'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Vibes filter with popover */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVibesMode(!vibesMode);
                      if (vibesMode) setSelectedFilter(null);
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 transition-all active:scale-90',
                      vibesMode ? 'text-purple-400' : 'text-white/80 hover:text-white'
                    )}
                  >
                    <Sparkles className={cn('h-6 w-6', vibesMode && 'animate-pulse')} />
                    <span className="font-body text-xs">Vibes</span>
                  </button>

                  {/* Vibes popover - centered on screen */}
                  {vibesMode && (
                    <div
                      className="fixed inset-x-0 bottom-28 z-[10001] flex justify-center px-4 animate-in fade-in zoom-in-90 slide-in-from-bottom-2 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-black/80 backdrop-blur-md rounded-2xl p-3 max-w-[90vw]">
                        <div className="flex flex-wrap justify-center gap-2">
                          {VIBES_FILTERS.map((filter) => (
                            <button
                              key={filter.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFilter(selectedFilter === filter.id ? null : filter.id);
                              }}
                              className={cn(
                                'px-3 py-1.5 rounded-full font-body text-xs transition-all whitespace-nowrap',
                                selectedFilter === filter.id
                                  ? 'bg-purple-500 text-white scale-105'
                                  : 'bg-white/10 hover:bg-white/20 text-white'
                              )}
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Slideshow */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideshow(!slideshow);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 transition-all active:scale-90',
                    slideshow ? 'text-green-400' : 'text-white/80 hover:text-white'
                  )}
                >
                  {slideshow ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  <span className="font-body text-xs">{slideshow ? 'Pausar' : 'Auto'}</span>
                </button>
              </div>

              {/* Navigation hint */}
              <p className="font-body text-white/40 text-xs text-center mt-3">
                {fullscreenIndex === -1 ? 'Imagen principal' : `${fullscreenIndex + 1} de ${recommendations.length}`}
                {' · '}Toca para ocultar · Doble tap = ❤️
              </p>
            </div>
          )}

          {/* Slideshow progress indicator */}
          {slideshow && (
            <div className="absolute top-4 left-4 right-16 h-1 bg-white/20 rounded-full overflow-hidden z-20">
              <div
                className="h-full bg-green-400 rounded-full animate-[slideProgress_4s_linear_infinite]"
                style={{ animation: 'slideProgress 4s linear infinite' }}
              />
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Custom keyframes for animations */}
      <style jsx global>{`
        @keyframes likePopIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          15% {
            transform: scale(1.3);
            opacity: 1;
          }
          30% {
            transform: scale(0.95);
          }
          45% {
            transform: scale(1.1);
          }
          60% {
            transform: scale(1);
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        @keyframes slideProgress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
