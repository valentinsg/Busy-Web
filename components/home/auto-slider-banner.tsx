"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"

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
    <div id="hero-banner" className="relative w-full h-screen overflow-hidden">
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
      <motion.div
        className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center"
        variants={{
          initial: { opacity: 0, filter: 'blur(6px)' },
          animate: {
            opacity: 1,
            filter: 'blur(0px)',
            transition: { duration: 4.5, when: 'beforeChildren', staggerChildren: 0.12, delayChildren: 0.05 },
          },
        }}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={{ initial: { opacity: 0, y: 18, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } } }}>
          <Image src="/busy-streetwear.png" alt="Busy Streetwear" width={325} height={325} />
        </motion.div>
        <motion.a
          href="/contact"
          className="google-sans-code text-xl tracking-tight text-gray-300 text-center mb-8 font-bold"
          variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
        >
          38°00′S 57°33′O
        </motion.a>
        <motion.div variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}>
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
    </div>
  )
}
