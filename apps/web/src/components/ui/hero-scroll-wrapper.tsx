'use client'

import React, { useState, useEffect } from 'react'

export function HeroScrollWrapper({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    // Initialize
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fade out as scroll goes from 0 to 400
  const opacity = Math.max(1 - scrollY / 400, 0)
  const yOffset = scrollY * 0.15
  
  return (
    <div 
      className="will-change-transform will-change-opacity"
      style={{ 
        opacity, 
        transform: `translateY(${yOffset}px)`,
        pointerEvents: scrollY > 200 ? 'none' : 'auto'
      }}
    >
      {children}
    </div>
  )
}
