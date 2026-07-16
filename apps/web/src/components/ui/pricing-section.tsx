'use client'

import React, { useState } from 'react'

export function PricingSection() {
  const [annual, setAnnual] = useState(true)

  return (
    <section className="relative w-full py-24 sm:py-32 px-6 md:px-12 lg:px-24 bg-zinc-50 overflow-hidden" id="pricing">
      <div className="max-w-6xl mx-auto flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-zinc-900 leading-[1.05] mb-6">
            Simple pricing.<br />
            <span className="text-zinc-400">No surprises.</span>
          </h2>
          
          {/* Toggle */}
          <div className="inline-flex items-center p-1.5 bg-zinc-200/60 rounded-full border border-zinc-200/80 mt-4 shadow-inner">
            <button 
              onClick={() => setAnnual(false)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${!annual ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setAnnual(true)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${annual ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Annually <span className="text-green-500 ml-1.5 bg-green-100 px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wide">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          
          {/* Basic */}
          <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 sm:p-10 shadow-sm flex flex-col transition-transform hover:scale-[1.02]">
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">Basic</h3>
            <p className="text-zinc-500 text-sm mb-8">Perfect for solopreneurs getting started.</p>
            
            <div className="relative h-[60px] mb-8">
              <div className={`absolute top-0 left-0 transition-opacity duration-500 flex items-end gap-1 ${annual ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <span className="text-5xl font-serif font-bold text-zinc-900">$29</span>
                <span className="text-lg font-sans font-medium text-zinc-400 mb-1">/mo</span>
              </div>
              <div className={`absolute top-0 left-0 transition-opacity duration-500 flex items-end gap-1 ${!annual ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <span className="text-5xl font-serif font-bold text-zinc-900">$39</span>
                <span className="text-lg font-sans font-medium text-zinc-400 mb-1">/mo</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex gap-3 text-sm text-zinc-700"><CheckIcon /> 1 Team Member</li>
              <li className="flex gap-3 text-sm text-zinc-700"><CheckIcon /> Up to 50 active clients</li>
              <li className="flex gap-3 text-sm text-zinc-700"><CheckIcon /> WhatsApp integration</li>
              <li className="flex gap-3 text-sm text-zinc-700"><CheckIcon /> AI Invoice drafting</li>
            </ul>
            
            <button className="w-full py-4 rounded-xl font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-colors">
              Start Free Trial
            </button>
          </div>

          {/* Pro Wrapper */}
          <div className="relative h-full transition-transform hover:scale-[1.02]">
            
            {/* Text Only (Outside the overflow container) */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20 whitespace-nowrap">
              <span className="text-zinc-900 text-[12px] font-bold tracking-widest uppercase">
                Most Popular
              </span>
            </div>

            <div className="h-full relative bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 sm:p-10 shadow-2xl flex flex-col group overflow-hidden">
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Pro</h3>
              <p className="text-zinc-400 text-sm mb-8 relative z-10">For growing agencies & consultancies.</p>
              
              <div className="relative h-[60px] mb-8 z-10">
                <div className={`absolute top-0 left-0 transition-opacity duration-500 flex items-end gap-1 ${annual ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <span className="text-5xl font-serif font-bold text-white">$79</span>
                  <span className="text-lg font-sans font-medium text-zinc-500 mb-1">/mo</span>
                </div>
                <div className={`absolute top-0 left-0 transition-opacity duration-500 flex items-end gap-1 ${!annual ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <span className="text-5xl font-serif font-bold text-white">$99</span>
                  <span className="text-lg font-sans font-medium text-zinc-500 mb-1">/mo</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-10 flex-1 relative z-10">
                <li className="flex gap-3 text-sm text-zinc-300"><CheckIcon green /> Up to 5 Team Members</li>
                <li className="flex gap-3 text-sm text-zinc-300"><CheckIcon green /> Unlimited clients</li>
                <li className="flex gap-3 text-sm text-zinc-300"><CheckIcon green /> Priority AI Processing</li>
                <li className="flex gap-3 text-sm text-zinc-300"><CheckIcon green /> Custom API Webhooks</li>
              </ul>
              
              <button className="relative z-10 w-full py-4 rounded-xl font-bold text-zinc-900 bg-white hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Get AutoState Pro
              </button>
            </div>
          </div>

          {/* Scale */}
          <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 sm:p-10 shadow-sm flex flex-col transition-transform hover:scale-[1.02]">
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">Scale</h3>
            <p className="text-zinc-500 text-sm mb-8">For large teams and massive volume.</p>
            
            <div className="relative h-[60px] mb-8">
              <div className={`absolute top-0 left-0 transition-opacity duration-500 flex items-end gap-1 ${annual ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <span className="text-5xl font-serif font-bold text-zinc-900">$199</span>
                <span className="text-lg font-sans font-medium text-zinc-400 mb-1">/mo</span>
              </div>
              <div className={`absolute top-0 left-0 transition-opacity duration-500 flex items-end gap-1 ${!annual ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <span className="text-5xl font-serif font-bold text-zinc-900">$249</span>
                <span className="text-lg font-sans font-medium text-zinc-400 mb-1">/mo</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex gap-3 text-sm text-zinc-700"><CheckIcon /> Unlimited Team Members</li>
              <li className="flex gap-3 text-sm text-zinc-700"><CheckIcon /> Unlimited everything</li>
              <li className="flex gap-3 text-sm text-zinc-700"><CheckIcon /> Dedicated Server</li>
              <li className="flex gap-3 text-sm text-zinc-700"><CheckIcon /> 24/7 Dedicated Support</li>
            </ul>
            
            <button className="w-full py-4 rounded-xl font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-colors">
              Contact Sales
            </button>
          </div>

        </div>

      </div>
    </section>
  )
}

function CheckIcon({ green }: { green?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={green ? "#10B981" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={green ? "shrink-0" : "text-zinc-400 shrink-0"}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}
