import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: React.ReactNode
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  className?: string
  valueClassName?: string
}

export function StatCard({ title, value, subtitle, icon, trend, className, valueClassName }: StatCardProps) {
  return (
    <Card className={cn("bg-surface-card border-surface-border overflow-hidden relative group", className)}>
      {/* Subtle hover effect for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-slate-500 dark:text-slate-400 h-4 w-4">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold text-brand-500", valueClassName)}>{value}</div>
        
        {(subtitle || trend) && (
          <div className="flex items-center mt-1 text-xs text-slate-500 dark:text-slate-400">
            {trend && (
              <span 
                className={cn(
                  "mr-2 font-medium flex items-center",
                  trend.direction === 'up' ? "text-emerald-500" : "text-rose-500"
                )}
              >
                {trend.direction === 'up' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1"><path d="m18 15-6-6-6 6"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1"><path d="m6 9 6 6 6-6"/></svg>
                )}
                {trend.value}%
              </span>
            )}
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
