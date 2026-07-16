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

      <div className="relative max-w-2xl mx-auto mt-12">
        {/* Central Wire */}
        <div className="absolute top-0 bottom-12 left-[28px] sm:left-1/2 sm:-translate-x-1/2 w-px bg-gradient-to-b from-transparent via-black/10 to-transparent"></div>

        {/* 1. Customer Message (Incoming WhatsApp) */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center w-full mb-16">
          <div className="hidden sm:flex w-1/2 pr-12 justify-end">
            <div className="relative">
              {/* WhatsApp Incoming Bubble */}
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tr-none shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-black/[0.02] max-w-[260px] relative">
                <div className="absolute top-0 -right-2 w-4 h-4 bg-white" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 0)' }}></div>
                <div className="text-[14px] text-[#111b21] leading-snug pr-2">Can you send me the invoice?</div>
                <div className="text-[10px] text-zinc-400 mt-1.5 text-right font-medium">10:42 AM</div>
              </div>
              
              {/* Connector dot */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-[54px] w-3 h-3 rounded-full border-[3px] border-[#fafafa] bg-zinc-300"></div>
            </div>
          </div>
          
          {/* Mobile version */}
          <div className="sm:hidden pl-16 relative w-full">
            <div className="absolute top-1/2 -translate-y-1/2 left-[23px] w-3 h-3 rounded-full border-[3px] border-[#fafafa] bg-zinc-300"></div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-black/[0.02] max-w-[260px] relative">
              <div className="absolute top-0 -left-2 w-4 h-4 bg-white" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}></div>
              <div className="text-[14px] text-[#111b21] leading-snug">Can you send me the invoice?</div>
              <div className="text-[10px] text-zinc-400 mt-1.5 text-right font-medium">10:42 AM</div>
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
        <VisualAction side="right">
          <div className="bg-white border border-black/5 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] rounded-xl p-4 w-56 transform rotate-1 hover:rotate-0 transition-transform">
            <div className="flex justify-between items-center mb-3 border-b border-black/5 pb-2">
              <div className="w-12 h-3 bg-zinc-200 rounded-sm"></div>
              <div className="text-[12px] font-bold text-zinc-900 font-serif">$4,200</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center"><div className="w-full h-1.5 bg-zinc-100 rounded-sm mr-4"></div><div className="w-6 h-1.5 bg-zinc-200 rounded-sm"></div></div>
              <div className="flex justify-between items-center"><div className="w-3/4 h-1.5 bg-zinc-100 rounded-sm mr-4"></div><div className="w-6 h-1.5 bg-zinc-200 rounded-sm"></div></div>
              <div className="flex justify-between items-center"><div className="w-5/6 h-1.5 bg-zinc-100 rounded-sm mr-4"></div><div className="w-6 h-1.5 bg-zinc-200 rounded-sm"></div></div>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider text-center">Invoice Generated</div>
          </div>
        </VisualAction>
        
        {/* 4. Action 2: Replies on WhatsApp (Outgoing) */}
        <VisualAction side="left">
          <div className="bg-[#dcf8c6] px-4 py-3 rounded-2xl rounded-tr-none shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-black/[0.02] w-56 relative -rotate-1 hover:rotate-0 transition-transform">
            <div className="absolute top-0 -right-2 w-4 h-4 bg-[#dcf8c6]" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 0)' }}></div>
            <div className="text-[14px] text-[#111b21] leading-snug">Sent! The invoice is due in 14 days.</div>
            <div className="flex justify-end items-center gap-1 mt-1.5">
              <div className="text-[10px] text-zinc-500 font-medium">10:42 AM</div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#53bdeb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>
        </VisualAction>
        
        {/* 5. Action 3: Creates follow-up task */}
        <VisualAction side="right">
          <div className="bg-white border border-black/5 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] rounded-xl p-3.5 flex items-start gap-3 w-56 rotate-1 hover:rotate-0 transition-transform">
            <div className="w-5 h-5 rounded-md bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-zinc-800 leading-tight">Follow up on payment</div>
              <div className="text-[11px] font-medium text-blue-500 mt-1 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Next Friday
              </div>
            </div>
          </div>
        </VisualAction>
        
        {/* 6. Action 4: Updates customer history */}
        <VisualAction side="left">
          <div className="bg-white border border-black/5 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] rounded-xl p-3.5 w-60 flex gap-3 items-center -rotate-1 hover:rotate-0 transition-transform">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-black/5">
              <div className="text-[15px] font-serif font-bold text-zinc-500">A</div>
            </div>
            <div>
              <div className="text-[13px] font-bold text-zinc-900">Alex (Client)</div>
              <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Profile updated
              </div>
            </div>
          </div>
        </VisualAction>

      </div>
    </section>
  )
}

function VisualAction({ side, children }: { side: 'left' | 'right', children: React.ReactNode }) {
  const isLeft = side === 'left'
  
  return (
    <div className="relative z-10 flex flex-col sm:flex-row items-center w-full mb-12">
      {isLeft ? (
        <div className="hidden sm:flex w-1/2 pr-10 justify-end">
          <div className="relative">
            {children}
            <div className="absolute top-1/2 -translate-y-1/2 -right-[46px] w-2.5 h-2.5 rounded-full border-[2px] border-[#fafafa] bg-[#16a34a]"></div>
          </div>
        </div>
      ) : (
        <div className="hidden sm:block w-1/2"></div>
      )}

      {/* Right side (Desktop) */}
      {!isLeft ? (
        <div className="hidden sm:flex w-1/2 pl-10 text-left">
          <div className="relative">
            <div className="absolute top-1/2 -translate-y-1/2 -left-[46px] w-2.5 h-2.5 rounded-full border-[2px] border-[#fafafa] bg-[#16a34a]"></div>
            {children}
          </div>
        </div>
      ) : (
        <div className="hidden sm:block w-1/2"></div>
      )}

      {/* Mobile version (Always on the right of the line) */}
      <div className="sm:hidden pl-12 relative w-full flex justify-start">
        <div className="absolute top-1/2 -translate-y-1/2 left-[25px] w-2.5 h-2.5 rounded-full border-[2px] border-[#fafafa] bg-[#16a34a]"></div>
        {children}
      </div>
    </div>
  )
}
