'use client'

import { useI18n } from '@/components/i18n-provider'
import { ProductCard } from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { capitalize } from '@/lib/format'
import { getProductsAsync, searchProductsAsync, type SortBy } from '@/lib/repo/products'
import type { FilterOptions, Product } from '@/lib/types'
import { Filter, Search, SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'

type ProductsClientProps = {
  initialCategory?: string
  initialProducts?: Product[]
}

export default function ProductsClient({ initialCategory, initialProducts = [] }: ProductsClientProps) {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filters, setFilters] = React.useState<FilterOptions>({})
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [asyncProducts, setAsyncProducts] = React.useState<Product[]>(initialProducts)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Show categories in ES as requested
  const categories = React.useMemo(() => ['buzos', 'remeras', 'accesorios'] as const, [])
  // Local inputs to avoid filtering while typing
  const [minPriceInput, setMinPriceInput] = React.useState('')
  const [maxPriceInput, setMaxPriceInput] = React.useState('')
  const [hydrated, setHydrated] = React.useState(false)
  const [isEditingPrice, setIsEditingPrice] = React.useState(false)

  // Seed filters from URL on first render
  React.useEffect(() => {
    const fromQuery = searchParams?.get('category') || undefined
    const fromPath = (() => {
      if (!pathname) return undefined
      const m = pathname.match(/^\/products\/category\/([^\/]+)(?:\/)?$/)
      return m ? decodeURIComponent(m[1]) : undefined
    })()
    // Normalize EN aliases to ES
    const aliasMap: Record<string, FilterOptions['category']> = {
      hoodies: 'buzos',
      tshirts: 'remeras',
      accessories: 'accesorios',
    }
    const raw = (initialCategory || fromPath || fromQuery) as string | undefined
    const cat = (raw ? (aliasMap[raw] ?? raw) : undefined) as FilterOptions['category']
    if (cat) {
      setFilters((prev) => (prev.category ? prev : { ...prev, category: cat }))
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    let cancelled = false
    if (!hydrated) return
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = {
          category: filters.category,
          color: filters.color,
          size: filters.size,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          sortBy: (filters.sortBy as SortBy | undefined) ?? undefined,
        }
        if (searchQuery.trim()) {
          const list = await searchProductsAsync(searchQuery.trim())
          const filtered = list.filter((p) => {
            if (filters.category && p.category !== filters.category) return false
            if (filters.color && !p.colors.includes(filters.color)) return false
            if (filters.size && !p.sizes.includes(filters.size)) return false
            if (filters.minPrice !== undefined && p.price < filters.minPrice) return false
            if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false
            return true
          })
          if (!cancelled) setAsyncProducts(filtered)
        } else {
          const list = await getProductsAsync(params)
          if (!cancelled) setAsyncProducts(list)
        }
      } catch {
        if (!cancelled) {
          setAsyncProducts([])
          setError('offline')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [searchQuery, filters, hydrated])

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K] | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
  }

  // Keep URL in sync with selected filters
  React.useEffect(() => {
    if (!router || !pathname || !hydrated) return
    if (isEditingPrice) return
    // Prevent initial fallback to /products while hydrating a category path
    if (!filters.category && /^\/products\/category\//.test(pathname)) return
    const otherParams = new URLSearchParams()
    if (filters.color) otherParams.set('color', String(filters.color))
    if (filters.size) otherParams.set('size', String(filters.size))
    if (filters.minPrice !== undefined) otherParams.set('minPrice', String(filters.minPrice))
    if (filters.maxPrice !== undefined) otherParams.set('maxPrice', String(filters.maxPrice))
    if (filters.sortBy) otherParams.set('sort', String(filters.sortBy))
    if (searchQuery.trim()) otherParams.set('q', searchQuery.trim())

    const qs = otherParams.toString()

    if (filters.category) {
      const target = `/products/category/${filters.category}${qs ? `?${qs}` : ''}`
      if (pathname + (searchParams?.toString() ? `?${searchParams?.toString()}` : '') !== target) {
        router.replace(target)
      }
    } else {
      const target = `/products${qs ? `?${qs}` : ''}`
      if (pathname !== '/products' || (searchParams && searchParams.toString() !== qs)) {
        router.replace(target)
      }
    }
    // Intentionally include only dependencies that change URL meaningfully
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isEditingPrice, filters.category, filters.color, filters.size, filters.minPrice, filters.maxPrice, filters.sortBy, searchQuery])

  const applyPrice = () => {
    updateFilter('minPrice', minPriceInput ? Number(minPriceInput) : undefined)
    updateFilter('maxPrice', maxPriceInput ? Number(maxPriceInput) : undefined)
  }

  // Colors from current result set; hide section when empty
  const availableColors = React.useMemo(() => {
    const set = new Set<string>()
    for (const p of asyncProducts) {
      for (const c of p.colors || []) set.add(c)
    }
    return Array.from(set)
  }, [asyncProducts])

  // Predefined sizes and mapping from product values to predefined
  const PREDEFINED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const

  // Only show sizes if not all products are accessories
  const hasNonAccessoryProducts = React.useMemo(() => {
    return asyncProducts.some(p => p.category !== 'accesorios')
  }, [asyncProducts])

  const availableSizes = hasNonAccessoryProducts ? (PREDEFINED_SIZES as unknown as string[]) : []

  const FilterContent = () => (
    <div className="space-y-6 font-body">
      {/** compute visibility for optional sections to manage separators */}
      {(() => { return null })()}
      <div>
        <h3 className="font-heading font-medium mb-3">{t('products.filters.category')}</h3>
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
              <Label htmlFor={category} className="text-sm font-body">
                {capitalize(category)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {asyncProducts.length > 0 && availableColors.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-heading font-medium mb-3">{t('products.filters.color')}</h3>
            <div className="space-y-2">
              {availableColors.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={color}
                    checked={filters.color === color}
                    onCheckedChange={(checked) =>
                      updateFilter('color', checked ? color : undefined)
                    }
                  />
                  <Label htmlFor={color} className="flex items-center text-sm font-body">
                    <div
                      className="w-4 h-4 rounded-full border border-border"
                      style={{
                        backgroundColor:
                          color === 'black' ? '#000' :
                          color === 'white' ? '#fff' :
                          color === 'gray' ? '#6b7280' :
                          color === 'navy' ? '#1e3a8a' : color,
                      }}
                    />
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {asyncProducts.length > 0 && availableSizes.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-heading font-medium mb-3">{t('products.filters.size')}</h3>
            <div className="grid grid-cols-3 gap-2">
              {availableSizes.map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={size}
                    checked={filters.size === size}
                    onCheckedChange={(checked) => updateFilter('size', checked ? size : undefined)}
                  />
                  <Label htmlFor={size} className="text-sm font-body">{size}</Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {(asyncProducts.length > 0 && (availableColors.length > 0 || availableSizes.length > 0)) && <Separator />}

      <div>
        <h3 className="font-medium mb-3">{t('products.filters.price_range')}</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minPrice" className="text-xs font-body">{t('products.filters.min')}</Label>
              <Input id="minPrice" type="number" placeholder="$0" value={minPriceInput}
                onFocus={() => setIsEditingPrice(true)}
                onChange={(e) => setMinPriceInput(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-xs font-body">{t('products.filters.max')}</Label>
              <Input id="maxPrice" type="number" placeholder="$500" value={maxPriceInput}
                onFocus={() => setIsEditingPrice(true)}
                onChange={(e) => setMaxPriceInput(e.target.value)} />
            </div>
          </div>
          <div className="pt-2">
            <Button onClick={() => { setIsEditingPrice(false); applyPrice() }} variant="outline" className="w-full bg-transparent">{t('products.filters.apply_price', { default: 'Aplicar precio' })}</Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto font-body">
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
            onValueChange={(value: string) =>
              updateFilter('sortBy', (value || undefined) as FilterOptions['sortBy'] | undefined)
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

          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden bg-transparent">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="font-heading">{t('products.filters.title')}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-medium">{t('products.filters.title')}</h2>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t('products.filters.clear')}
              </Button>
            </div>
            <FilterContent />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <p className="font-body text-sm text-muted-foreground">
              {t('products.results.count').replace(
                '{count}',
                String(asyncProducts.length)
              )}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Image src="/busy-charge.gif" alt="Cargando" width={320} height={320} className="object-contain opacity-90" unoptimized />
            </div>
          ) : asyncProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Filter className="h-12 w-12 mx-auto mb-4" />
                <h3 className="font-heading font-medium mb-2">
                  {t('products.empty.title')}
                </h3>
                <p className="font-body text-sm">{error === 'offline' ? 'No se pudo cargar desde el servidor. Reintenta.' : t('products.empty.subtitle')}</p>
              </div>
              <div className="flex items-center justify-center">
                <Button onClick={clearFilters} variant="outline">
                  {t('products.empty.clear')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 xl:gap-6">
              {asyncProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
