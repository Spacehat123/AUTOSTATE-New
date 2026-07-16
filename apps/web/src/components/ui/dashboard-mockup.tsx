'use client'

import React, { useState, useEffect } from 'react'

export function DashboardMockup() {
  const [scrollY, setScrollY] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Start appearing when scroll reaches 250px, fully visible at 600px
  const progress = Math.min(Math.max(scrollY - 250, 0) / 400, 1)
  
  const scale = 0.85 + (progress * 0.15)
  const opacity = progress
  const yOffset = 100 - (progress * 100)

  return (
    <div 
      className="relative mx-auto w-full max-w-[90%] lg:max-w-[65%] mt-12 mb-40 z-20 will-change-transform will-change-opacity ease-out duration-100"
      style={{
        opacity,
        transform: `translateY(${yOffset}px) scale(${scale})`,
        pointerEvents: opacity < 0.5 ? 'none' : 'auto'
      }}
    >
      {/* Title above */}
      <div className="text-left mb-8 md:mb-12">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-zinc-900 tracking-tight leading-[1.1]">
          Stop chasing payments.<br />
          Get AutoState.
        </h2>
      </div>

      <div className="relative w-full">
        {/* Outer Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-[#e0f2fe] to-[#dcfce7] rounded-[3rem] blur-3xl opacity-50 z-0"></div>
        
        {/* Main App Container */}
        <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col h-[55vh] min-h-[500px] z-10">
          
          {/* Mockup Header (Mac window style) */}
          <div className="h-14 border-b border-black/[0.04] flex items-center justify-between px-4 bg-white/40 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm"></div>
              </div>
              <div className="w-px h-5 bg-black/10 mx-1"></div>
              <div className="w-48 h-7 bg-black/5 rounded-lg flex items-center px-3">
                <div className="w-3 h-3 rounded-full bg-black/10"></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black/5 rounded-full"></div>
              <div className="w-8 h-8 bg-zinc-800 rounded-full shadow-sm border border-black/10"></div>
            </div>
          </div>

          {/* Mockup Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 border-r border-black/[0.04] bg-white/30 flex flex-col items-center py-6 gap-6">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 shadow-md"></div>
              <div className="w-6 h-6 rounded-lg bg-black/5 mt-4"></div>
              <div className="w-6 h-6 rounded-lg bg-black/5"></div>
              <div className="w-6 h-6 rounded-lg bg-black/5"></div>
              <div className="w-6 h-6 rounded-lg bg-black/5"></div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 sm:p-10 bg-zinc-50/30 flex flex-col gap-8 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="w-48 h-8 bg-zinc-200/50 rounded-xl"></div>
                <div className="w-28 h-9 bg-zinc-900 rounded-xl shadow-md"></div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 sm:h-32 bg-white/60 backdrop-blur-md border border-white rounded-2xl p-5 flex flex-col justify-between shadow-[0_8px_16px_-6px_rgba(0,0,0,0.03)]">
                    <div className="w-10 h-10 rounded-full bg-black/[0.03] flex items-center justify-center">
                      <div className="w-4 h-4 bg-black/10 rounded-sm"></div>
                    </div>
                    <div>
                      <div className="w-16 h-3 bg-black/10 rounded-md mb-2.5"></div>
                      <div className="w-24 h-6 bg-zinc-800 rounded-md"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table / List */}
              <div className="flex-1 bg-white/60 backdrop-blur-md border border-white rounded-2xl shadow-[0_8px_16px_-6px_rgba(0,0,0,0.03)] p-6 flex flex-col gap-2 overflow-hidden">
                <div className="w-32 h-5 bg-zinc-200/50 rounded-md mb-4"></div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-black/5 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-black/5"></div>
                      <div className="flex flex-col gap-2">
                        <div className="w-28 h-4 bg-zinc-800 rounded-md"></div>
                        <div className="w-16 h-3 bg-black/10 rounded-md"></div>
                      </div>
                    </div>
                    <div className="w-20 h-6 bg-[#dcfce7] rounded-full border border-[#bbf7d0]"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caption below, right aligned */}
      <div className="mt-4 flex justify-end items-center gap-2 text-[11px] font-medium text-zinc-400 tracking-wider uppercase">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fill-empty {
            0%, 100% { background-color: transparent; }
            50% { background-color: currentColor; }
          }
        `}} />
        <span 
          className="inline-block w-[7px] h-[7px] rounded-full border border-current"
          style={{ animation: 'fill-empty 1s ease-in-out infinite' }}
        />
        <span>AutoState Workspace</span>
      </div>
    </div>
  )
}
