'use client'

import * as React from 'react'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ProductCard } from '@/components/shop/product-card'
import {
  getProducts,
  getCategories,
  getAvailableColors,
  getAvailableSizes,
  searchProducts,
} from '@/lib/products'
import type { FilterOptions } from '@/lib/types'
import { capitalize } from '@/lib/format'
import { useI18n } from '@/components/i18n-provider'

export default function ProductsPage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filters, setFilters] = React.useState<FilterOptions>({})
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)

  const categories = getCategories()
  const colors = getAvailableColors()
  const sizes = getAvailableSizes()

  // Get filtered products
  const filteredProducts = React.useMemo(() => {
    if (searchQuery.trim()) {
      return searchProducts(searchQuery).filter((product) => {
        if (filters.category && product.category !== filters.category)
          return false
        if (filters.color && !product.colors.includes(filters.color))
          return false
        if (filters.size && !product.sizes.includes(filters.size)) return false
        if (filters.minPrice && product.price < filters.minPrice) return false
        if (filters.maxPrice && product.price > filters.maxPrice) return false
        return true
      })
    }
    return getProducts(filters)
  }, [searchQuery, filters])

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-medium mb-3">{t('products.filters.category')}</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={filters.category === category}
                onCheckedChange={(checked) =>
                  updateFilter('category', checked ? category : undefined)
                }
              />
              <Label htmlFor={category} className="text-sm">
                {capitalize(category)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Color Filter */}
      <div>
        <h3 className="font-medium mb-3">{t('products.filters.color')}</h3>
        <div className="space-y-2">
          {colors.map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox
                id={color}
                checked={filters.color === color}
                onCheckedChange={(checked) =>
                  updateFilter('color', checked ? color : undefined)
                }
              />
              <Label
                htmlFor={color}
                className="flex items-center space-x-2 text-sm"
              >
                <div
                  className="w-4 h-4 rounded-full border border-border"
                  style={{
                    backgroundColor:
                      color === 'black'
                        ? '#000'
                        : color === 'white'
                        ? '#fff'
                        : color === 'gray'
                        ? '#6b7280'
                        : color === 'navy'
                        ? '#1e3a8a'
                        : color,
                  }}
                />
                <span>{capitalize(color)}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Size Filter */}
      <div>
        <h3 className="font-medium mb-3">{t('products.filters.size')}</h3>
        <div className="space-y-2">
          {sizes.map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={size}
                checked={filters.size === size}
                onCheckedChange={(checked) =>
                  updateFilter('size', checked ? size : undefined)
                }
              />
              <Label htmlFor={size} className="text-sm">
                {size}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">
          {t('products.filters.price_range')}
        </h3>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minPrice" className="text-xs">
                {t('products.filters.min')}
              </Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="$0"
                value={filters.minPrice || ''}
                onChange={(e) =>
                  updateFilter(
                    'minPrice',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-xs">
                {t('products.filters.max')}
              </Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="$500"
                value={filters.maxPrice || ''}
                onChange={(e) =>
                  updateFilter(
                    'maxPrice',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={clearFilters}
        variant="outline"
        className="w-full bg-transparent"
      >
        {t('products.filters.clear_all')}
      </Button>
    </div>
  )

  return (
    <div className="container px-4 py-8 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-4">
            {t('products.header.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('products.header.subtitle')}
          </p>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('products.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={filters.sortBy || ''}
              onValueChange={(value) =>
                updateFilter('sortBy', value || undefined)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('products.sort.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  {t('products.sort.newest')}
                </SelectItem>
                <SelectItem value="price-asc">
                  {t('products.sort.price_asc')}
                </SelectItem>
                <SelectItem value="price-desc">
                  {t('products.sort.price_desc')}
                </SelectItem>
                <SelectItem value="rating">
                  {t('products.sort.rating')}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden bg-transparent"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>{t('products.filters.title')}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium">{t('products.filters.title')}</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {t('products.filters.clear')}
                </Button>
              </div>
              <FilterContent />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {t('products.results.count').replace(
                  '{count}',
                  String(filteredProducts.length)
                )}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Filter className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">
                    {t('products.empty.title')}
                  </h3>
                  <p className="text-sm">{t('products.empty.subtitle')}</p>
                </div>
                <Button onClick={clearFilters} variant="outline">
                  {t('products.empty.clear')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
