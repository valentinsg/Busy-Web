'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { UserMeasurements, FitPreference, BodyType } from '@/types/size-calculator'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface SizeCalculatorFormProps {
  onComplete: (measurements: UserMeasurements) => void
  onBack: () => void
}

export function SizeCalculatorForm({ onComplete, onBack }: SizeCalculatorFormProps) {
  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState<Partial<UserMeasurements>>({
    fitPreference: 'regular',
    bodyType: 'regular',
  })

  const handleNext = () => {
    if (formStep < 3) {
      setFormStep(formStep + 1)
    } else {
      // Validar y enviar
      if (formData.height && formData.weight && formData.fitPreference) {
        onComplete(formData as UserMeasurements)
      }
    }
  }

  const handlePrevious = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1)
    } else {
      onBack()
    }
  }

  const canContinue = () => {
    if (formStep === 1) {
      return formData.height && formData.height > 0
    }
    if (formStep === 2) {
      return formData.weight && formData.weight > 0
    }
    if (formStep === 3) {
      return formData.fitPreference
    }
    return false
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 w-12 rounded-full transition-colors ${
                  step <= formStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <span className="font-body text-sm text-muted-foreground">
            Paso {formStep} de 3
          </span>
        </div>
        <CardTitle className="font-heading">
          {formStep === 1 && 'Tu altura'}
          {formStep === 2 && 'Tu peso y tipo de cuerpo'}
          {formStep === 3 && 'Tu preferencia de fit'}
        </CardTitle>
        <CardDescription className="font-body">
          {formStep === 1 && 'Ingresá tu altura en centímetros'}
          {formStep === 2 && 'Contanos un poco más sobre tu cuerpo'}
          {formStep === 3 && '¿Cómo te gusta usar tu ropa?'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Altura */}
        {formStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="height" className="font-heading">
                Altura (cm)
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="Ej: 175"
                value={formData.height || ''}
                onChange={(e) =>
                  setFormData({ ...formData, height: Number(e.target.value) })
                }
                className="font-body"
              />
              <p className="text-xs text-muted-foreground font-body">
                Medite descalzo, parado derecho contra una pared
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Peso y tipo de cuerpo */}
        {formStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="weight" className="font-heading">
                Peso (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="Ej: 70"
                value={formData.weight || ''}
                onChange={(e) =>
                  setFormData({ ...formData, weight: Number(e.target.value) })
                }
                className="font-body"
              />
            </div>

            <div className="space-y-3">
              <Label className="font-heading">Tipo de cuerpo (opcional)</Label>
              <RadioGroup
                value={formData.bodyType}
                onValueChange={(value) =>
                  setFormData({ ...formData, bodyType: value as BodyType })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="slim" id="slim" />
                  <Label htmlFor="slim" className="font-body font-normal cursor-pointer">
                    Delgado - Contextura pequeña
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="athletic" id="athletic" />
                  <Label htmlFor="athletic" className="font-body font-normal cursor-pointer">
                    Atlético - Cuerpo tonificado
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular" id="regular" />
                  <Label htmlFor="regular" className="font-body font-normal cursor-pointer">
                    Regular - Contextura promedio
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="muscular" id="muscular" />
                  <Label htmlFor="muscular" className="font-body font-normal cursor-pointer">
                    Musculoso - Hombros anchos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="plus" id="plus" />
                  <Label htmlFor="plus" className="font-body font-normal cursor-pointer">
                    Plus - Contextura grande
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Step 3: Preferencia de fit */}
        {formStep === 3 && (
          <div className="space-y-3">
            <Label className="font-heading">¿Cómo te gusta usar tu ropa?</Label>
            <RadioGroup
              value={formData.fitPreference}
              onValueChange={(value) =>
                setFormData({ ...formData, fitPreference: value as FitPreference })
              }
            >
              <div className="flex items-start space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="tight" id="tight" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="tight" className="font-body font-semibold cursor-pointer">
                    Ajustado
                  </Label>
                  <p className="text-sm text-muted-foreground font-body">
                    Pegado al cuerpo, marca la figura
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="regular" id="regular-fit" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="regular-fit" className="font-body font-semibold cursor-pointer">
                    Regular
                  </Label>
                  <p className="text-sm text-muted-foreground font-body">
                    Fit clásico, cómodo sin ser holgado
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="loose" id="loose" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="loose" className="font-body font-semibold cursor-pointer">
                    Holgado
                  </Label>
                  <p className="text-sm text-muted-foreground font-body">
                    Suelto, con espacio para moverte
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="oversized" id="oversized" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="oversized" className="font-body font-semibold cursor-pointer">
                    Oversized
                  </Label>
                  <p className="text-sm text-muted-foreground font-body">
                    Muy holgado, estilo streetwear
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="font-heading"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canContinue()}
            className="flex-1 font-heading"
          >
            {formStep === 3 ? 'Ver resultados' : 'Siguiente'}
            {formStep < 3 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
