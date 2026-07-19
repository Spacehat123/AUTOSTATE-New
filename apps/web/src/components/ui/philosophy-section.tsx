'use client'

import React from 'react'

export function PhilosophySection() {
  return (
    <section className="relative w-full py-8 sm:py-32 px-6 md:px-12 lg:px-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Title */}
        <div className="text-center mb-10 sm:mb-24">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-serif tracking-tight text-zinc-900 leading-[1.05]">
            <span className="text-zinc-300">Five apps.</span><br />
            One workspace.
          </h2>
        </div>

        {/* Visual Stack (New Layout) */}
        <div className="w-full flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-24">
          
          {/* Left Side: Overlapping Cards */}
          <div className="relative w-[280px] h-[380px] shrink-0 max-sm:scale-[0.7] max-sm:origin-top max-sm:-mb-[114px]">
            
            {/* WhatsApp */}
            <div className="absolute top-0 left-4 z-10 -rotate-[8deg] transition-transform hover:scale-105 hover:z-[60] shadow-md rounded-2xl">
              <div className="bg-[#25D366] text-white rounded-2xl rounded-tr-none px-5 py-3 shadow-sm font-medium text-[15px] w-48 text-center flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                WhatsApp
              </div>
            </div>
            
            {/* Excel */}
            <div className="absolute top-[60px] left-[40px] z-20 -rotate-[3deg] transition-transform hover:scale-105 hover:z-[60] shadow-lg rounded-xl">
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
            
            {/* Notes */}
            <div className="absolute top-[130px] left-0 z-30 rotate-[2deg] transition-transform hover:scale-105 hover:z-[60] shadow-lg rounded-xl">
              <div className="bg-[#FEF9C3] border border-[#fef08a] shadow-sm rounded-xl p-4 w-48 text-left">
                <div className="text-[13px] font-serif font-bold text-yellow-900 mb-2">Meeting Notes</div>
                <div className="space-y-2">
                  <div className="w-full h-px bg-yellow-400/30"></div>
                  <div className="w-5/6 h-px bg-yellow-400/30"></div>
                  <div className="w-3/4 h-px bg-yellow-400/30"></div>
                </div>
              </div>
            </div>
            
            {/* Tasks */}
            <div className="absolute top-[190px] left-[50px] z-40 rotate-[6deg] transition-transform hover:scale-105 hover:z-[60] shadow-lg rounded-xl">
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
            
            {/* Invoices */}
            <div className="absolute top-[250px] left-[20px] z-50 -rotate-[4deg] transition-transform hover:scale-105 hover:z-[60] shadow-xl rounded-xl">
              <div className="bg-white border border-black/5 rounded-xl p-4 w-48 text-center flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center mb-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Invoice #042</div>
                <div className="text-[16px] font-serif font-bold text-zinc-900 mt-0.5">$1,250.00</div>
              </div>
            </div>

          </div>

          {/* Middle: Arrow */}
          <div className="text-zinc-300 shrink-0 xl:rotate-0 rotate-90">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>

          {/* Right Side: Demo App Mockup */}
          <div className="w-full max-w-xl bg-zinc-50 border border-zinc-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden flex flex-col h-[400px]">
            {/* Top Nav */}
            <div className="h-12 bg-white border-b border-zinc-200 flex items-center px-4 gap-4 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="font-serif font-bold text-sm text-zinc-800">AutoState Workspace</div>
            </div>
            
            {/* App Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-48 bg-zinc-100/50 border-r border-zinc-200 p-4 space-y-3 hidden sm:block shrink-0">
                <div className="h-8 bg-zinc-200/60 rounded-md w-full"></div>
                <div className="h-8 bg-transparent rounded-md w-3/4"></div>
                <div className="h-8 bg-transparent rounded-md w-4/5"></div>
              </div>
              {/* Main Content */}
              <div className="flex-1 p-6 bg-white flex flex-col gap-4 overflow-y-auto">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-2xl font-serif font-bold text-zinc-900 mb-1">Leo's Account</div>
                    <div className="text-sm text-zinc-500">Last message via WhatsApp 2h ago</div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold shrink-0">Active</div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-xl">
                    <div className="text-xs font-bold text-zinc-400 uppercase mb-2">Pending Task</div>
                    <div className="text-sm font-medium text-zinc-800">Send new contract draft</div>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-xl">
                    <div className="text-xs font-bold text-zinc-400 uppercase mb-2">Unpaid Invoice</div>
                    <div className="text-sm font-medium text-red-600 font-serif">$1,250.00</div>
                  </div>
                </div>
                
                <div className="flex-1 bg-blue-50/50 border border-blue-100 rounded-xl mt-2 p-4 flex flex-col justify-center items-center text-center min-h-[120px]">
                  <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </div>
                  <div className="text-sm font-medium text-blue-900">AI drafted WhatsApp reply</div>
                  <div className="text-xs text-blue-700/70 mt-1">Ready for your approval</div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
