"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Product, CartItem } from "@/lib/types"

interface CartStore {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (product: Product, selectedSize?: string, selectedColor?: string, quantity?: number) => void
  removeItem: (productId: string, selectedSize?: string, selectedColor?: string) => void
  updateQuantity: (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void

  // Computed values
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemCount: (productId: string, selectedSize?: string, selectedColor?: string) => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, selectedSize = product.sizes[0], selectedColor = product.colors[0], quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.selectedSize === selectedSize &&
              item.selectedColor === selectedColor,
          )

          if (existingItemIndex > -1) {
            // Update existing item quantity
            const updatedItems = [...state.items]
            updatedItems[existingItemIndex].quantity += quantity
            return { items: updatedItems }
          } else {
            // Add new item
            const newItem: CartItem = {
              product,
              quantity,
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
          items: state.items.map((item) =>
            item.product.id === productId &&
            (!selectedSize || item.selectedSize === selectedSize) &&
            (!selectedColor || item.selectedColor === selectedColor)
              ? { ...item, quantity }
              : item,
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0)
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
