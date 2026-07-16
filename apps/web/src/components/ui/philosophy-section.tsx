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

        {/* Visual Stack (Responsive Pipeline) */}
        <div className="relative w-full max-w-7xl mx-auto pb-12 px-6 sm:px-12 flex items-center justify-center">
          
          <div className="relative flex items-center justify-center w-full">
            {/* Horizontal line for desktop */}
            <div className="hidden xl:block absolute left-0 right-[40px] top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-black/10 to-black/20 z-0"></div>
            {/* Vertical line for mobile */}
            <div className="xl:hidden absolute top-0 bottom-[40px] left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-black/10 to-black/20 z-0"></div>

            {/* Apps funneling */}
            <div className="flex flex-col xl:flex-row items-center gap-6 sm:gap-8 z-10">
              
              {/* WhatsApp */}
              <div className="opacity-[0.4] hover:opacity-100 transition-opacity transform hover:scale-105 shrink-0">
                <div className="bg-[#25D366] text-white rounded-2xl rounded-tr-none px-5 py-3 shadow-sm font-medium text-[15px] relative w-48 text-center flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  WhatsApp
                </div>
              </div>
              <ArrowResponsive />
              
              {/* Excel */}
              <div className="opacity-[0.55] hover:opacity-100 transition-opacity transform hover:scale-105 shrink-0">
                <div className="bg-white border border-green-600/20 shadow-sm rounded-xl overflow-hidden w-48 text-left">
                  <div className="bg-[#107C41] text-white text-[11px] font-bold px-3 py-1.5 flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
                    Spreadsheet
                  </div>
                  <div className="p-2 grid grid-cols-3 gap-1">
                    <div className="h-2 bg-zinc-100 rounded-sm"></div><div className="h-2 bg-zinc-100 rounded-sm"></div><div className="h-2 bg-zinc-100 rounded-sm"></div>
                    <div className="h-2 bg-zinc-100 rounded-sm"></div><div className="h-2 bg-zinc-100 rounded-sm"></div><div className="h-2 bg-zinc-100 rounded-sm"></div>
                    <div className="h-2 bg-green-100 rounded-sm"></div><div className="h-2 bg-zinc-100 rounded-sm"></div><div className="h-2 bg-zinc-100 rounded-sm"></div>
                  </div>
                </div>
              </div>
              <ArrowResponsive />
              
              {/* Notes */}
              <div className="opacity-[0.7] hover:opacity-100 transition-opacity transform hover:scale-105 shrink-0">
                <div className="bg-[#FEF9C3] border border-[#fef08a] shadow-sm rounded-xl p-4 w-48 text-left">
                  <div className="text-[13px] font-serif font-bold text-yellow-900 mb-2">Meeting Notes</div>
                  <div className="space-y-2">
                    <div className="w-full h-px bg-yellow-400/30"></div>
                    <div className="w-5/6 h-px bg-yellow-400/30"></div>
                    <div className="w-3/4 h-px bg-yellow-400/30"></div>
                  </div>
                </div>
              </div>
              <ArrowResponsive />
              
              {/* Tasks */}
              <div className="opacity-[0.85] hover:opacity-100 transition-opacity transform hover:scale-105 shrink-0">
                <div className="bg-white border border-black/5 shadow-sm rounded-xl p-3.5 w-48">
                  <div className="flex items-center gap-2 mb-2 opacity-50">
                    <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div className="text-[11px] font-semibold line-through text-zinc-500">Call client</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-300 shrink-0"></div>
                    <div className="text-[12px] font-semibold text-zinc-900">Send contract</div>
                  </div>
                </div>
              </div>
              <ArrowResponsive />
              
              {/* Invoices */}
              <div className="opacity-[1] hover:opacity-100 transition-opacity transform hover:scale-105 shrink-0">
                <div className="bg-white border border-black/5 shadow-sm rounded-xl p-4 w-48 text-center flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center mb-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Invoice #042</div>
                  <div className="text-[16px] font-serif font-bold text-zinc-900 mt-0.5">$1,250.00</div>
                </div>
              </div>
              
              <div className="w-6 h-6 xl:w-10 xl:h-10 shrink-0"></div>
              
              {/* The Destination: AutoState */}
              <div className="relative group shrink-0">
                {/* Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-transparent to-zinc-200/50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                
                <div className="bg-zinc-900 text-white rounded-full px-12 py-5 sm:px-16 sm:py-6 text-2xl sm:text-3xl font-serif font-bold shadow-[0_20px_40px_rgba(0,0,0,0.15)] ring-8 ring-white relative flex items-center justify-center gap-3">
                  AutoState
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ArrowResponsive() {
  return (
    <div className="text-zinc-300 py-1 xl:py-0 xl:px-1 shrink-0">
      {/* Mobile: Down Arrow */}
      <svg className="xl:hidden" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
      {/* Desktop: Right Arrow */}
      <svg className="hidden xl:block" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  )
}
