"use client"
import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Star, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductGallery } from "@/components/shop/product-gallery"
import { AddToCart } from "@/components/shop/add-to-cart"
import { ProductCard } from "@/components/shop/product-card"
import type { Product } from "@/lib/types"
import { formatPrice, formatRating } from "@/lib/format"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addReview, averageRating, getReviews, type Review } from "@/lib/reviews"

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const { toast } = useToast()
  const [reviews, setReviews] = React.useState<Review[]>([])
  const [avg, setAvg] = React.useState<number>(0)
  const [name, setName] = React.useState("")
  const [rating, setRating] = React.useState<string>("5")
  const [comment, setComment] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    const list = getReviews(product.id)
    setReviews(list)
    setAvg(averageRating(product.id))
  }, [product.id])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !comment.trim()) {
      toast({ title: "Completa todos los campos", description: "Nombre y comentario son obligatorios.", variant: "destructive" })
      return
    }
    const r = Number(rating)
    if (isNaN(r) || r < 1 || r > 5) {
      toast({ title: "Rating inválido", description: "El rating debe estar entre 1 y 5.", variant: "destructive" })
      return
    }

    try {
      setSubmitting(true)
      const saved = addReview({ productId: product.id, name: name.trim(), rating: r, comment: comment.trim() })
      setReviews((prev) => [saved, ...prev])
      setAvg(averageRating(product.id))
      setName("")
      setRating("5")
      setComment("")
      toast({ title: "¡Gracias por tu reseña!", description: "Tu opinión ayuda a otros compradores." })
    } finally {
      setSubmitting(false)
    }
  }

  const hasTag = React.useCallback((t: string) => (product.tags || []).includes(t), [product.tags])
  const showFreeShipping = !hasTag('no-free-shipping')
  const showReturns = !hasTag('no-returns')
  const showQuality = !hasTag('no-quality')
  const showCare = !hasTag('no-care')
  const isPin = hasTag('pin')
  const isAccessory = hasTag('accessory') || /accesor/i.test(product.category || '')
  const showSizing = !isPin && !isAccessory && (!!product.measurementsBySize || (product.sizes && product.sizes.length > 0))

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-8">
        <Button asChild variant="ghost" className="mb-2 sm:mb-4">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a productos
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 mb-8 sm:mb-16">
        {/* Product Gallery */}
        <div>
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="font-body">{product.category}</Badge>
              {product.badgeText && (
                <Badge variant={(product.badgeVariant as 'default' | 'destructive' | 'secondary' | 'outline') || 'default'} className="font-body font-semibold">
                  {product.badgeText}
                </Badge>
              )}
              {!product.badgeText && product.stock < 10 && <Badge variant="destructive" className="font-body">Quedan solo {product.stock}</Badge>}
              {product.imported && <Badge variant="outline" className="font-body">Importado</Badge>}
            </div>
            <h1 className="font-heading text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{avg > 0 ? avg.toFixed(1) : formatRating(product.rating)}</span>
                </div>
                <span>·</span>
                <span>{reviews.length} reseñas de la comunidad</span>
              </div>
            </div>
            <div className="mb-6">
              {product.discountActive && product.discountPercentage && product.discountPercentage > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold font-heading text-red-500">
                      {formatPrice(product.price * (1 - product.discountPercentage / 100), product.currency)}
                    </span>
                    <Badge variant="destructive" className="text-sm font-semibold px-2 py-1">
                      -{product.discountPercentage}% OFF
                    </Badge>
                  </div>
                  <div className="text-xl font-heading text-muted-foreground line-through">
                    {formatPrice(product.price, product.currency)}
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-bold font-heading">{formatPrice(product.price, product.currency)}</div>
              )}
            </div>
          </div>

          <div>
            <p className="font-body text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* Add to Cart */}
          <AddToCart product={product} sizeLabel={isPin ? "Tipo" : "Size"} />

          <Separator />

          {/* Features / Benefits */}
          <div className="space-y-4">
            {(product.benefits && product.benefits.length > 0) ? (
              <>
                {product.benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    {/* Icons could be improved using b.icon in the future */}
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium font-heading">{b.title}</div>
                      {b.subtitle && <div className="text-sm text-muted-foreground font-body">{b.subtitle}</div>}
                    </div>
                  </div>
                ))}
                {product.imported && (
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium font-heading">Producto importado</div>
                      <div className="text-sm text-muted-foreground font-body">Origen internacional</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {showFreeShipping && (
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium font-heading">Envío gratis</div>
                      <div className="text-sm text-muted-foreground font-body">En compras superiores a $80.000</div>
                    </div>
                  </div>
                )}
                {showReturns && (
                  <div className="flex items-center space-x-3">
                    <RotateCcw className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium font-heading">Devoluciones fáciles</div>
                      <div className="text-sm text-muted-foreground font-body">Política de 30 días</div>
                    </div>
                  </div>
                )}
                {showQuality && (
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium font-heading">Garantía de calidad</div>
                      <div className="text-sm text-muted-foreground font-body">Materiales premium y excelente confección</div>
                    </div>
                  </div>
                )}
                {product.imported && (
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium font-heading">Producto importado</div>
                      <div className="text-sm text-muted-foreground font-body">Origen internacional</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-8 sm:mb-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            <TabsTrigger value="description" className="text-xs sm:text-sm">Descripción</TabsTrigger>
            {showSizing && (
              <TabsTrigger value="sizing" className="text-xs sm:text-sm">Guía de Talles</TabsTrigger>
            )}
            {showCare && <TabsTrigger value="care" className="text-xs sm:text-sm">Cuidados</TabsTrigger>}
            <TabsTrigger value="reviews" className="text-xs sm:text-sm">Reseñas</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="leading-relaxed font-body whitespace-pre-line">{product.description}</p>
              <h3 className="font-heading">Características</h3>
              <ul>
                <li>Tejido de algodón premium</li>
                <li>Calce streetwear moderno</li>
                <li>Construcción duradera</li>
                <li>Apto para lavar a máquina</li>
              </ul>
              <span className="libre-barcode-39-text-regular text-muted-foreground font-semibold text-xl">SKU: {product.sku}</span>
            </div>
          </TabsContent>
          {showSizing && (
          <TabsContent value="sizing" className="mt-6">
            <div className="space-y-4">
              <h3 className="font-medium font-heading">Guía de Talles</h3>
              {product.measurementsBySize ? (
                <div className="overflow-x-auto">
                  {(() => {
                    const sizes = product.sizes && product.sizes.length ? product.sizes : Object.keys(product.measurementsBySize!)
                    const allKeys = Array.from(new Set(
                      sizes.flatMap((s) => {
                        const m = (product.measurementsBySize as Record<string, Record<string, number | string> > | undefined)?.[s]
                        return m ? Object.keys(m).filter((k) => k !== 'unit') : []
                      })
                    ))
                    const preferred = ["chest", "length", "sleeve", "waist", "hip", "head_circumference_min", "head_circumference_max"]
                    const orderedKeys = preferred.filter((k) => allKeys.includes(k)).concat(allKeys.filter((k) => !preferred.includes(k)))
                    const labelMap: Record<string, string> = {
                      chest: "Pecho",
                      length: "Largo",
                      sleeve: "Manga",
                      waist: "Cintura",
                      hip: "Cadera",
                      head_circumference_min: "Cabeza mín.",
                      head_circumference_max: "Cabeza máx.",
                    }
                    return (
                      <table className="w-full border-collapse border border-border">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-border p-2 text-left">Talle</th>
                            {orderedKeys.map((k) => (
                              <th key={k} className="border border-border p-2 text-left">
                                {labelMap[k] ?? k} (cm)
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sizes.map((s) => {
                            const m = (product.measurementsBySize as Record<string, Record<string, number | string> > | undefined)?.[s]
                            return (
                              <tr key={s}>
                                <td className="border border-border p-2">{s}</td>
                                {orderedKeys.map((k) => (
                                  <td key={k} className="border border-border p-2">
                                    {m && (typeof m[k] === 'number' || typeof m[k] === 'string') ? m[k] : '-'}
                                  </td>
                                ))}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )
                  })()}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-2 text-left">Talle</th>
                        <th className="border border-border p-2 text-left">Pecho (cm)</th>
                        <th className="border border-border p-2 text-left">Largo (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-2">S</td>
                        <td className="border border-border p-2">-</td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2">M</td>
                        <td className="border border-border p-2">-</td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2">L</td>
                        <td className="border border-border p-2">-</td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-2">XL</td>
                        <td className="border border-border p-2">-</td>
                        <td className="border border-border p-2">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
          )}
          {showCare && (
          <TabsContent value="care" className="mt-6">
            <div className="space-y-4">
              <h3 className="font-medium font-heading">Instrucciones de cuidado</h3>
              {product.careInstructions ? (
                <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-line font-body text-muted-foreground">{product.careInstructions}</div>
              ) : (
                <ul className="space-y-2 text-muted-foreground font-body">
                  <li>• Lavar a máquina con agua fría junto a colores similares</li>
                  <li>• Usar detergente suave</li>
                  <li>• Secar a baja temperatura</li>
                  <li>• No usar blanqueador</li>
                  <li>• Planchar a baja temperatura si es necesario</li>
                  <li>• No lavar en seco</li>
                </ul>
              )}
            </div>
          </TabsContent>
          )}
          <TabsContent value="reviews" className="mt-6">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-4">
                <h3 className="font-medium font-heading">Reseñas</h3>
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-body">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
                ) : (
                  <ul className="space-y-4">
                    {reviews.map((r) => (
                      <li key={r.id} className="rounded-lg border border-border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium font-heading">{r.name}</div>
                          <div className="flex items-center text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-line font-body">{r.comment}</p>
                        <div className="mt-2 text-xs text-muted-foreground font-body">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                
                {/* Formulario de reseña */}
                <div className="mt-8 pt-8 border-t">
                  <h3 className="font-medium mb-4 font-heading">Dejar una reseña</h3>
                  <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-body">Nombre</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rating" className="font-body">Rating</Label>
                        <Select value={rating} onValueChange={setRating}>
                          <SelectTrigger id="rating">
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {[5,4,3,2,1].map((r) => (
                              <SelectItem key={r} value={String(r)}>{r} estrellas</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comment" className="font-body">Comentario</Label>
                      <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="¿Qué te pareció el producto?" />
                    </div>
                    <Button type="submit" disabled={submitting} className="font-heading">
                      {submitting ? "Enviando..." : "Enviar reseña"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="font-heading text-2xl font-bold mb-8">También te puede interesar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
