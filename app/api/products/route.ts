import { getProductsAsync } from '@/lib/repo/products'
import { NextResponse } from 'next/server'

// Categorías que NO deben aparecer en el size calculator (no tienen talles de ropa)
const EXCLUDED_CATEGORIES = ['accesorios', 'accessories', 'pins', 'gorras', 'caps', 'stickers']

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const category = searchParams.get('category') || undefined
    const forSizeCalculator = searchParams.get('forSizeCalculator') === 'true'

    const products = await getProductsAsync({
      category,
      sortBy: 'newest',
    })

    // Filtrar productos según el contexto
    let filteredProducts = products

    if (forSizeCalculator) {
      // Para el size calculator: excluir accesorios y productos sin talles de ropa
      filteredProducts = products.filter(p => {
        // Excluir por categoría
        const cat = p.category?.toLowerCase() || ''
        if (EXCLUDED_CATEGORIES.some(exc => cat.includes(exc))) return false

        // Excluir por tags
        const tags = p.tags || []
        if (tags.some(t => ['pin', 'accessory', 'accesorio', 'gorra', 'cap'].includes(t.toLowerCase()))) return false

        // Solo incluir productos con talles de ropa válidos
        const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42']
        const hasSizes = p.sizes?.some(s => validSizes.includes(s.toUpperCase()))

        return hasSizes
      })
    }

    // Limitar resultados
    const limitedProducts = filteredProducts.slice(0, limit)

    return NextResponse.json({
      products: limitedProducts,
      total: filteredProducts.length
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error al cargar productos' },
      { status: 500 }
    )
  }
}
