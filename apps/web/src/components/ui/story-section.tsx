'use client'

import React from 'react'

export function StorySection() {
  return (
    <section className="relative w-full py-32 px-6 md:px-12 lg:px-24 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.02),transparent_50%)]"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-24">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-zinc-900 tracking-tight leading-[1.1]">
            One simple message.<br />
            <span className="text-zinc-400">Three automated actions.</span>
          </h2>
          <p className="mt-6 text-lg text-zinc-500 max-w-xl mx-auto">
            See how the AutoState engine processes incoming requests and orchestrates your entire tech stack instantly.
          </p>
        </div>

        {/* The Magic Engine Visual */}
        <div className="relative flex flex-col items-center">
          
          {/* Step 1: Incoming Message */}
          <div className="relative z-20 mb-8 transition-transform hover:scale-105 group">
            <div className="absolute -inset-4 bg-green-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="bg-white border border-zinc-200 shadow-xl rounded-2xl p-4 sm:px-6 flex items-center gap-4 relative">
              <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0 text-[#25D366]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-zinc-900">Client: "Can you send the invoice?"</div>
                <div className="text-[11px] text-zinc-500 font-medium">WhatsApp • 10:42 AM</div>
              </div>
            </div>
          </div>

          {/* Vertical Connecting Line */}
          <div className="w-px h-12 bg-gradient-to-b from-zinc-200 to-zinc-400"></div>

          {/* Step 2: AutoState Brain */}
          <div className="relative z-20 group">
            <div className="absolute -inset-8 bg-zinc-900/5 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition duration-700"></div>
            <div className="bg-zinc-900 text-white border border-zinc-800 shadow-[0_20px_40px_rgba(0,0,0,0.2)] rounded-[2.5rem] p-8 w-64 text-center relative transform transition-transform hover:scale-105">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-md border border-white/10">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" /></svg>
              </div>
              <div className="font-serif text-2xl font-bold mb-1">AutoState</div>
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Processing Engine</div>
            </div>
          </div>

          {/* Branching Lines (Desktop) */}
          <div className="hidden md:block w-full max-w-3xl relative h-16 mt-[-1px] z-10">
            {/* Center line */}
            <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-zinc-400 to-zinc-200"></div>
            {/* Left branch */}
            <div className="absolute top-8 left-12 right-1/2 h-px bg-zinc-300"></div>
            <div className="absolute top-8 left-12 w-px h-8 bg-gradient-to-b from-zinc-300 to-zinc-200"></div>
            {/* Right branch */}
            <div className="absolute top-8 left-1/2 right-12 h-px bg-zinc-300"></div>
            <div className="absolute top-8 right-12 w-px h-8 bg-gradient-to-b from-zinc-300 to-zinc-200"></div>
          </div>

          {/* Branching Lines (Mobile) */}
          <div className="md:hidden w-px h-16 bg-gradient-to-b from-zinc-400 to-zinc-200 z-10 mt-[-1px]"></div>

          {/* Step 3: Outcomes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full relative z-20">
            
            {/* Outcome 1: Invoice */}
            <div className="bg-white border border-zinc-100 shadow-xl shadow-black/[0.03] rounded-3xl p-8 transition-all hover:-translate-y-2 hover:shadow-2xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div className="text-[15px] font-bold text-zinc-900 mb-2 font-serif">Invoice Generated</div>
              <div className="text-[13px] text-zinc-500 font-medium leading-relaxed">Drafted a $4,200 PDF invoice directly in Stripe.</div>
            </div>
            
            {/* Outcome 2: WhatsApp Reply */}
            <div className="bg-white border border-zinc-100 shadow-xl shadow-black/[0.03] rounded-3xl p-8 transition-all hover:-translate-y-2 hover:shadow-2xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </div>
              <div className="text-[15px] font-bold text-zinc-900 mb-2 font-serif">Reply Sent</div>
              <div className="text-[13px] text-zinc-500 font-medium leading-relaxed">"Sent! The invoice is due in 14 days."</div>
            </div>
            
            {/* Outcome 3: CRM Update */}
            <div className="bg-white border border-zinc-100 shadow-xl shadow-black/[0.03] rounded-3xl p-8 transition-all hover:-translate-y-2 hover:shadow-2xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div className="text-[15px] font-bold text-zinc-900 mb-2 font-serif">CRM Updated</div>
              <div className="text-[13px] text-zinc-500 font-medium leading-relaxed">Client profile automatically marked as "Invoice Sent".</div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
