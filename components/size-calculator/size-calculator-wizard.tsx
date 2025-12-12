'use client'

import { ProductCard } from '@/components/shop/product-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import type { Product } from '@/types'
import type { BodyType, FitPreference, UserMeasurements } from '@/types/size-calculator'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Package,
  RefreshCw,
  Ruler,
  Shirt,
  ShoppingBag,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Tipos extendidos para el wizard mejorado
interface SizeAnalysis {
  recommendedSize: string
  fitType: 'ajustado' | 'regular' | 'holgado' | 'oversized'
  confidence: 'high' | 'medium' | 'low'
  reasons: string[]
  alternativeSizes: string[]
  stockAvailable: boolean
  productMeasurements?: {
    chest?: number
    length?: number
    shoulders?: number
  }
}

interface WizardState {
  step: 'intro' | 'measurements' | 'bodyType' | 'fitPreference' | 'product' | 'results' | 'feedback'
  measurements: Partial<UserMeasurements>
  selectedProduct: Product | null
  analysis: SizeAnalysis | null
  feedbackSent: boolean
}

// Detectar si un producto es pantalón
function isPantsProduct(product: Product | null): boolean {
  if (!product) return false
  const cat = product.category?.toLowerCase() || ''
  const name = product.name?.toLowerCase() || ''
  const tags = product.tags?.map(t => t.toLowerCase()) || []

  const pantsKeywords = ['pantalon', 'pantalones', 'pants', 'jean', 'jeans', 'jogger', 'joggers', 'cargo', 'short', 'shorts']

  return pantsKeywords.some(kw => cat.includes(kw) || name.includes(kw) || tags.includes(kw))
}

