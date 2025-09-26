"use client"

import React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function RevenueAreaChart({ data }: { data: Array<{ bucket: string; revenue: number; expenses: number; profit: number }> }) {
  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="bucket" tickLine={false} axisLine={false} hide={false} />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.15} />
          <Area type="monotone" dataKey="profit" stroke="var(--color-profit)" fill="var(--color-profit)" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
