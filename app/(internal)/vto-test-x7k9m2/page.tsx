"use client"

import { VirtualTryOnModal } from "@/components/shop/virtual-try-on-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Lock, Sparkles } from "lucide-react"
import { useState } from "react"

// Página de testing interno para Virtual Try-On
// URL: /vto-test-x7k9m2
// NO indexar, NO compartir públicamente

const TEST_PRODUCTS = [
  {
    id: "test-hoodie-1",
    name: "Busy Hoodie Negro",
    image: "/products/hoodie-negro.jpg",
  },
  {
    id: "test-remera-1",
    name: "Busy Remera Blanca",
    image: "/products/remera-blanca.jpg",
  },
  {
    id: "test-buzo-1",
    name: "Busy Buzo Oversize",
    image: "/products/buzo-oversize.jpg",
  },
]

export default function VirtualTryOnTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(TEST_PRODUCTS[0])
  const [customProductImage, setCustomProductImage] = useState("")
  const [customProductName, setCustomProductName] = useState("")

  const handleOpenModal = (product: typeof TEST_PRODUCTS[0]) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleOpenCustom = () => {
    if (customProductImage) {
      setSelectedProduct({
        id: "custom-test",
        name: customProductName || "Producto de prueba",
        image: customProductImage,
      })
      setIsModalOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-yellow-500 font-medium">Página de Testing Interno</span>
          </div>
          <h1 className="text-3xl font-heading font-bold flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-accent-brand" />
            Virtual Try-On Test
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Página privada para probar el probador virtual con Google Vertex AI.
            No compartir esta URL públicamente.
          </p>
        </div>

        {/* Warning */}
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Requisitos para funcionar:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Variable <code className="bg-muted px-1 rounded">VIRTUAL_TRY_ON_ENABLED=true</code></li>
                  <li>• Variables de Google Cloud configuradas</li>
                  <li>• Dependencia <code className="bg-muted px-1 rounded">google-auth-library</code> instalada</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Products */}
        <Card>
          <CardHeader>
            <CardTitle>Productos de Prueba</CardTitle>
            <CardDescription>
              Selecciona un producto para probar el modal de Virtual Try-On
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TEST_PRODUCTS.map((product) => (
                <Button
                  key={product.id}
                  variant="outline"
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => handleOpenModal(product)}
                >
                  <Sparkles className="h-5 w-5 text-accent-brand" />
                  <span className="text-sm">{product.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Product */}
        <Card>
          <CardHeader>
            <CardTitle>Producto Personalizado</CardTitle>
            <CardDescription>
              Usa una URL de imagen personalizada para probar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Nombre del producto</Label>
                <Input
                  id="productName"
                  placeholder="Ej: Remera Test"
                  value={customProductName}
                  onChange={(e) => setCustomProductName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productImage">URL de imagen del producto</Label>
                <Input
                  id="productImage"
                  placeholder="https://..."
                  value={customProductImage}
                  onChange={(e) => setCustomProductImage(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleOpenCustom}
              disabled={!customProductImage}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Probar con imagen personalizada
            </Button>
          </CardContent>
        </Card>

        {/* Status Check */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span>API Endpoint</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">/api/virtual-try-on</code>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span>Modelo</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">virtual-try-on-preview-08-04</code>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Documentación</span>
                <a
                  href="/docs/VIRTUAL_TRY_ON_SETUP.md"
                  className="text-accent-brand hover:underline"
                  target="_blank"
                >
                  Ver guía de setup
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          URL de testing: <code className="bg-muted px-1 rounded">/vto-test-x7k9m2</code>
        </p>
      </div>

      {/* Modal */}
      <VirtualTryOnModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={selectedProduct.id}
        productImage={selectedProduct.image}
        productName={selectedProduct.name}
      />
    </div>
  )
}