// Algoritmo mejorado de cálculo de talle
function calculateSizeFromMeasurements(
  user: UserMeasurements,
  product: Product | null
): SizeAnalysis {
  // Calcular IMC
  const heightM = user.height / 100
  const bmi = user.weight / (heightM * heightM)

  // Detectar si es pantalón
  const isPants = isPantsProduct(product)

  // Estimar perímetro de pecho del usuario
  let estimatedChest = (user.height * 0.45) + (user.weight * 0.35)

  // Estimar perímetro de cintura del usuario (para pantalones)
  // Fórmula basada en altura, peso y BMI
  let estimatedWaist = (user.weight * 0.8) + (user.height * 0.1)

  // Ajustes por BMI
  if (bmi < 18.5) {
    estimatedChest -= 6
    estimatedWaist -= 8
  } else if (bmi < 22) {
    estimatedChest -= 2
    estimatedWaist -= 4
  } else if (bmi >= 25 && bmi < 27) {
    estimatedChest += 4
    estimatedWaist += 6
  } else if (bmi >= 27 && bmi < 30) {
    estimatedChest += 8
    estimatedWaist += 12
  } else if (bmi >= 30) {
    estimatedChest += 14
    estimatedWaist += 18
  }

  // Ajustes por tipo de cuerpo
  if (user.bodyType === 'slim') {
    estimatedChest -= 5
    estimatedWaist -= 6
  } else if (user.bodyType === 'athletic') {
    estimatedChest += 3
    estimatedWaist -= 2 // Atlético suele tener cintura más angosta
  } else if (user.bodyType === 'muscular') {
    estimatedChest += 7
    estimatedWaist += 2
  } else if (user.bodyType === 'plus') {
    estimatedChest += 10
    estimatedWaist += 12
  }

  // Si hay producto con medidas, usar esas
  let productMeasurements: SizeAnalysis['productMeasurements'] = undefined
  let availableSizes = isPants ? ['28', '30', '32', '34', '36', '38'] : ['S', 'M', 'L', 'XL']
  let stockBySize: Record<string, number> = {}

  if (product) {
    availableSizes = product.sizes || availableSizes
    stockBySize = product.stockBySize || {}

    if (product.measurementsBySize) {
      // Usar medidas reales del producto
      const firstSize = Object.keys(product.measurementsBySize)[0]
      if (firstSize) {
        const m = product.measurementsBySize[firstSize]
        productMeasurements = {
          chest: m.chest,
          length: m.length,
          shoulders: typeof m.shoulders === 'number' ? m.shoulders : undefined,
        }
      }
    }
  }

  // Tabla de medidas estándar para TOPS (perímetro de pecho de la prenda)
  const standardChestMeasurements: Record<string, number> = {
    'XS': 96,
    'S': 102,
    'M': 108,
    'L': 114,
    'XL': 120,
    'XXL': 126,
  }

  // Tabla de medidas estándar para PANTALONES (perímetro de cintura en cm)
  // Los talles numéricos son en pulgadas, convertimos a cm de cintura
  const standardWaistMeasurements: Record<string, number> = {
    '28': 71,  // 28 pulgadas = ~71cm
    '30': 76,  // 30 pulgadas = ~76cm
    '32': 81,  // 32 pulgadas = ~81cm
    '34': 86,  // 34 pulgadas = ~86cm
    '36': 91,  // 36 pulgadas = ~91cm
    '38': 96,  // 38 pulgadas = ~96cm
    '40': 101, // 40 pulgadas = ~101cm
    '42': 106, // 42 pulgadas = ~106cm
    // Talles con letras para pantalones
    'S': 76,
    'M': 81,
    'L': 86,
    'XL': 91,
    'XXL': 96,
  }

  // Holgura mínima necesaria según preferencia de fit
  const comfortGap: Record<FitPreference, number> = {
    tight: isPants ? 2 : 4,
    regular: isPants ? 6 : 10,
    loose: isPants ? 10 : 16,
    oversized: isPants ? 14 : 24,
  }

  // Usar medidas según tipo de prenda
  const userMeasurement = isPants ? estimatedWaist : estimatedChest
  const targetMeasurement = userMeasurement + comfortGap[user.fitPreference]
  const measurementsTable = isPants ? standardWaistMeasurements : standardChestMeasurements

  // Encontrar el talle que mejor se ajusta
  let recommendedSize = isPants ? '32' : 'M'
  for (const size of availableSizes) {
    const sizeMeasurement = measurementsTable[size] || (isPants ? 81 : 108)
    if (sizeMeasurement >= targetMeasurement) {
      recommendedSize = size
      break
    }
    recommendedSize = size // Si ninguno alcanza, usar el más grande
  }

  // Determinar tipo de fit resultante
  const finalMeasurement = measurementsTable[recommendedSize] || (isPants ? 81 : 108)
  const actualGap = finalMeasurement - userMeasurement
  let fitType: SizeAnalysis['fitType'] = 'regular'
  if (isPants) {
    if (actualGap < 4) fitType = 'ajustado'
    else if (actualGap < 8) fitType = 'regular'
    else if (actualGap < 12) fitType = 'holgado'
    else fitType = 'oversized'
  } else {
    if (actualGap < 6) fitType = 'ajustado'
    else if (actualGap < 12) fitType = 'regular'
    else if (actualGap < 20) fitType = 'holgado'
    else fitType = 'oversized'
  }

  // Calcular confianza
  let confidence: SizeAnalysis['confidence'] = 'high'
  if (!user.bodyType) confidence = 'medium'
  if (user.height < 155 || user.height > 195) confidence = 'medium'
  if (bmi < 16 || bmi > 35) confidence = 'low'

  // Generar razones
  const reasons: string[] = []
  if (isPants) {
    reasons.push(`Tu perímetro de cintura estimado es ~${Math.round(estimatedWaist)}cm`)
    reasons.push(`El talle ${recommendedSize} tiene ${finalMeasurement}cm de cintura`)
  } else {
    reasons.push(`Tu perímetro de pecho estimado es ~${Math.round(estimatedChest)}cm`)
    reasons.push(`El talle ${recommendedSize} tiene ${finalMeasurement}cm de perímetro`)
  }

  if (user.fitPreference === 'oversized') {
    reasons.push('Agregamos holgura extra para el fit oversized que preferís')
  } else if (user.fitPreference === 'tight') {
    reasons.push('Minimizamos la holgura para un fit ajustado')
  }

  if (user.bodyType === 'muscular' || user.bodyType === 'athletic') {
    reasons.push(isPants
      ? 'Consideramos tu contextura atlética para la cintura'
      : 'Consideramos espacio extra para hombros y pecho desarrollados'
    )
  }

  // Talles alternativos
  const sizeIndex = availableSizes.indexOf(recommendedSize)
  const alternativeSizes: string[] = []
  if (sizeIndex > 0) alternativeSizes.push(availableSizes[sizeIndex - 1])
  if (sizeIndex < availableSizes.length - 1) alternativeSizes.push(availableSizes[sizeIndex + 1])

  // Verificar stock
  const stockAvailable = product
    ? (stockBySize[recommendedSize] ?? product.stock ?? 0) > 0
    : true

  return {
    recommendedSize,
    fitType,
    confidence,
    reasons,
    alternativeSizes,
    stockAvailable,
    productMeasurements,
  }
}

