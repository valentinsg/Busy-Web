"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareButtonProps {
  title?: string
  text?: string
  url?: string
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const { toast } = useToast()

  const handleShare = async () => {
    const shareData = {
      title: title || document.title,
      text: text || "",
      url: url || window.location.href,
    }

    // Check if Web Share API is available (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error)
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url)
        toast({
          title: "Enlace copiado",
          description: "El enlace se copió al portapapeles",
        })
      } catch (error) {
        console.error("Error copying to clipboard:", error)
        toast({
          title: "Error",
          description: "No se pudo copiar el enlace",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9 sm:h-10 sm:w-auto sm:px-4"
      onClick={handleShare}
      aria-label="Compartir"
      title="Compartir"
    >
      <Share2 className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">Compartir</span>
    </Button>
  )
}
