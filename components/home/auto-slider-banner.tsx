"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"
import { getImageConfig } from "@/lib/imageConfig"

// Usar imágenes estáticas locales en lugar de GIFs externos
const images = [
  "/hero-1.gif", // Reemplazar con imagen local optimizada
  "/hero-2.gif", // Reemplazar con imagen local optimizada
  "/hero-3.gif"
]

export function AutoSliderBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleShopClick = () => {
    const productSection = document.getElementById("product-section")
    if (productSection) {
      productSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div id="hero-banner" className="relative w-full h-screen overflow-hidden">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={`Banner ${index + 1}`}
            fill
            style={{ objectFit: "cover" }}
            sizes={getImageConfig('hero').sizes}
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            quality={90}
          />
        </div>
      ))}
      <motion.div
        className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center"
      >
        <motion.div>
          <Image 
            src="/busy-streetwear.png" 
            alt="Busy Streetwear" 
            width={325} 
            height={325} 
            sizes="325px"
            priority 
          />
        </motion.div>
        <motion.a
          href="/contact"
          className="google-sans-code text-xl tracking-tight text-gray-300 text-center mb-8 font-bold"
        >
          38°00′S 57°33′O
        </motion.a>
        <motion.div>
          <Button
            onClick={handleShopClick}
            size="lg"
            variant="outline"
            className="btn-street font-heading transition-transform ease-in-out w-36 hover:border-2 hover:border-accent-brand
            hover:text-accent-brand hover:bg-accent-brand-foreground hover:duration-200 hover:-translate-y-0.5
            hover:box-shadow-2 shadow-sm hover:shadow-lg"
          >
            SHOP
          </Button>
        </motion.div>
      </motion.div>
      {/* Bottom fade to blend with following black section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-b from-transparent to-black"
      />
    </div>
  )
}