export function SizeCalculatorWizard() {
  const [state, setState] = useState<WizardState>({
    step: 'intro',
    measurements: {
      fitPreference: 'regular',
      bodyType: 'regular',
    },
    selectedProduct: null,
    analysis: null,
    feedbackSent: false,
  })

  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [feedbackText, setFeedbackText] = useState('')
  const [mounted, setMounted] = useState(false)

  // Evitar errores de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  // Cargar productos para selección y recomendaciones
  useEffect(() => {
    async function loadProducts() {
      setProductsLoading(true)
      try {
        const res = await fetch('/api/products?limit=30&forSizeCalculator=true')
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products || data || [])
        }
      } catch {
        // Silently fail - productos opcionales
      } finally {
        setProductsLoading(false)
      }
    }
    if (mounted) {
      loadProducts()
    }
  }, [mounted])

  // Cargar productos recomendados cuando llegamos a resultados
  useEffect(() => {
    if (state.step === 'results' && state.analysis) {
      // Filtrar productos que tengan el talle recomendado en stock
      const recommended = products
        .filter(p => {
          if (!p.sizes?.includes(state.analysis!.recommendedSize)) return false
          const stock = p.stockBySize?.[state.analysis!.recommendedSize] ?? p.stock ?? 0
          return stock > 0
        })
        .slice(0, 4)
      setRecommendedProducts(recommended)
    }
  }, [state.step, state.analysis, products])

  const updateMeasurements = (updates: Partial<UserMeasurements>) => {
    setState(prev => ({
      ...prev,
      measurements: { ...prev.measurements, ...updates },
    }))
  }

  const goToStep = (step: WizardState['step']) => {
    setState(prev => ({ ...prev, step }))
  }

  const calculateResults = () => {
    const analysis = calculateSizeFromMeasurements(
      state.measurements as UserMeasurements,
      state.selectedProduct
    )
    setState(prev => ({ ...prev, analysis, step: 'results' }))
  }

  const reset = () => {
    setState({
      step: 'intro',
      measurements: { fitPreference: 'regular', bodyType: 'regular' },
      selectedProduct: null,
      analysis: null,
      feedbackSent: false,
    })
    setFeedbackText('')
  }

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return

    try {
      // Aquí podrías enviar el feedback a una API
      // Por ahora solo lo marcamos como enviado
      setState(prev => ({ ...prev, feedbackSent: true }))
    } catch {
      // Silently fail
    }
  }

  if (!mounted) {
    return null
  }

  const canContinueFromMeasurements =
    state.measurements.height && state.measurements.height > 0 &&
    state.measurements.weight && state.measurements.weight > 0

  const canContinueFromBodyType = !!state.measurements.bodyType
  const canContinueFromFit = !!state.measurements.fitPreference

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container px-3 sm:px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Ruler className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Calculadora de Talle
          </h1>
          <p className="font-body text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Encontrá tu talle perfecto según tu cuerpo y preferencias de uso
          </p>
        </div>

        {/* Step: Intro */}
        {state.step === 'intro' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">¿Cómo funciona?</CardTitle>
                <CardDescription className="font-body">
                  Te hacemos algunas preguntas sobre tu cuerpo y preferencias para recomendarte el talle ideal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Ruler className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold mb-2">1. Medidas</h3>
                    <p className="font-body text-sm text-muted-foreground">
                      Altura y peso
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Shirt className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold mb-2">2. Cuerpo</h3>
                    <p className="font-body text-sm text-muted-foreground">
                      Tu tipo de contextura
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold mb-2">3. Estilo</h3>
                    <p className="font-body text-sm text-muted-foreground">
                      Cómo te gusta el fit
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold mb-2">4. Resultado</h3>
                    <p className="font-body text-sm text-muted-foreground">
                      Tu talle ideal
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => goToStep('measurements')}
                    size="lg"
                    className="w-full font-heading"
                  >
                    Comenzar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <p className="font-body text-sm text-muted-foreground">
                  <strong className="text-foreground">Nota:</strong> Esta calculadora usa un algoritmo
                  basado en medidas antropométricas y las medidas reales de nuestras prendas.
                  Si tenés dudas, contactanos por WhatsApp.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step: Measurements */}
        {state.step === 'measurements' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={`h-2 w-10 rounded-full transition-colors ${
                        s <= 1 ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-body text-sm text-muted-foreground">
                  Paso 1 de 4
                </span>
              </div>
              <CardTitle className="font-heading">Tus medidas básicas</CardTitle>
              <CardDescription className="font-body">
                Necesitamos tu altura y peso para calcular tu talle
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="height" className="font-heading">
                    Altura (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Ej: 175"
                    value={state.measurements.height || ''}
                    onChange={(e) => updateMeasurements({ height: Number(e.target.value) })}
                    className="font-body text-lg h-12"
                  />
                  <p className="text-xs text-muted-foreground font-body">
                    Medite descalzo, parado derecho
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="font-heading">
                    Peso (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Ej: 70"
                    value={state.measurements.weight || ''}
                    onChange={(e) => updateMeasurements({ weight: Number(e.target.value) })}
                    className="font-body text-lg h-12"
                  />
                  <p className="text-xs text-muted-foreground font-body">
                    Tu peso aproximado actual
                  </p>
                </div>
              </div>

              {/* Medidas opcionales avanzadas */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground font-body mb-4">
                  <strong>Opcional:</strong> Si conocés tu perímetro de pecho, podemos ser más precisos
                </p>
                <div className="space-y-2">
                  <Label htmlFor="chest" className="font-heading">
                    Perímetro de pecho (cm) - Opcional
                  </Label>
                  <Input
                    id="chest"
                    type="number"
                    placeholder="Ej: 95"
                    value={state.measurements.chest || ''}
                    onChange={(e) => updateMeasurements({ chest: Number(e.target.value) || undefined })}
                    className="font-body"
                  />
                  <p className="text-xs text-muted-foreground font-body">
                    Medí alrededor de la parte más ancha del pecho
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => goToStep('intro')}
                  className="font-heading"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
                <Button
                  onClick={() => goToStep('bodyType')}
                  disabled={!canContinueFromMeasurements}
                  className="flex-1 font-heading"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Body Type */}
        {state.step === 'bodyType' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={`h-2 w-10 rounded-full transition-colors ${
                        s <= 2 ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-body text-sm text-muted-foreground">
                  Paso 2 de 4
                </span>
              </div>
              <CardTitle className="font-heading">Tu tipo de cuerpo</CardTitle>
              <CardDescription className="font-body">
                Esto nos ayuda a ajustar mejor la recomendación
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <RadioGroup
                value={state.measurements.bodyType}
                onValueChange={(value) => updateMeasurements({ bodyType: value as BodyType })}
                className="space-y-3"
              >
                {[
                  { value: 'slim', label: 'Delgado', desc: 'Contextura pequeña, hombros angostos' },
                  { value: 'athletic', label: 'Atlético', desc: 'Cuerpo tonificado, hombros marcados' },
                  { value: 'regular', label: 'Regular', desc: 'Contextura promedio' },
                  { value: 'muscular', label: 'Musculoso', desc: 'Hombros anchos, pecho desarrollado' },
                  { value: 'plus', label: 'Plus', desc: 'Contextura grande, más volumen' },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => updateMeasurements({ bodyType: option.value as BodyType })}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="font-body font-semibold cursor-pointer">
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground font-body">
                        {option.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => goToStep('measurements')}
                  className="font-heading"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
                <Button
                  onClick={() => goToStep('fitPreference')}
                  disabled={!canContinueFromBodyType}
                  className="flex-1 font-heading"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Fit Preference */}
        {state.step === 'fitPreference' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={`h-2 w-10 rounded-full transition-colors ${
                        s <= 3 ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-body text-sm text-muted-foreground">
                  Paso 3 de 4
                </span>
              </div>
              <CardTitle className="font-heading">¿Cómo te gusta usar tu ropa?</CardTitle>
              <CardDescription className="font-body">
                Tu preferencia de fit afecta directamente el talle recomendado
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <RadioGroup
                value={state.measurements.fitPreference}
                onValueChange={(value) => updateMeasurements({ fitPreference: value as FitPreference })}
                className="space-y-3"
              >
                {[
                  { value: 'tight', label: 'Ajustado', desc: 'Pegado al cuerpo, marca la figura', icon: '👔' },
                  { value: 'regular', label: 'Regular', desc: 'Fit clásico, cómodo sin ser holgado', icon: '👕' },
                  { value: 'loose', label: 'Holgado', desc: 'Suelto, con espacio para moverte', icon: '🧥' },
                  { value: 'oversized', label: 'Oversized', desc: 'Muy holgado, estilo streetwear', icon: '🔥' },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => updateMeasurements({ fitPreference: option.value as FitPreference })}
                  >
                    <RadioGroupItem value={option.value} id={`fit-${option.value}`} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={`fit-${option.value}`} className="font-body font-semibold cursor-pointer flex items-center gap-2">
                        <span>{option.icon}</span>
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground font-body">
                        {option.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => goToStep('bodyType')}
                  className="font-heading"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
                <Button
                  onClick={() => goToStep('product')}
                  disabled={!canContinueFromFit}
                  className="flex-1 font-heading"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Product Selection (Optional) */}
        {state.step === 'product' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={`h-2 w-10 rounded-full transition-colors ${
                        s <= 4 ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-body text-sm text-muted-foreground">
                  Paso 4 de 4
                </span>
              </div>
              <CardTitle className="font-heading">¿Tenés un producto en mente?</CardTitle>
              <CardDescription className="font-body">
                Opcional: Seleccioná un producto para ver si hay stock de tu talle
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {productsLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <Package className="w-16 h-16 opacity-30 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  </div>
                  <p className="font-body animate-pulse">Cargando productos...</p>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                  {products.slice(0, 12).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setState(prev => ({
                        ...prev,
                        selectedProduct: prev.selectedProduct?.id === product.id ? null : product
                      }))}
                      className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                        state.selectedProduct?.id === product.id
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:border-muted'
                      }`}
                    >
                      <div className="aspect-square relative rounded-md overflow-hidden bg-muted mb-2">
                        {product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        )}
                        {state.selectedProduct?.id === product.id && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-body line-clamp-2">{product.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-body">No hay productos disponibles</p>
                  <p className="font-body text-sm mt-2">Podés continuar sin seleccionar uno</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => goToStep('fitPreference')}
                  className="font-heading"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
                <Button
                  onClick={calculateResults}
                  className="flex-1 font-heading"
                >
                  Ver mi talle recomendado
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {!state.selectedProduct && (
                <p className="text-center text-sm text-muted-foreground font-body">
                  Podés continuar sin seleccionar un producto
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step: Results */}
        {state.step === 'results' && state.analysis && (
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
                      {state.analysis.recommendedSize}
                    </div>
                    <Badge
                      variant={state.analysis.confidence === 'high' ? 'default' : 'secondary'}
                      className="mt-2"
                    >
                      {state.analysis.confidence === 'high'
                        ? 'Alta confianza'
                        : state.analysis.confidence === 'medium'
                          ? 'Confianza media'
                          : 'Confianza baja'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tipo de fit */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                  <Shirt className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-body text-sm text-muted-foreground">Fit resultante</p>
                    <p className="font-heading font-semibold capitalize">{state.analysis.fitType}</p>
                  </div>
                </div>

                {/* Stock */}
                {state.selectedProduct && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    state.analysis.stockAvailable ? 'bg-green-500/10' : 'bg-destructive/10'
                  }`}>
                    {state.analysis.stockAvailable ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <p className="font-body">
                          <strong>¡Hay stock!</strong> del talle {state.analysis.recommendedSize} en {state.selectedProduct.name}
                        </p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        <p className="font-body">
                          <strong>Sin stock</strong> del talle {state.analysis.recommendedSize}. Probá con {state.analysis.alternativeSizes.join(' o ')}.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Razones */}
                <div className="space-y-2">
                  <h4 className="font-heading font-semibold">¿Por qué este talle?</h4>
                  <ul className="space-y-2">
                    {state.analysis.reasons.map((reason, index) => (
                      <li key={index} className="flex items-start gap-2 font-body text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Resumen de datos */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Tus datos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-body">Altura</p>
                    <p className="text-lg font-semibold font-heading">
                      {state.measurements.height} cm
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-body">Peso</p>
                    <p className="text-lg font-semibold font-heading">
                      {state.measurements.weight} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-body">Preferencia</p>
                    <p className="text-lg font-semibold font-heading capitalize">
                      {state.measurements.fitPreference}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-body">Contextura</p>
                    <p className="text-lg font-semibold font-heading capitalize">
                      {state.measurements.bodyType}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Talles alternativos */}
            {state.analysis.alternativeSizes.length > 0 && (
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
                    {state.analysis.alternativeSizes.map((size) => (
                      <div
                        key={size}
                        className="flex-1 p-4 border rounded-lg text-center hover:border-primary/50 transition-colors"
                      >
                        <div className="text-2xl font-bold font-heading mb-1">{size}</div>
                        <p className="text-xs text-muted-foreground font-body">
                          {size < state.analysis!.recommendedSize ? 'Más ajustado' : 'Más holgado'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Productos recomendados */}
            {recommendedProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Productos con tu talle disponible
                  </CardTitle>
                  <CardDescription className="font-body">
                    Estos productos tienen stock en talle {state.analysis.recommendedSize}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recommendedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feedback */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  ¿Qué te pareció?
                </CardTitle>
                <CardDescription className="font-body">
                  Tu feedback nos ayuda a mejorar la calculadora
                </CardDescription>
              </CardHeader>
              <CardContent>
                {state.feedbackSent ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="font-heading font-semibold">¡Gracias por tu feedback!</p>
                    <p className="text-sm text-muted-foreground font-body">
                      Nos ayuda a mejorar la experiencia
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="¿La recomendación fue acertada? ¿Qué podríamos mejorar?"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="font-body"
                      rows={3}
                    />
                    <Button
                      onClick={submitFeedback}
                      disabled={!feedbackText.trim()}
                      variant="outline"
                      className="w-full font-heading"
                    >
                      Enviar feedback
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={reset}
                className="font-heading"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Calcular de nuevo
              </Button>
              <Button asChild className="flex-1 font-heading">
                <Link href="/products">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Ver todos los productos
                </Link>
              </Button>
            </div>

            {/* Internal Links */}
            <Card className="bg-muted/20">
              <CardContent className="pt-6">
                <p className="font-heading font-semibold mb-4 text-center">Explorá más de Busy</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link
                    href="/products/ofertas"
                    className="flex flex-col items-center p-4 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                  >
                    <span className="text-2xl mb-2">🔥</span>
                    <span className="font-body text-sm font-medium">Ofertas</span>
                  </Link>
                  <Link
                    href="/products/category/remeras"
                    className="flex flex-col items-center p-4 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                  >
                    <span className="text-2xl mb-2">👕</span>
                    <span className="font-body text-sm font-medium">Remeras</span>
                  </Link>
                  <Link
                    href="/products/category/buzos"
                    className="flex flex-col items-center p-4 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                  >
                    <span className="text-2xl mb-2">🧥</span>
                    <span className="font-body text-sm font-medium">Buzos</span>
                  </Link>
                  <Link
                    href="/products/category/pantalones"
                    className="flex flex-col items-center p-4 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                  >
                    <span className="text-2xl mb-2">👖</span>
                    <span className="font-body text-sm font-medium">Pantalones</span>
                  </Link>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
                  <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                    Preguntas Frecuentes
                  </Link>
                  <span className="text-muted-foreground">·</span>
                  <Link href="/legal/returns" className="text-muted-foreground hover:text-primary transition-colors">
                    Cambios y Devoluciones
                  </Link>
                  <span className="text-muted-foreground">·</span>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                    Contacto
                  </Link>
                  <span className="text-muted-foreground">·</span>
                  <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    Sobre Busy
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
