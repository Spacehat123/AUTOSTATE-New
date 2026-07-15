'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function MorphingButton() {
  const [phase, setPhase] = useState<'idle' | 'open' | 'closing' | 'filling'>('idle')

  const toggle = () => {
    if (phase === 'open') {
      setPhase('closing')
    } else {
      setPhase('open')
    }
  }

  useEffect(() => {
    if (phase === 'closing') {
      const t1 = setTimeout(() => {
        setPhase('filling')
      }, 300)
      return () => clearTimeout(t1)
    }
    if (phase === 'filling') {
      const t2 = setTimeout(() => {
        setPhase('idle')
      }, 500)
      return () => clearTimeout(t2)
    }
  }, [phase])

  return (
    <div className="relative">
      <button 
        onClick={toggle}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-zinc-500/15 backdrop-blur-md border border-white/30 shadow-sm transition-all hover:bg-zinc-500/25 hover:shadow-md text-zinc-900 overflow-hidden"
        aria-label="Menu"
      >
        {/* Plus Icon */}
        <svg 
          viewBox="0 0 24 24"
          className={`absolute inset-0 m-auto w-5 h-5 transition-all duration-300 ease-in-out ${phase === 'idle' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>

        {/* Minus Icon */}
        <svg 
          viewBox="0 0 24 24"
          className={`absolute inset-0 m-auto w-5 h-5 transition-all duration-300 ease-in-out ${phase === 'open' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M5 12h14" />
        </svg>

        {/* Circle Animation (Closing / Filling) */}
        <svg 
          viewBox="0 0 24 24"
          className={`absolute inset-0 m-auto w-5 h-5 transition-all duration-300 ${(phase === 'closing' || phase === 'filling') ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
          fill="none" stroke="currentColor" strokeWidth="2"
        >
          {/* Empty circle outline */}
          <circle cx="12" cy="12" r="10" />
          {/* Growing filled dot */}
          <circle 
            cx="12" cy="12" r="10" 
            fill="currentColor"
            className="origin-center transition-transform duration-500 ease-out"
            style={{ transform: phase === 'filling' ? 'scale(1)' : 'scale(0)' }}
          />
        </svg>
      </button>

      {/* Popover Contents */}
      <div 
        className={cn(
          "absolute top-full right-0 mt-3 w-48 bg-white/90 backdrop-blur-xl border border-black/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 origin-top-right flex flex-col p-2",
          phase === 'open' ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <Link 
          href="/dashboard"
          className="px-4 py-2.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-black/5 rounded-xl transition-colors flex items-center"
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}
