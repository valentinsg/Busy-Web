'use client'

import { SizeCalculatorForm } from '@/components/size-calculator/size-calculator-form'
import { SizeCalculatorResults } from '@/components/size-calculator/size-calculator-results'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateAllCategories } from '@/lib/size-calculator/calculator'
import type { CalculatorResult, UserMeasurements } from '@/types/size-calculator'
import { motion } from 'framer-motion'
import { Ruler, Shirt, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function SizeCalculatorPage() {
  const [step, setStep] = useState<'intro' | 'form' | 'results'>('intro')
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurements | null>(null)
  const [results, setResults] = useState<CalculatorResult | null>(null)

  const handleStartCalculator = () => {
    setStep('form')
  }

  const handleFormComplete = (measurements: UserMeasurements) => {
    setUserMeasurements(measurements)
    // Calcular recomendaciones para todas las categorías
    const allResults = calculateAllCategories(measurements)
    // Por defecto mostramos hoodies
    setResults(allResults.hoodies)
    setStep('results')
  }

  const handleReset = () => {
    setStep('intro')
    setUserMeasurements(null)
    setResults(null)
  }

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container px-3 sm:px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Ruler className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Calculadora de Talle
          </h1>
          <p className="font-body text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Encontrá tu talle perfecto según tu cuerpo y preferencias de uso
          </p>
        </motion.div>

        {/* Intro Step */}
        {step === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">¿Cómo funciona?</CardTitle>
                <CardDescription className="font-body">
                  Te hacemos algunas preguntas sobre tu cuerpo y preferencias para recomendarte el talle ideal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Ruler className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold mb-2">Tus medidas</h3>
                    <p className="font-body text-sm text-muted-foreground">
                      Altura, peso y tipo de cuerpo
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Shirt className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold mb-2">Tu estilo</h3>
                    <p className="font-body text-sm text-muted-foreground">
                      ¿Cómo te gusta usar tu ropa?
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold mb-2">Recomendación</h3>
                    <p className="font-body text-sm text-muted-foreground">
                      Talle ideal para cada producto
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleStartCalculator}
                    size="lg"
                    className="w-full font-heading"
                  >
                    Comenzar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Info adicional */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <p className="font-body text-sm text-muted-foreground">
                  <strong className="text-foreground">Nota:</strong> Esta calculadora es una guía orientativa.
                  Las medidas pueden variar según el modelo y la tela. Si tenés dudas, contactanos por WhatsApp.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Form Step */}
        {step === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SizeCalculatorForm
              onComplete={handleFormComplete}
              onBack={() => setStep('intro')}
            />
          </motion.div>
        )}

        {/* Results Step */}
        {step === 'results' && userMeasurements && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SizeCalculatorResults
              userMeasurements={userMeasurements}
              results={results}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
