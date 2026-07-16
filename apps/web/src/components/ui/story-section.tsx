'use client'

import React from 'react'

export function StorySection() {
  return (
    <section className="relative w-full py-24 sm:py-32 px-6 md:px-12 lg:px-24 bg-[#fafafa]">
      <div className="max-w-3xl mx-auto text-center mb-20 sm:mb-24">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-zinc-900 tracking-tight leading-[1.1]">
          One customer. One message.<br />
          <span className="text-zinc-400">Everything handled.</span>
        </h2>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Central Wire */}
        <div className="absolute top-0 bottom-12 left-[28px] sm:left-1/2 sm:-translate-x-1/2 w-px bg-gradient-to-b from-transparent via-black/10 to-transparent"></div>

        {/* 1. Customer Message */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center w-full mb-16">
          <div className="hidden sm:flex w-1/2 pr-12 justify-end">
            <div className="inline-block bg-white border border-black/5 rounded-2xl rounded-tr-sm p-5 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.04)] text-left relative max-w-[280px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-zinc-200"></div>
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Customer</div>
              </div>
              <div className="text-[15px] font-medium text-zinc-800">"Can you send me the invoice?"</div>
              
              {/* Connector dot */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-[54px] w-3 h-3 rounded-full border-[3px] border-[#fafafa] bg-zinc-300"></div>
            </div>
          </div>
          
          {/* Mobile version */}
          <div className="sm:hidden pl-16 relative w-full">
            <div className="absolute top-1/2 -translate-y-1/2 left-[23px] w-3 h-3 rounded-full border-[3px] border-[#fafafa] bg-zinc-300"></div>
            <div className="bg-white border border-black/5 rounded-2xl rounded-tl-sm p-4 shadow-sm text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-zinc-200"></div>
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Customer</div>
              </div>
              <div className="text-sm font-medium text-zinc-800">"Can you send me the invoice?"</div>
            </div>
          </div>
        </div>

        {/* 2. AutoState Hub */}
        <div className="relative z-20 flex justify-start sm:justify-center mb-16 pl-[10px] sm:pl-0">
          <div className="bg-zinc-900 text-white rounded-full px-5 py-2.5 text-sm font-semibold flex items-center gap-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.15)] ring-[6px] ring-[#fafafa]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
            AutoState AI
          </div>
        </div>

        {/* 3. Action 1: Creates invoice */}
        <ActionCard side="right" text="Creates invoice" />
        
        {/* 4. Action 2: Replies on WhatsApp */}
        <ActionCard side="left" text="Replies on WhatsApp" />
        
        {/* 5. Action 3: Creates follow-up task */}
        <ActionCard side="right" text="Creates follow-up task" />
        
        {/* 6. Action 4: Updates customer history */}
        <ActionCard side="left" text="Updates customer history" />

      </div>
    </section>
  )
}

function ActionCard({ side, text }: { side: 'left' | 'right', text: string }) {
  const isLeft = side === 'left'
  
  return (
    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center w-full mb-8">
      {isLeft ? (
        <div className="hidden sm:flex w-1/2 pr-12 justify-end">
          <div className="inline-flex items-center gap-4 bg-white border border-black/5 rounded-2xl p-4 shadow-sm relative">
            <div className="w-6 h-6 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div className="text-[15px] font-semibold text-zinc-800 whitespace-nowrap">{text}</div>
            
            <div className="absolute top-1/2 -translate-y-1/2 -right-[54px] w-3 h-3 rounded-full border-[3px] border-[#fafafa] bg-[#16a34a]"></div>
          </div>
        </div>
      ) : (
        <div className="hidden sm:block w-1/2"></div>
      )}

      {/* Right side (Desktop) */}
      {!isLeft ? (
        <div className="hidden sm:block w-1/2 pl-12 text-left">
          <div className="inline-flex items-center gap-4 bg-white border border-black/5 rounded-2xl p-4 shadow-sm relative">
            <div className="absolute top-1/2 -translate-y-1/2 -left-[54px] w-3 h-3 rounded-full border-[3px] border-[#fafafa] bg-[#16a34a]"></div>
            
            <div className="w-6 h-6 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div className="text-[15px] font-semibold text-zinc-800 whitespace-nowrap">{text}</div>
          </div>
        </div>
      ) : (
        <div className="hidden sm:block w-1/2"></div>
      )}

      {/* Mobile version (Always on the right of the line) */}
      <div className="sm:hidden pl-16 relative w-full">
        <div className="absolute top-1/2 -translate-y-1/2 left-[23px] w-3 h-3 rounded-full border-[3px] border-[#fafafa] bg-[#16a34a]"></div>
        <div className="flex items-center gap-3 bg-white border border-black/5 rounded-xl p-3.5 shadow-sm text-left">
          <div className="w-5 h-5 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div className="text-sm font-semibold text-zinc-800">{text}</div>
        </div>
      </div>
    </div>
  )
}
