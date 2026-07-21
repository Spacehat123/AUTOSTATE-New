'use client'

import React, { useState } from 'react'
import { Check, Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function PricingClient({ proVariantId }: { proVariantId: string }) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: proVariantId }),
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout')
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      toast.error(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto w-full mt-12">
      {/* Free Plan */}
      <div className="flex-1 bg-surface-card border border-surface-border rounded-3xl p-8 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
        <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">Free</h3>
        <p className="text-sm text-muted-foreground mb-6">Perfect for testing the waters</p>
        <div className="mb-8">
          <span className="text-5xl font-extrabold text-foreground tracking-tight">₹0</span>
          <span className="text-muted-foreground">/mo</span>
        </div>
        
        <div className="flex flex-col gap-4 text-sm text-muted-foreground w-full mb-8 text-left">
          <div className="flex items-center gap-3"><Check className="w-4 h-4 text-brand-500" /> Up to 5 Customers</div>
          <div className="flex items-center gap-3"><Check className="w-4 h-4 text-brand-500" /> 1 Team Member</div>
          <div className="flex items-center gap-3"><Check className="w-4 h-4 text-brand-500" /> Basic WhatsApp reminders</div>
          <div className="flex items-center gap-3"><Check className="w-4 h-4 text-brand-500" /> Standard Support</div>
        </div>

        <Button disabled variant="outline" className="w-full mt-auto rounded-xl py-6 font-semibold">
          Current Plan
        </Button>
      </div>

      {/* Pro Plan */}
      <div className="flex-1 bg-white dark:bg-surface-card border-2 border-brand-500/50 rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_0_40px_-10px_rgba(0,71,255,0.2)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Zap className="w-3.5 h-3.5" /> Most Popular
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">Pro</h3>
        <p className="text-sm text-muted-foreground mb-6">For growing businesses needing scale</p>
        <div className="mb-8">
          <span className="text-5xl font-extrabold text-foreground tracking-tight">₹2250</span>
          <span className="text-muted-foreground">/mo</span>
        </div>
        
        <div className="flex flex-col gap-4 text-sm text-foreground w-full mb-8 text-left font-medium">
          <div className="flex items-center gap-3"><Check className="w-4 h-4 text-brand-500" /> Unlimited Customers</div>
          <div className="flex items-center gap-3"><Check className="w-4 h-4 text-brand-500" /> Unlimited Team Members</div>
          <div className="flex items-center gap-3"><Check className="w-4 h-4 text-brand-500" /> Advanced AI Automation</div>
          <div className="flex items-center gap-3"><Check className="w-4 h-4 text-brand-500" /> Bulk WhatsApp & Email</div>
          <div className="flex items-center gap-3"><Check className="w-4 h-4 text-brand-500" /> Priority 24/7 Support</div>
        </div>

        <Button 
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full mt-auto rounded-xl py-6 font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-[0_0_20px_-5px_rgba(0,71,255,0.5)] transition-all hover:scale-[1.02]"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Upgrade to Pro
        </Button>
      </div>
    </div>
  )
}
