"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface HoodieCardProps {
  name: string
  price: number
  image1: string
  image2: string
}

export function HoodieCard({ name, price, image1, image2 }: HoodieCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="bg-dark-800 rounded-lg overflow-hidden">
      <div
        className="relative aspect-square"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={isHovered ? image2 : image1}
          alt={name}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-100">{name}</h3>
        <p className="text-gray-400 mb-4">${price.toFixed(2)}</p>
        <Button className="w-full" variant="outline">
          Buy Now
        </Button>
      </div>
    </div>
  )
}
