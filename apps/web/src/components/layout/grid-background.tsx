'use client'

import React, { useEffect, useState } from 'react'

export function GridBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    // Set initial position to center so it doesn't look weird before moving
    setMousePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-background">
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 animate-breathe"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: isClient ? `radial-gradient(circle 600px at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 100%), linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15))` : 'none',
          WebkitMaskImage: isClient ? `radial-gradient(circle 600px at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 100%), linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15))` : 'none',
          maskComposite: 'add',
          WebkitMaskComposite: 'add',
          transition: 'mask-image 0.2s ease-out, -webkit-mask-image 0.2s ease-out'
        }}
      />
    </div>
  )
}
