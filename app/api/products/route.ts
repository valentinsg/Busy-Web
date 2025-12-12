import { getProductsAsync } from '@/lib/repo/products'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const category = searchParams.get('category') || undefined

    const products = await getProductsAsync({
      category,
      sortBy: 'newest',
    })

    // Limitar resultados
    const limitedProducts = products.slice(0, limit)

    return NextResponse.json({
      products: limitedProducts,
      total: products.length
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error al cargar productos' },
      { status: 500 }
    )
  }
}
