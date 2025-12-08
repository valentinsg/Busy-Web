'use client'

import { ChristmasTreeBackground } from '@/components/christmas'
import { useChristmas } from '@/components/providers/christmas-provider'
import { Button } from '@/components/ui/button'
import { getImageConfig, normalizeImageUrl } from '@/lib/imageConfig'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import * as React from 'react'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentImage, setCurrentImage] = React.useState(0)
  const { isChristmasMode } = useChristmas()

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
        {isChristmasMode ? (
          <ChristmasTreeBackground />
        ) : (
          <Image
            src={'/backgrounds/product-bg.jpg'}
            alt={'Busy Pattern white, diseñado por @agus.mxlina'}
            fill
            className="object-cover absolute transition-transform duration-300 group-hover:scale-105"
            sizes={getImageConfig('pattern').sizes}
          />
        )}
        <span className="text-muted-foreground relative z-10">No image available</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
        {isChristmasMode ? (
          <ChristmasTreeBackground />
        ) : (
          <Image
            src={'/backgrounds/product-bg.jpg'}
            alt={'Busy Pattern white, diseñado por @agus.mxlina'}
            fill
            className="object-cover absolute transition-transform duration-300 group-hover:scale-105"
            sizes={getImageConfig('pattern').sizes}
          />
        )}
        <Image
          src={normalizeImageUrl(
            images[currentImage] ||
            '/busy-streetwear.png'
          )}
          alt={`${productName} - Image ${currentImage + 1}`}
          fill
          className="object-cover"
          sizes={getImageConfig('productGallery').sizes}
          priority
        />

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-background/80 px-2 py-1 rounded text-sm">
            {currentImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`relative aspect-square bg-muted rounded-md overflow-hidden border-2 transition-colors ${
                currentImage === index
                  ? 'border-accent-brand'
                  : 'border-transparent hover:border-border'
              }`}
            >
              {/* Background pattern - Christmas or regular */}
              {isChristmasMode ? (
                <ChristmasTreeBackground />
              ) : (
                <Image
                  src={'/backgrounds/product-bg.jpg'}
                  alt={'Busy Pattern'}
                  fill
                  className="object-cover absolute"
                  sizes="100px"
                />
              )}
              <Image
                src={normalizeImageUrl(
                  image || '/busy-streetwear.png'
                )}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover relative z-10"
                sizes={getImageConfig('productThumbnail').sizes}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
