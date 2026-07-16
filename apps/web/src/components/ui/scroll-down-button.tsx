'use client'

import React from 'react'

export function ScrollDownButton() {
  return (
    <button 
      onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
      className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors animate-bounce z-50 cursor-pointer"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">See the Workspace</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
    </button>
  )
}
