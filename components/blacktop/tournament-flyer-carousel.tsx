'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TournamentFlyerCarouselProps {
  images: string[];
  tournamentName: string;
  accentColor: string;
}

export function TournamentFlyerCarousel({ 
  images, 
  tournamentName,
  accentColor 
}: TournamentFlyerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug: ver cuántas imágenes hay
  useEffect(() => {
    console.log('🎨 Carousel images:', images);
    console.log('📊 Total images:', images?.length);
  }, [images]);

  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Touch handlers deshabilitados para permitir zoom nativo
  // Los usuarios pueden usar las flechas o dots para cambiar de imagen

  // Preload imágenes adyacentes
  useEffect(() => {
    const preloadImages = () => {
      const nextIndex = (currentIndex + 1) % images.length;
      const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      
      [nextIndex, prevIndex].forEach(index => {
        const img = new window.Image();
        img.src = images[index];
      });
    };
    
    preloadImages();
  }, [currentIndex, images]);

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-8">
      {/* Carousel container */}
      <div 
        ref={containerRef}
        className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/10"
        style={{ touchAction: 'pinch-zoom' }}
      >
        {/* Current image con transición - usando img para permitir zoom nativo */}
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <img
            src={images[currentIndex]}
            alt={`${tournamentName} - Flyer ${currentIndex + 1}`}
            className={cn(
              "max-w-full max-h-full object-contain transition-opacity duration-300",
              isTransitioning ? "opacity-0" : "opacity-100"
            )}
            loading={currentIndex === 0 ? "eager" : "lazy"}
            style={{ 
              touchAction: 'auto',
              userSelect: 'none'
            }}
          />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              disabled={isTransitioning}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-10"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              disabled={isTransitioning}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-10"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning && index !== currentIndex) {
                    setIsTransitioning(true);
                    setCurrentIndex(index);
                    setTimeout(() => setIsTransitioning(false), 300);
                  }
                }}
                disabled={isTransitioning}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "w-6"
                    : "bg-white/40 hover:bg-white/60",
                  isTransitioning && "cursor-not-allowed"
                )}
                style={
                  index === currentIndex
                    ? { backgroundColor: accentColor }
                    : undefined
                }
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div 
            className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border text-xs font-body font-medium z-10"
            style={{ borderColor: `${accentColor}40` }}
          >
            <span style={{ color: accentColor }}>{currentIndex + 1}</span>
            <span className="text-white/60"> / {images.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
