"use client"

import { Button } from "@/components/ui/button"
import type { VirtualTryOnButtonProps } from "@/types/virtual-try-on"
import { Sparkles } from "lucide-react"
import { useState } from "react"
import { VirtualTryOnModal } from "./virtual-try-on-modal"

export function VirtualTryOnButton({
  productId,
  productImage,
  productName,
  disabled = false,
}: VirtualTryOnButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="w-full gap-2 border-accent-brand/30 hover:border-accent-brand hover:bg-accent-brand/10 transition-all duration-300"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
      >
        <Sparkles className="h-5 w-5 text-accent-brand" />
        <span className="font-heading">Probador Virtual</span>
        <span className="text-xs text-muted-foreground ml-1">AI</span>
      </Button>

      <VirtualTryOnModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        productImage={productImage}
        productName={productName}
      />
    </>
  )
}
