'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { ProductCategory } from '@/lib/repo/categories'

interface CategorySelectorProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  label?: string
}

export function CategorySelector({ 
  value, 
  onChange, 
  required = false,
  label = 'Categoría'
}: CategorySelectorProps) {
  const [categories, setCategories] = React.useState<ProductCategory[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/admin/categories')
        if (!response.ok) throw new Error('Failed to fetch categories')
        const data = await response.json()
        setCategories(data.filter((c: ProductCategory) => c.is_active))
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="h-10 w-full border rounded px-3 py-2 bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="category">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger id="category">
          <SelectValue placeholder="Selecciona una categoría" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {categories.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No hay categorías disponibles. <a href="/admin/categories" className="underline">Crear categoría</a>
        </p>
      )}
    </div>
  )
}
