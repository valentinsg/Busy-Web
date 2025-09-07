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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Gallery */}
        <div>
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.category}</Badge>
              {product.stock < 10 && <Badge variant="destructive">Only {product.stock} left</Badge>}
            </div>
            <h1 className="font-heading text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{avg > 0 ? avg.toFixed(1) : formatRating(product.rating)}</span>
                </div>
                <span>·</span>
                <span>{reviews.length} reviews de la comunidad</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-6">{formatPrice(product.price, product.currency)}</div>
          </div>

          <div>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
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
          <AddToCart product={product} />

          <Separator />

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Free Shipping</div>
                <div className="text-sm text-muted-foreground">On orders over $100</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Easy Returns</div>
                <div className="text-sm text-muted-foreground">30-day return policy</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Quality Guarantee</div>
                <div className="text-sm text-muted-foreground">Premium materials & craftsmanship</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="sizing">Size Guide</TabsTrigger>
            <TabsTrigger value="care">Care Instructions</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="leading-relaxed">{product.description}</p>
              <h3>Features</h3>
              <ul>
                <li>Premium cotton blend fabric</li>
                <li>Modern streetwear fit</li>
                <li>Durable construction</li>
                <li>Machine washable</li>
              </ul>
              <span className="libre-barcode-39-text-regular text-muted-foreground font-semibold text-xl">SKU: {product.sku}</span>
            </div>
          </TabsContent>
          <TabsContent value="sizing" className="mt-6">
            <div className="space-y-4">
              <h3 className="font-medium">Size Guide</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-left">Size</th>
                      <th className="border border-border p-2 text-left">Chest (inches)</th>
                      <th className="border border-border p-2 text-left">Length (inches)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-2">S</td>
                      <td className="border border-border p-2">36-38</td>
                      <td className="border border-border p-2">27</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2">M</td>
                      <td className="border border-border p-2">40-42</td>
                      <td className="border border-border p-2">28</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2">L</td>
                      <td className="border border-border p-2">44-46</td>
                      <td className="border border-border p-2">29</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2">XL</td>
                      <td className="border border-border p-2">48-50</td>
                      <td className="border border-border p-2">30</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="care" className="mt-6">
            <div className="space-y-4">
              <h3 className="font-medium">Care Instructions</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Machine wash cold with like colors</li>
                <li>• Use mild detergent</li>
                <li>• Tumble dry low heat</li>
                <li>• Do not bleach</li>
                <li>• Iron on low heat if needed</li>
                <li>• Do not dry clean</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-medium">Reseñas</h3>
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
                ) : (
                  <ul className="space-y-4">
                    {reviews.map((r) => (
                      <li key={r.id} className="rounded-lg border border-border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{r.name}</div>
                          <div className="flex items-center text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{r.comment}</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="font-medium mb-3">Dejar una reseña</h3>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="comment">Comentario</Label>
                    <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={5} placeholder="¿Qué te pareció el producto?" />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Enviando..." : "Enviar reseña"}
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="font-heading text-2xl font-bold mb-8">You Might Also Like</h2>
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
