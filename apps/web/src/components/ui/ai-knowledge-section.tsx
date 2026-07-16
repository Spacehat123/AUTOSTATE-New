'use client'

import React from 'react'

export function AiKnowledgeSection() {
  return (
    <section className="relative w-full py-32 sm:py-40 px-6 md:px-12 lg:px-24 bg-zinc-950 text-white overflow-hidden">
      {/* Background White Dots */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-blue-500/10 rounded-[100%] blur-[120px] pointer-events-none opacity-50 z-0"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none opacity-40 z-0"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-24 sm:mb-32">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-serif tracking-tight leading-[1.05]">
             The AI knows your business.<br/>
             <span className="text-zinc-600">Not just your prompt.</span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Card 1: Rajesh */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 sm:p-10 backdrop-blur-xl hover:bg-white/[0.05] transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div className="text-2xl sm:text-3xl font-medium text-white font-serif leading-tight mb-4">
              "Mr. Brown always pays late."
            </div>
            <div className="text-zinc-400 font-medium tracking-wide text-sm uppercase">
              Auto-adjusting follow-up schedule
            </div>
          </div>

          {/* Card 2: GST (Staggered up on desktop) */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 sm:p-10 backdrop-blur-xl hover:bg-white/[0.05] transition-colors group md:translate-y-12">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div className="text-2xl sm:text-3xl font-medium text-white font-serif leading-tight mb-4">
              "Don't forget to ask for GST."
            </div>
            <div className="text-zinc-400 font-medium tracking-wide text-sm uppercase">
              Appending tax details to drafts
            </div>
          </div>

          {/* Card 3: WhatsApp */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 sm:p-10 backdrop-blur-xl hover:bg-white/[0.05] transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </div>
            <div className="text-2xl sm:text-3xl font-medium text-white font-serif leading-tight mb-4">
              "This customer prefers WhatsApp."
            </div>
            <div className="text-zinc-400 font-medium tracking-wide text-sm uppercase">
              Defaulting communication channel
            </div>
          </div>

          {/* Card 4: Due Tomorrow (Staggered up on desktop) */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 sm:p-10 backdrop-blur-xl hover:bg-white/[0.05] transition-colors group md:translate-y-12">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div className="text-2xl sm:text-3xl font-medium text-white font-serif leading-tight mb-4">
              "Invoices are due tomorrow."
            </div>
            <div className="text-zinc-400 font-medium tracking-wide text-sm uppercase">
              Prioritized in morning briefing
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
