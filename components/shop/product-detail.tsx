"use client"
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

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
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
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{formatRating(product.rating)}</span>
                <span className="text-muted-foreground ml-1">({product.reviews} reviews)</span>
              </div>
              <span className="text-muted-foreground">SKU: {product.sku}</span>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="sizing">Size Guide</TabsTrigger>
            <TabsTrigger value="care">Care Instructions</TabsTrigger>
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
