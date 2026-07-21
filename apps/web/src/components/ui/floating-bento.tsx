'use client'

import React, { useState, useEffect } from 'react'

export function FloatingBento() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate scroll-based transforms to move cards out to the right side
  const s = scrollY
  
  // Cards fly away to the right at different speeds, rotating as they go
  const invoiceTransform = `translate(${s * 1.6}px, ${-s * 0.1}px) rotate(${s * 0.05}deg)`
  const aiTransform = `translate(${s * 1.1}px, ${s * 0.05}px) rotate(${s * 0.02}deg)`
  const whatsappTransform = `translate(${s * 1.8}px, ${s * 0.15}px) rotate(${s * 0.08}deg)`

  return (
    <div className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center animate-fade-up" style={{ animationDelay: '400ms' }}>
      <div className="relative w-[340px] h-[380px] sm:w-[420px] sm:h-[420px] lg:w-[480px] lg:h-[480px]">
        
        {/* Card 1: Invoice */}
        <div 
          className="absolute top-12 left-2 sm:top-16 sm:left-6 z-10 transition-transform duration-300 ease-out"
          style={{ transform: invoiceTransform }}
        >
          <div className="w-[280px] sm:w-[320px] p-6 bg-white rounded-[24px] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.08)] animate-[float_6s_ease-in-out_infinite] border border-black/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-semibold text-zinc-400 tracking-[0.1em] uppercase">Invoice Sent</div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#75d393]"></div>
            </div>
            <div className="text-sm font-semibold text-zinc-900 tracking-tight">ACME Corp Redesign</div>
            <div className="text-3xl font-bold text-zinc-900 mt-0.5 tracking-tighter font-serif">$4,200</div>
            <div className="mt-5 flex items-center gap-2 text-[10px] font-medium text-zinc-500 border border-black/10 px-3 py-1.5 rounded-full w-fit">
              Due in 14 days
            </div>
          </div>
        </div>

        {/* Card 2: AI Action */}
        <div 
          className="absolute top-52 right-0 sm:top-60 sm:-right-8 z-30 transition-transform duration-300 ease-out"
          style={{ transform: aiTransform }}
        >
          <div className="w-[280px] sm:w-[320px] p-6 bg-[#18181b] rounded-[24px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.25)] animate-[float_7s_ease-in-out_1s_infinite]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-foreground">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
              </div>
              <div className="text-xs font-semibold text-foreground tracking-wide">AutoState AI</div>
            </div>
            <div className="text-[13px] text-zinc-400 leading-relaxed font-medium">
              <span className="text-zinc-100">Invoice #1042 paid.</span> I've updated the CRM to Active, marked the task complete, and drafted a thank you note.
            </div>
          </div>
        </div>

        {/* Card 3: WhatsApp Bubble */}
        <div 
          className="absolute bottom-4 left-6 sm:bottom-0 sm:left-14 z-20 transition-transform duration-300 ease-out"
          style={{ transform: whatsappTransform }}
        >
          <div className="w-[260px] sm:w-[280px] p-5 bg-white/95 backdrop-blur-xl rounded-[20px] rounded-bl-md shadow-[0_12px_24px_-6px_rgba(0,0,0,0.06)] animate-[float_8s_ease-in-out_2s_infinite] border border-black/[0.03]">
            <div className="text-[10px] font-semibold text-zinc-400 tracking-[0.1em] uppercase mb-3">WhatsApp Sent</div>
            <div className="text-[13px] font-medium text-zinc-700 leading-snug">
              Payment received! 🎉 The onboarding documents have been sent to your email.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
