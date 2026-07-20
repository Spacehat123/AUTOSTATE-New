'use client'

import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart2, Calendar as CalendarIcon } from 'lucide-react'

export function MonthlyCollectionsChart({ data = [] }: { data?: any[] }) {
  const chartData = data.length ? data : [
    { name: 'Week 1', total: 0 },
    { name: 'Week 2', total: 0 },
    { name: 'Week 3', total: 0 },
    { name: 'Week 4', total: 0 },
  ]

  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <BarChart2 className="w-4 h-4" />
          Collections This Month
        </h2>
        <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-foreground px-3 py-1.5 rounded-lg border border-surface-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <CalendarIcon className="w-3.5 h-3.5" />
          This Month
        </button>
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0047ff" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#0047ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value / 1000}k`}
              dx={-10}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => [`₹${Number(value ?? 0).toLocaleString()}`, 'Total']}
            />
            <Area type="monotone" dataKey="total" stroke="#0047ff" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
