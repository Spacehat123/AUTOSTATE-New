import React from 'react'
import { PricingClient } from './pricing-client'

export default function PricingPage() {
  const variantId = '1933245' // From user specs

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 relative">
      {/* Background Glows to match landing page vibe */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="text-center z-10 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Unlock the full power of AutoState and put your accounts receivable on autopilot.
        </p>
      </div>

      <div className="w-full z-10">
        <PricingClient proVariantId={variantId} />
      </div>
    </div>
  )
}
