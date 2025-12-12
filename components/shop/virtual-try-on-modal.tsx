"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { GeneratedImage, VirtualTryOnModalProps } from "@/types/virtual-try-on"
import {
    Camera,
    CheckCircle2,
    Download,
    ImageIcon,
    RotateCcw,
    Share2,
    Sparkles,
    Upload,
    X
} from "lucide-react"
import Image from "next/image"
import { useCallback, useRef, useState } from "react"

type Step = "upload" | "consent" | "processing" | "result"

export function VirtualTryOnModal({
  isOpen,
  onClose,
  productId,
  productImage,
  productName,
}: VirtualTryOnModalProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>("upload")
  const [personImage, setPersonImage] = useState<string | null>(null)
  const [personImageFile, setPersonImageFile] = useState<File | null>(null)
  const [consentChecked, setConsentChecked] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Archivo inválido",
        description: "Por favor selecciona una imagen (JPG, PNG o WebP)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Imagen muy grande",
        description: "El tamaño máximo es 10MB",
        variant: "destructive",
      })
      return
    }

    setPersonImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPersonImage(event.target?.result as string)
      setStep("consent")
    }
    reader.readAsDataURL(file)
  }, [toast])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const input = fileInputRef.current
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>)
      }
    }
  }, [handleFileSelect])

  const handleGenerate = async () => {
    if (!personImage || !consentChecked) return

    setStep("processing")
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/virtual-try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personImage,
          productImage,
          productId,
          sampleCount: 2,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Error al generar la imagen")
      }

      setGeneratedImages(data.images || [])
      setSelectedImageIndex(0)
      setStep("result")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setStep("upload")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "No se pudo generar la imagen",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    const image = generatedImages[selectedImageIndex]
    if (!image) return

    const link = document.createElement("a")
    link.href = `data:${image.mimeType};base64,${image.base64}`
    link.download = `busy-try-on-${productName.replace(/\s+/g, "-").toLowerCase()}.png`
    link.click()

    toast({
      title: "Imagen descargada",
      description: "La imagen se guardó en tu dispositivo",
    })
  }

  const handleShare = async () => {
    const image = generatedImages[selectedImageIndex]
    if (!image) return

    try {
      // Convert base64 to blob
      const response = await fetch(`data:${image.mimeType};base64,${image.base64}`)
      const blob = await response.blob()
      const file = new File([blob], `busy-try-on-${productName}.png`, { type: image.mimeType })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Probé ${productName} con Busy`,
          text: "Mirá cómo me queda esta prenda de Busy Streetwear",
          files: [file],
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copiado",
          description: "Compartí el link del producto",
        })
      }
    } catch (err) {
      console.error("Share error:", err)
    }
  }

  const handleRetry = () => {
    setPersonImage(null)
    setPersonImageFile(null)
    setConsentChecked(false)
    setGeneratedImages([])
    setError(null)
    setStep("upload")
  }

  const handleClose = () => {
    handleRetry()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-xl">
            <Sparkles className="h-5 w-5 text-accent-brand" />
            Probador Virtual
          </DialogTitle>
          <DialogDescription className="font-body">
            Probá cómo te queda <span className="font-semibold">{productName}</span> con IA
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Step: Upload */}
          {step === "upload" && (
            <div className="space-y-6">
              {/* Product preview */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted">
                  <Image
                    src={productImage}
                    alt={productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-heading font-medium">{productName}</p>
                  <p className="text-sm text-muted-foreground">Producto a probar</p>
                </div>
              </div>

              {/* Upload area */}
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-accent-brand/50 transition-colors cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent-brand/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-accent-brand" />
                  </div>
                  <div>
                    <p className="font-heading font-medium">Subí tu foto</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Arrastrá una imagen o hacé click para seleccionar
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Galería
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Cámara
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium font-heading">Tips para mejores resultados:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Usá una foto de cuerpo completo o medio cuerpo</li>
                  <li>• Buena iluminación y fondo simple</li>
                  <li>• Postura de frente mirando a cámara</li>
                  <li>• Ropa ajustada o similar al producto</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step: Consent */}
          {step === "consent" && personImage && (
            <div className="space-y-6">
              {/* Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Tu foto</p>
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={personImage}
                      alt="Tu foto"
                      fill
                      className="object-cover"
                    />
                    <button
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                      onClick={handleRetry}
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Producto</p>
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={productImage}
                      alt={productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Consent checkbox */}
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) => setConsentChecked(checked === true)}
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                  Acepto que mi imagen sea procesada por inteligencia artificial para generar
                  una visualización del producto. La imagen no será almacenada ni compartida.
                </Label>
              </div>

              {/* Generate button */}
              <Button
                className="w-full gap-2"
                size="lg"
                disabled={!consentChecked}
                onClick={handleGenerate}
              >
                <Sparkles className="h-5 w-5" />
                Generar Prueba Virtual
              </Button>
            </div>
          )}

          {/* Step: Processing */}
          {step === "processing" && (
            <div className="py-12 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-accent-brand/20" />
                <div className="absolute inset-0 rounded-full border-4 border-accent-brand border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-accent-brand animate-pulse" />
                </div>
              </div>
              <div>
                <p className="font-heading font-medium text-lg">Generando tu prueba virtual...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Esto puede tomar unos segundos
                </p>
              </div>
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-accent-brand animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step: Result */}
          {step === "result" && generatedImages.length > 0 && (
            <div className="space-y-6">
              {/* Main result image */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                <Image
                  src={`data:${generatedImages[selectedImageIndex].mimeType};base64,${generatedImages[selectedImageIndex].base64}`}
                  alt={`${productName} - Prueba virtual`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/90 text-white text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Generado con IA
                </div>
              </div>

              {/* Thumbnails if multiple images */}
              {generatedImages.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {generatedImages.map((img, index) => (
                    <button
                      key={img.id}
                      className={`relative w-16 h-20 rounded-md overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex
                          ? "border-accent-brand ring-2 ring-accent-brand/30"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image
                        src={`data:${img.mimeType};base64,${img.base64}`}
                        alt={`Variante ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleRetry}
                >
                  <RotateCcw className="h-4 w-4" />
                  Probar otra foto
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* CTA */}
              <div className="p-4 bg-accent-brand/10 rounded-lg text-center">
                <p className="text-sm font-medium">¿Te gustó cómo te queda?</p>
                <Button className="mt-3 gap-2" onClick={handleClose}>
                  Agregar al carrito
                </Button>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && step === "upload" && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
