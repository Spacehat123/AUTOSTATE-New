'use client'

import React, { useState, useEffect } from 'react'

export function DotMatrix() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Noise Texture (Film Grain) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02] z-10 pointer-events-none">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Base extremely light dots */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Animated Isometric/Orthogonal Lines connecting dots */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
        <path d="M 128 128 L 384 128 L 384 384 L 768 384 L 768 512" stroke="black" strokeWidth="1" fill="none" strokeDasharray="4 8">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
        </path>
        <path d="M 1024 64 L 1024 256 L 640 256 L 640 768" stroke="black" strokeWidth="1" fill="none" strokeDasharray="4 8">
          <animate attributeName="stroke-dashoffset" from="0" to="100" dur="4s" repeatCount="indefinite" />
        </path>
        <path d="M 64 640 L 256 640 L 256 896 L 512 896" stroke="black" strokeWidth="1" fill="none" strokeDasharray="4 8">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="5s" repeatCount="indefinite" />
        </path>
      </svg>
      {/* Spotlight overlay (+10% opacity in a 400px radius around cursor) */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.18) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          WebkitMaskImage: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
          maskImage: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`
        }}
      />
    </div>
  )
}
