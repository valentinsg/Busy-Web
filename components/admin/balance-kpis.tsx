"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

type BalanceData = {
  total_revenue: number
  total_expenses: number
  balance: number
  orders_count: number
}

type BalanceKPIsProps = {
  from?: string
  to?: string
  title?: string
  showOrdersCount?: boolean
}

export function BalanceKPIs({ from, to, title = "Balance Histórico", showOrdersCount = false }: BalanceKPIsProps) {
  const [data, setData] = useState<BalanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (from) params.set('from', from)
        if (to) params.set('to', to)
        
        const res = await fetch(`/api/admin/analytics/balance?${params.toString()}`)
        const json = await res.json()
        
        if (res.ok) {
          setData({
            total_revenue: json.total_revenue || 0,
            total_expenses: json.total_expenses || 0,
            balance: json.balance || 0,
            orders_count: json.orders_count || 0
          })
        }
      } catch (error) {
        console.error('Error fetching balance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [from, to])

  if (loading) {
    return (
      <div className="space-y-2">
        {title && <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const isPositive = data.balance >= 0

  return (
    <div className="space-y-2">
      {title && <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>}
      <div className={cn(
        "grid gap-3",
        showOrdersCount ? "grid-cols-4" : "grid-cols-3"
      )}>
        {/* Ingresos Totales */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-muted-foreground">Ingresos</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${data.total_revenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Gastos Totales */}
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-xs font-medium text-muted-foreground">Gastos</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              ${data.total_expenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Balance */}
        <Card className={cn(
          "border-l-4",
          isPositive ? "border-l-blue-500" : "border-l-red-500"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className={cn(
                "h-4 w-4",
                isPositive ? "text-blue-600" : "text-red-600"
              )} />
              <span className="text-xs font-medium text-muted-foreground">
                Balance {!isPositive && <span className="text-[10px] opacity-70">(déficit)</span>}
              </span>
            </div>
            <div className={cn(
              "text-2xl font-bold",
              isPositive ? "text-blue-600" : "text-red-600"
            )}>
              {!isPositive && "-"}${Math.abs(data.balance).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Orders Count (opcional) */}
        {showOrdersCount && (
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground">Órdenes</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {data.orders_count}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
