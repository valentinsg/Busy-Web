"use client"

import { useEffect } from "react"
import { useCart } from "@/hooks/use-cart"

/**
 * Provider que carga las promociones activas en el carrito
 * Debe estar dentro del layout para que esté disponible en toda la app
 */
export function PromotionsProvider() {
  const { setPromotions } = useCart()

  useEffect(() => {
    // Cargar promociones activas desde la API
    async function loadPromotions() {
      try {
        const response = await fetch('/api/promotions/active')
        if (response.ok) {
          const promotions = await response.json()
          setPromotions(promotions)
        }
      } catch (error) {
        console.error('Error loading promotions:', error)
      }
    }

    loadPromotions()
    
    // Recargar cada 5 minutos
    const interval = setInterval(loadPromotions, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [setPromotions])

  return null
}
