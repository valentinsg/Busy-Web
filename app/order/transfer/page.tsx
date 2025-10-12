"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Copy, ArrowLeft, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/format"

export default function TransferConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const { toast } = useToast()
  const [orderData, setOrderData] = React.useState<{
    total: number
    customer_email: string
  } | null>(null)

  // Datos bancarios de Mercado Pago
  const bankData = {
    bank: "Mercado Pago",
    accountType: "CVU",
    cvu: "0000003100070879506983",
    alias: "busy.streetwear",
    holder: "Valentin Sanchez Guevara",
    cuil: "20-42454711-6",
  }

  React.useEffect(() => {
    if (!orderId) {
      return
    }

    // Obtener el total de la URL
    const totalParam = searchParams.get("total")
    const total = totalParam ? parseFloat(totalParam) : 0

    setOrderData({
      total,
      customer_email: "",
    })
  }, [orderId, searchParams])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: `${label} copiado al portapapeles`,
    })
  }

  if (!orderId) {
    return (
      <div className="container px-4 py-16 pt-28 font-body">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-heading text-3xl font-bold mb-4">Orden no encontrada</h1>
          <p className="text-muted-foreground mb-8">
            No se encontró información de la orden.
          </p>
          <Button asChild size="lg">
            <Link href="/products">Volver a la tienda</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 pt-28 font-body">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="font-heading text-3xl font-bold mb-2">¡Pedido confirmado!</h1>
          <p className="text-muted-foreground">
            Orden #{orderId.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Bank Transfer Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Datos para transferencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Realizá la transferencia a la siguiente cuenta bancaria:
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">Banco</div>
                  <div className="font-medium">{bankData.bank}</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">Titular</div>
                  <div className="font-medium">{bankData.holder}</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">CVU</div>
                  <div className="font-medium font-mono">{bankData.cvu}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankData.cvu, "CVU")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Alias</div>
                  <div className="font-medium">{bankData.alias}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankData.alias, "Alias")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">CUIL</div>
                  <div className="font-medium">{bankData.cuil}</div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Monto a transferir:</span>
                <span className="text-2xl font-bold">{formatPrice(orderData?.total || 0)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                  💬 ¿Tenés dudas? ¡Escribinos!
                </p>
                <p className="text-xs text-muted-foreground">
                  Si tenés alguna consulta sobre tu pedido o la transferencia, contactanos por WhatsApp y te ayudamos al instante.
                </p>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Incluí el número de orden en el concepto de la transferencia</li>
                  <li>Envianos el comprobante por WhatsApp o email</li>
                  <li>Verificaremos el pago en 24-48 horas hábiles</li>
                  <li>Te notificaremos cuando tu pedido sea despachado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Envianos el comprobante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Incluí el número de orden <span className="font-mono font-semibold">#{orderId.slice(0, 8).toUpperCase()}</span> y el comprobante de transferencia
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                asChild 
                className="w-full h-auto py-4 flex flex-col items-center gap-2"
                variant="default"
              >
                <a 
                  href={`https://wa.me/5492236680041?text=Hola! Realicé una transferencia para la orden ${orderId.slice(0, 8).toUpperCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </a>
              </Button>
              
              <Button 
                asChild 
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center gap-2"
              >
                <a 
                  href={`mailto:busy.streetwear@gmail.com?subject=Comprobante de transferencia - Orden ${orderId.slice(0, 8).toUpperCase()}&body=Hola! Adjunto el comprobante de transferencia para la orden ${orderId.slice(0, 8).toUpperCase()}.`}
                >
                  <Mail className="h-5 w-5" />
                  <span className="text-sm font-medium">Email</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Seguir comprando
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
