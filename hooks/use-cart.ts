"use client"

import { calculateAllPromotions } from "@/lib/checkout/promo-engine"
import { validateCoupon, type Coupon } from "@/lib/coupons"
import type { AppliedPromo, CartItem, Product, Promotion } from "@/types"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  coupon: Coupon | null
  promotions: Promotion[]

  // Actions
  addItem: (product: Product, selectedSize?: string, selectedColor?: string, quantity?: number) => void
  removeItem: (productId: string, selectedSize?: string, selectedColor?: string) => void
  updateQuantity: (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  applyCoupon: (code: string) => Promise<{ ok: boolean; error?: string }>
  removeCoupon: () => void
  setPromotions: (promotions: Promotion[]) => void

  // Computed values
  getTotalItems: () => number
  // For backward compatibility: subtotal before discount
  getTotalPrice: () => number
  // New getters
  getSubtotal: () => number
  getPromoDiscount: () => number
  getDiscount: () => number
  getSubtotalAfterDiscount: () => number
  getItemCount: (productId: string, selectedSize?: string, selectedColor?: string) => number
  getAppliedPromos: () => AppliedPromo[]
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,
      promotions: [],

      addItem: (product, selectedSize = product.sizes[0], selectedColor = product.colors[0], quantity = 1) => {
        set((state) => {
          const sizeStock = product.stockBySize && Object.keys(product.stockBySize).length > 0
            ? (product.stockBySize[selectedSize] ?? 0)
            : product.stock

          // If no stock for the selected size, do nothing
          if (!sizeStock || sizeStock <= 0) {
            return { items: state.items }
          }
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.selectedSize === selectedSize &&
              item.selectedColor === selectedColor,
          )

          if (existingItemIndex > -1) {
            // Update existing item quantity
            const updatedItems = [...state.items]
            const current = updatedItems[existingItemIndex].quantity
            const next = Math.min(current + quantity, sizeStock)
            updatedItems[existingItemIndex].quantity = Math.max(1, Math.min(next, sizeStock))
            return { items: updatedItems }
          } else {
            // Add new item
            const newItem: CartItem = {
              product,
              quantity: Math.max(1, Math.min(quantity, sizeStock)),
              selectedSize,
              selectedColor,
            }
            return { items: [...state.items, newItem] }
          }
        })
      },

      removeItem: (productId, selectedSize, selectedColor) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                (!selectedSize || item.selectedSize === selectedSize) &&
                (!selectedColor || item.selectedColor === selectedColor)
              ),
          ),
        }))
      },

      updateQuantity: (productId, quantity, selectedSize, selectedColor) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedSize, selectedColor)
          return
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (
              item.product.id === productId &&
              (!selectedSize || item.selectedSize === selectedSize) &&
              (!selectedColor || item.selectedColor === selectedColor)
            ) {
              const sizeKey = selectedSize ?? item.selectedSize
              const sizeStock = item.product.stockBySize && Object.keys(item.product.stockBySize).length > 0
                ? (item.product.stockBySize[sizeKey] ?? 0)
                : item.product.stock
              const clamped = Math.max(1, Math.min(quantity, sizeStock))
              return { ...item, quantity: clamped }
            }
            return item
          }),
        }))
      },

      clearCart: () => {
        set({ items: [], coupon: null })
        // Force immediate sync to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('busy-cart-storage', JSON.stringify({
            state: { items: [], coupon: null, isOpen: false, promotions: get().promotions },
            version: 0
          }))
        }
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },

      applyCoupon: async (code: string) => {
        const result = await validateCoupon(code)
        if (!result) {
          return { ok: false, error: "INVALID_COUPON" }
        }
        set({ coupon: result })
        return { ok: true }
      },

      removeCoupon: () => {
        set({ coupon: null })
      },

      setPromotions: (promotions: Promotion[]) => {
        set({ promotions })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        // Backward compatibility, same as getSubtotal
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0)
      },

      getPromoDiscount: () => {
        const { totalDiscount } = calculateAllPromotions(get().items, get().promotions)
        return totalDiscount
      },

      getAppliedPromos: () => {
        const { appliedPromos } = calculateAllPromotions(get().items, get().promotions)
        return appliedPromos
      },

      getDiscount: () => {
        // Primero aplicamos descuentos de promociones (2x1, 3x2)
        const promoDiscount = get().getPromoDiscount()

        // Luego aplicamos cupones sobre el subtotal después de promos
        const coupon = get().coupon
        if (!coupon) return promoDiscount

        const subtotal = get().getSubtotal()
        const subtotalAfterPromo = Math.max(0, subtotal - promoDiscount)
        const couponDiscount = (subtotalAfterPromo * coupon.percent) / 100

        return promoDiscount + Math.max(0, Math.min(couponDiscount, subtotalAfterPromo))
      },

      getSubtotalAfterDiscount: () => {
        const subtotal = get().getSubtotal()
        return Math.max(0, subtotal - get().getDiscount())
      },

      getItemCount: (productId, selectedSize, selectedColor) => {
        const item = get().items.find(
          (item) =>
            item.product.id === productId &&
            (!selectedSize || item.selectedSize === selectedSize) &&
            (!selectedColor || item.selectedColor === selectedColor),
        )
        return item?.quantity || 0
      },
    }),
    {
      name: "busy-cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
