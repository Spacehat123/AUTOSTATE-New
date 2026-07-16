'use client'

import React from 'react'

export function PhilosophySection() {
  return (
    <section className="relative w-full py-24 sm:py-32 px-6 md:px-12 lg:px-24 bg-white overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Title */}
        <div className="text-center mb-20 sm:mb-24">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-serif tracking-tight text-zinc-900 leading-[1.05]">
            <span className="text-zinc-300">Five apps.</span><br />
            One workspace.
          </h2>
        </div>

        {/* Visual Stack */}
        <div className="relative flex flex-col items-center w-full max-w-sm">
          
          {/* Continuous fading line behind */}
          <div className="absolute top-0 bottom-[40px] w-px bg-gradient-to-b from-transparent via-black/10 to-black/20 z-0"></div>

          {/* Apps funneling down */}
          <div className="flex flex-col items-center gap-6 sm:gap-8 w-full z-10">
            
            <AppPill name="WhatsApp" opacity={0.4} />
            <ArrowDown />
            
            <AppPill name="Excel" opacity={0.5} />
            <ArrowDown />
            
            <AppPill name="Notes" opacity={0.65} />
            <ArrowDown />
            
            <AppPill name="Tasks" opacity={0.8} />
            <ArrowDown />
            
            <AppPill name="Invoices" opacity={1} />
            
            <div className="h-6 sm:h-10"></div>
            
            {/* The Destination: AutoState */}
            <div className="relative group">
              {/* Glow */}
              <div className="absolute -inset-4 bg-gradient-to-b from-transparent to-zinc-200/50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              
              <div className="bg-zinc-900 text-white rounded-full px-12 py-5 sm:px-16 sm:py-6 text-2xl sm:text-3xl font-serif font-bold shadow-[0_20px_40px_rgba(0,0,0,0.15)] ring-8 ring-white relative flex items-center justify-center gap-3">
                AutoState
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}

function AppPill({ name, opacity }: { name: string, opacity: number }) {
  return (
    <div 
      className="bg-zinc-50 border border-black/5 rounded-full px-8 py-3.5 text-[15px] font-medium text-zinc-600 shadow-sm transition-transform hover:scale-105"
      style={{ opacity }}
    >
      {name}
    </div>
  )
}

function ArrowDown() {
  return (
    <div className="text-zinc-300">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    </div>
  )
}
