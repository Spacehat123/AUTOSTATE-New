'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart2 } from 'lucide-react'
import { CurrencyDisplay } from '@/components/shared/currency-display'

export function MonthlyCollectionsChart({ data = [] }: { data?: any[] }) {
  const chartData = data.length ? data : [
    { name: 'Week 1', total: 0 },
    { name: 'Week 2', total: 0 },
    { name: 'Week 3', total: 0 },
    { name: 'Week 4', total: 0 },
  ]

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
        <BarChart2 className="w-3.5 h-3.5" />
        Collections This Month
      </h2>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Total']}
            />
            <Bar dataKey="total" fill="currentColor" className="fill-emerald-500" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
