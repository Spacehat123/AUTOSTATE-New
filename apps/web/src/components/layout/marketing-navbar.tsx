'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { MorphingButton } from './morphing-button'
import { Magnetic } from '@/components/ui/magnetic'
import { cn } from '@/lib/utils'

export function MarketingNavbar({ userId }: { userId: string | null }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Trigger floating mode after scrolling down 20px
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav 
        className={cn(
          "pointer-events-auto flex items-center justify-between transition-all duration-500 ease-out backdrop-blur-md",
          isScrolled 
            ? "w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] rounded-full border border-black/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] py-3 px-6 sm:px-8 bg-white/70 mt-4"
            : "w-full rounded-none border-b border-black/5 py-4 px-6 md:px-12 lg:px-16 bg-white/50 mt-0"
        )}
      >
        {/* Left: AutoState Logo */}
        <Link 
          href="/" 
          className={cn(
            "text-zinc-900 font-bold tracking-tight font-serif hover:opacity-70 transition-all",
            isScrolled ? "text-xl" : "text-2xl"
          )}
        >
          AutoState
        </Link>

        {/* Right: Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {!userId ? (
            <>
              <Link 
                href="/pricing" 
                className="hidden sm:block text-sm text-zinc-500 font-medium transition-colors hover:text-zinc-900 mr-2"
              >
                View Plans
              </Link>
              <Link 
                href="/sign-in" 
                className="text-sm text-zinc-500 font-medium transition-colors hover:text-zinc-900 mr-2"
              >
                Sign in
              </Link>
              <Magnetic>
                <Link 
                  href="/sign-up" 
                  className="px-4 py-2 sm:px-5 sm:py-2 text-sm rounded-full bg-zinc-900 text-white font-medium shadow-md transition-all hover:bg-zinc-800"
                >
                  Getting Started
                </Link>
              </Magnetic>
            </>
          ) : (
            <>
              <Magnetic>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 sm:px-5 sm:py-2 text-sm rounded-full bg-zinc-900 text-white font-medium shadow-md transition-all hover:bg-zinc-800"
                >
                  Dashboard
                </Link>
              </Magnetic>
              <button className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  )
}
