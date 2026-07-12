import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RiskBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number
}

export function RiskBadge({ score, className, ...props }: RiskBadgeProps) {
  // Cap the score between 0 and 100 to be safe
  const clampedScore = Math.max(0, Math.min(100, score))

  let colorClass = ''
  let label = ''

  if (clampedScore <= 33) {
    // Low Risk
    colorClass = 'bg-green-950/50 text-green-400 border-green-900 hover:bg-green-900/60'
    label = 'Low'
  } else if (clampedScore <= 66) {
    // Medium Risk
    colorClass = 'bg-yellow-950/50 text-yellow-400 border-yellow-900 hover:bg-yellow-900/60'
    label = 'Medium'
  } else {
    // High Risk
    colorClass = 'bg-red-950/50 text-red-400 border-red-900 hover:bg-red-900/60'
    label = 'High'
  }

  return (
    <Badge 
      variant="outline" 
      className={cn("font-semibold px-2.5 py-0.5 whitespace-nowrap", colorClass, className)}
      {...props}
    >
      <span>{clampedScore}</span>
      <span className="mx-1 opacity-50 font-normal">·</span>
      <span className="text-[10px] uppercase tracking-wider opacity-90">{label}</span>
    </Badge>
  )
}
