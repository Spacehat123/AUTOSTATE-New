'use client'

import React, { useRef, useState } from 'react'

export function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current.getBoundingClientRect()
    
    // Calculate distance from center of the button
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    
    // Magnetic pull strength (e.g. 20% of distance)
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 })
  }

  const reset = () => {
    setPosition({ x: 0, y: 0 })
  }

  const { x, y } = position

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className="inline-block transition-transform duration-300 ease-out"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      {children}
    </div>
  )
}
