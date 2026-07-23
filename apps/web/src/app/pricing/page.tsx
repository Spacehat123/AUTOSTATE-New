import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { MarketingNavbar } from '@/components/layout/marketing-navbar'
import { DotMatrix } from '@/components/layout/dot-matrix'
import { Footer } from '@/components/layout/footer'
import { PricingClient } from './pricing-client'

export default async function PricingPage() {
  const { userId } = await auth()
  const variantId = '1933245' // From user specs

  return (
    <div className="relative min-h-screen bg-[#fafafa] font-sans selection:bg-zinc-200 overflow-hidden flex flex-col justify-between">
      {/* Background Glows to match landing page vibe */}
      <div className="absolute top-[-200px] left-[-200px] w-[800px] h-[800px] rounded-full bg-[#EEF7F3] blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[200px] right-[-200px] w-[800px] h-[800px] rounded-full bg-[#F3F6FF] blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none z-0" />
      
      <DotMatrix />
      <MarketingNavbar userId={userId} />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center pt-36 pb-20 px-6 md:px-12 lg:px-24">
        <div className="text-center z-10 max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-900 tracking-tight mb-4 font-serif leading-[1.1]">
            Simple, transparent pricing
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 leading-relaxed font-normal">
            Unlock the full power of AutoState and put your accounts receivable on autopilot.
          </p>
        </div>

        <div className="w-full z-10">
          <PricingClient proVariantId={variantId} isLoggedIn={!!userId} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
