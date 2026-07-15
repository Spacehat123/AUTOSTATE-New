'use client'

import React, { useState, useEffect } from 'react'

export function DotMatrix() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [shootingSparks, setShootingSparks] = useState<{id: number, x1: number, y1: number, x2: number, y2: number}[]>([])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)

    let sparkId = 0
    // Occasionally spawn sparks that jump 10 dots
    const interval = setInterval(() => {
      // Spawn 1 to 3 sparks at a time
      const count = Math.floor(Math.random() * 3) + 1
      const newSparks = []
      
      for(let i = 0; i < count; i++) {
        // Pick a random grid dot (screen size approx max 3000x2000)
        const x1 = Math.floor((Math.random() * 3000) / 32) * 32 + 16
        const y1 = Math.floor((Math.random() * 2000) / 32) * 32 + 16
        
        // Jump exactly 10 dots (320px)
        const distance = 10 * 32
        const isHorizontal = Math.random() > 0.5
        const direction = Math.random() > 0.5 ? 1 : -1
        
        const x2 = isHorizontal ? x1 + (distance * direction) : x1
        const y2 = isHorizontal ? y1 : y1 + (distance * direction)
        
        sparkId++
        newSparks.push({ id: sparkId, x1, y1, x2, y2 })
      }
      
      setShootingSparks(prev => [...prev, ...newSparks])
      
      // Remove them from DOM after animation completes (600ms)
      const currentIds = newSparks.map(s => s.id)
      setTimeout(() => {
        setShootingSparks(prev => prev.filter(s => !currentIds.includes(s.id)))
      }, 1000)
      
    }, 1200)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes grid-spark {
          0% {
            transform: translate(calc(var(--spark-x1) - 50%), calc(var(--spark-y1) - 50%));
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(var(--spark-x2) - 50%), calc(var(--spark-y2) - 50%));
            opacity: 0;
          }
        }
        .animate-grid-spark {
          animation: grid-spark 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}} />

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
      
      {/* Grid Shooting Sparks (Independent of Cursor) */}
      {shootingSparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute w-1 h-1 rounded-full animate-grid-spark pointer-events-none"
          style={{
            '--spark-x1': `${spark.x1}px`,
            '--spark-y1': `${spark.y1}px`,
            '--spark-x2': `${spark.x2}px`,
            '--spark-y2': `${spark.y2}px`,
            backgroundColor: '#bfdbfe',
            boxShadow: '0 0 12px 2px rgba(147, 197, 253, 0.8)',
          } as React.CSSProperties}
        />
      ))}

      {/* Cursor Spotlight Overlay (Highlights darker base dots when cursor is near) */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          WebkitMaskImage: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
          maskImage: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`
        }}
      >
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.18) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>
    </div>
  )
}
