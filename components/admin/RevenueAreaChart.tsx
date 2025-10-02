"use client"

import React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

type ChartData = { bucket: string; revenue: number; revenue_prev?: number }

export default function RevenueAreaChart({ data, showComparison }: { data: ChartData[]; showComparison?: boolean }) {
  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="bucket" tickLine={false} axisLine={false} hide={false} />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <Tooltip />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="hsl(142, 76%, 36%)" 
            fill="hsl(142, 76%, 36%)" 
            fillOpacity={0.2}
            name="Ingresos"
          />
          {showComparison && (
            <Area 
              type="monotone" 
              dataKey="revenue_prev" 
              stroke="hsl(0, 84%, 60%)" 
              fill="hsl(0, 84%, 60%)" 
              fillOpacity={0.1}
              strokeDasharray="5 5"
              name="Período anterior"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
