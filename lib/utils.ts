import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency with symbol
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$",
    ARS: "$",
    EUR: "€",
    GBP: "£",
  }

  const symbol = symbols[currency] || currency
  return `${symbol} ${amount.toFixed(2)}`
}
