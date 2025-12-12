'use client'

import { SizeCalculatorWizard } from '@/components/size-calculator/size-calculator-wizard'
import { Suspense } from 'react'

function SizeCalculatorLoading() {
  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container px-3 sm:px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-pulse" />
          <div className="h-12 bg-muted rounded-lg w-3/4 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-muted rounded-lg w-1/2 mx-auto animate-pulse" />
        </div>
        <div className="h-96 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}

export default function SizeCalculatorPage() {
  return (
    <Suspense fallback={<SizeCalculatorLoading />}>
      <SizeCalculatorWizard />
    </Suspense>
  )
}
