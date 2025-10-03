'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserMeasurements, CalculatorResult } from '@/types/size-calculator'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

interface SizeCalculatorResultsProps {
  userMeasurements: UserMeasurements
  results: CalculatorResult | null
  onReset: () => void
}

export function SizeCalculatorResults({
  userMeasurements,
  results,
  onReset,
}: SizeCalculatorResultsProps) {
  // Si no hay resultados, usar valores por defecto
  const recommendation = results?.recommendedSize || {
    size: 'M',
    confidence: 'medium' as const,
    reasons: ['Calculando...'],
    alternativeSizes: [],
    measurements: { chest: 0, length: 0, shoulders: 0 },
  }

  const getFitPreferenceLabel = (pref: string) => {
    const labels: Record<string, string> = {
      tight: 'Ajustado',
      regular: 'Regular',
      loose: 'Holgado',
      oversized: 'Oversized',
    }
    return labels[pref] || pref
  }

  return (
    <div className="space-y-6">
      {/* Resultado principal */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="font-heading text-2xl flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                Tu talle recomendado
              </CardTitle>
              <CardDescription className="font-body mt-2">
                Basado en tus medidas y preferencias
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold font-heading text-primary">
                {recommendation.size}
              </div>
              <Badge variant="secondary" className="mt-2">
                {recommendation.confidence === 'high'
                  ? 'Alta confianza'
                  : recommendation.confidence === 'medium'
                    ? 'Confianza media'
                    : 'Confianza baja'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h4 className="font-heading font-semibold">¿Por qué este talle?</h4>
            <ul className="space-y-2">
              {recommendation.reasons.map((reason: string, index: number) => (
                <li key={index} className="flex items-start gap-2 font-body text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de tus datos */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Tus datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-body">Altura</p>
              <p className="text-lg font-semibold font-heading">
                {userMeasurements.height} cm
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-body">Peso</p>
              <p className="text-lg font-semibold font-heading">
                {userMeasurements.weight} kg
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-body">Preferencia</p>
              <p className="text-lg font-semibold font-heading">
                {getFitPreferenceLabel(userMeasurements.fitPreference)}
              </p>
            </div>
            {userMeasurements.bodyType && (
              <div>
                <p className="text-sm text-muted-foreground font-body">Tipo de cuerpo</p>
                <p className="text-lg font-semibold font-heading capitalize">
                  {userMeasurements.bodyType}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Talles alternativos */}
      {recommendation.alternativeSizes && recommendation.alternativeSizes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Talles alternativos
            </CardTitle>
            <CardDescription className="font-body">
              Si preferís un fit diferente, considerá estos talles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {recommendation.alternativeSizes.map((size: string) => (
                <div
                  key={size}
                  className="flex-1 p-4 border rounded-lg text-center hover:border-primary/50 transition-colors"
                >
                  <div className="text-2xl font-bold font-heading mb-1">{size}</div>
                  <p className="text-xs text-muted-foreground font-body">
                    {size < recommendation.size ? 'Más ajustado' : 'Más holgado'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nota importante */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="font-body text-sm text-muted-foreground">
            <strong className="text-foreground">Recordá:</strong> Esta es una recomendación
            basada en medidas estándar. Cada producto puede tener variaciones según el modelo
            y la tela. Revisá siempre la tabla de medidas específica de cada producto.
          </p>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onReset}
          className="font-heading"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Calcular de nuevo
        </Button>
        <Button asChild className="flex-1 font-heading">
          <Link href="/products">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Ver productos
          </Link>
        </Button>
      </div>
    </div>
  )
}
