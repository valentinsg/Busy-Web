"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const images = [
  "https://64.media.tumblr.com/db8472cfbb89a155148003b053d5f3de/4d6d987e0cee7307-8e/s400x225/158142e8e876044a6191733a02f6ee5ac1643b58.gif",
  "https://i.pinimg.com/originals/14/f4/35/14f435eaaf8d107cca5055ce150eaf47.gif",
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
    <div className="relative w-full h-screen overflow-hidden">
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image src={src} alt={`Banner ${index + 1}`} fill style={{ objectFit: "cover" }} priority />
        </div>
      ))}
      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
        <motion.div >
          <Image src="/busy-streetwear.png" alt="Busy Streetwear" width={325} height={325} />
        </motion.div>
        <a href="/contact" className="text-xl text-gray-300 text-center mb-8 font-bold">38°00′S 57°33′O</a>
        <Button onClick={handleShopClick} size="lg" variant="outline">
          SHOP  
        </Button>
      </div>
    </div>
  )
}
