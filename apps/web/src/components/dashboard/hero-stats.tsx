'use client'

import React, { useState, useEffect } from 'react'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { Search, Bell } from 'lucide-react'

interface HeroStatsProps {
  userName: string
  overdueAmount: number
  expectedCollections: number
  notificationCount?: number
}

export function HeroStats({ userName, overdueAmount, expectedCollections, notificationCount = 0 }: HeroStatsProps) {
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 12 && hour < 17) setGreeting('Good afternoon')
    else if (hour >= 17) setGreeting('Good evening')
    else setGreeting('Good morning')
  }, [])

  const isOnTrack = overdueAmount === 0
  const displayName = userName !== 'there' ? userName : ''

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
      <div className="flex flex-col">
        <h1 className="text-[28px] leading-tight font-semibold text-foreground tracking-tight mb-3 flex items-center gap-2">
          {greeting}{displayName ? `, ${displayName}` : ''}. <span className="inline-block animate-wave text-3xl">👋</span>
        </h1>
        
        <div className="text-[15px] font-medium text-muted-foreground tracking-tight flex flex-col gap-1">
          {isOnTrack ? (
            <>
              <p className="text-emerald-500 font-semibold">Collections are healthy.</p>
              <p>No overdue invoices. <span className="text-foreground"><CurrencyDisplay value={expectedCollections} /></span> expected this week.</p>
              <p>Everything is under control.</p>
            </>
          ) : (
            <>
              <p className="text-rose-500 font-semibold">Needs attention.</p>
              <p>You have <span className="text-foreground"><CurrencyDisplay value={overdueAmount} /></span> in overdue invoices.</p>
              <p><span className="text-foreground"><CurrencyDisplay value={expectedCollections} /></span> expected this week.</p>
            </>
          )}
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-4 mt-2 sm:mt-0">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-64 bg-surface-card rounded-full border border-surface-border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-muted-foreground/70 shadow-sm" 
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand-500 transition-colors" />
        </div>
        
        <button className="relative w-11 h-11 rounded-full border border-surface-border flex items-center justify-center bg-surface-card hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {notificationCount > 0 && (
            <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-surface-card">
              {notificationCount > 9 ? '9+' : notificationCount}
            </div>
          )}
        </button>
        
        <button className="w-11 h-11 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold hover:bg-brand-100 transition-colors shadow-sm">
          {userName.charAt(0).toUpperCase()}
        </button>
      </div>
    </div>
  )
}
