import React from 'react'
import { cn } from '@/lib/utils'

interface CurrencyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number | string | any // 'any' for Prisma Decimal type compatibility without direct import dependency
  compact?: boolean
}

export function CurrencyDisplay({ value, compact = false, className, ...props }: CurrencyDisplayProps) {
  // Safely parse the incoming value to a standard JavaScript number
  let numericValue = 0
  
  if (typeof value === 'number') {
    numericValue = value
  } else if (typeof value === 'string') {
    numericValue = parseFloat(value)
  } else if (value && typeof value.toNumber === 'function') {
    // Handle Prisma/Decimal.js objects gracefully
    numericValue = value.toNumber()
  } else {
    // Fallback if parsing fails or object format is unexpected
    numericValue = Number(value) || 0
  }

  let formattedValue = ''

  if (compact) {
    // Compact formatting logic for Indian number system (Lakhs and Crores)
    const absValue = Math.abs(numericValue)
    const sign = numericValue < 0 ? '-' : ''
    
    if (absValue >= 10000000) {
      // Crores
      const crores = absValue / 10000000
      formattedValue = `${sign}₹${Number(crores.toFixed(2))}Cr`
    } else if (absValue >= 100000) {
      // Lakhs
      const lakhs = absValue / 100000
      formattedValue = `${sign}₹${Number(lakhs.toFixed(2))}L`
    } else {
      // Below 1 Lakh, use standard formatting without decimal points
      formattedValue = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(numericValue)
    }
  } else {
    // Full formatting logic
    formattedValue = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numericValue)
  }

  return (
    <span className={cn("tabular-nums", className)} {...props}>
      {formattedValue}
    </span>
  )
}
