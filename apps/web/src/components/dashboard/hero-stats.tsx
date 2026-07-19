import React from 'react'
import { CurrencyDisplay } from '@/components/shared/currency-display'

interface HeroStatsProps {
  userName: string
  overdueAmount: number
  expectedCollections: number
}

export function HeroStats({ userName, overdueAmount, expectedCollections }: HeroStatsProps) {
  const isOnTrack = overdueAmount === 0

  return (
    <div className="flex flex-col">
      <h1 className="text-[28px] leading-tight font-medium text-foreground tracking-tight mb-6">
        Good morning{userName !== 'there' ? `, ${userName}` : ''}.
      </h1>
      
      <div className="text-[28px] leading-tight font-medium text-muted-foreground tracking-tight max-w-2xl">
        {isOnTrack ? (
          <div className="space-y-2">
            <p className="text-foreground">You're on track.</p>
            <p>No overdue invoices.</p>
            <p className="flex items-center gap-2">
              Expected collections: <span className="text-foreground"><CurrencyDisplay value={expectedCollections} /></span> this week.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-rose-500">Needs attention.</p>
            <p className="flex items-center gap-2">
              <span className="text-foreground"><CurrencyDisplay value={overdueAmount} /></span> overdue across your invoices.
            </p>
            <p className="flex items-center gap-2">
              Expected collections: <span className="text-foreground"><CurrencyDisplay value={expectedCollections} /></span> this week.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
