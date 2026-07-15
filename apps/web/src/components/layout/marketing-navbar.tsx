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
            : "w-full rounded-none border-b border-black/10 py-4 px-4 sm:px-8 md:px-10 lg:px-12 bg-white/50 mt-0"
        )}
      >
        {/* Left: AutoState Logo */}
        <Link 
          href="/" 
          className="text-lg sm:text-xl text-zinc-900 font-bold tracking-tighter hover:opacity-70 transition-opacity"
        >
          AutoState
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          {!userId ? (
            <>
              <Link 
                href="/pricing" 
                className="hidden sm:block text-sm sm:text-base text-zinc-500 font-medium transition-colors hover:text-zinc-900"
              >
                View Plans
              </Link>
              <Link 
                href="/sign-in" 
                className="text-sm sm:text-base text-zinc-500 font-medium transition-colors hover:text-zinc-900"
              >
                Sign in
              </Link>
              <Magnetic>
                <Link 
                  href="/sign-up" 
                  className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base rounded-full bg-zinc-900 text-white font-medium shadow-md transition-all hover:bg-zinc-800 hover:scale-[1.02] inline-block"
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
                  className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base rounded-full bg-zinc-900 text-white font-medium shadow-md transition-all hover:bg-zinc-800 hover:scale-[1.02] inline-block"
                >
                  Dashboard
                </Link>
              </Magnetic>
              <MorphingButton />
            </>
          )}
        </div>
      </nav>
    </div>
  )
}
