'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function PricingClient({ 
  proVariantId, 
  isLoggedIn 
}: { 
  proVariantId: string
  isLoggedIn: boolean 
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleFreeAction = () => {
    if (!isLoggedIn) {
      router.push('/sign-in')
      return
    }
    router.push('/dashboard')
  }

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      router.push('/sign-in')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: proVariantId }),
      })

      if (res.status === 401) {
        router.push('/sign-in')
        return
      }

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

  const handleContactSales = () => {
    window.location.href = 'mailto:sales@autostate.com?subject=Enterprise%20Plan%20Inquiry'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full mt-12">
      {/* Free Plan */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
        <h3 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">Free</h3>
        <p className="text-xs text-zinc-500 mb-6">Perfect for testing the waters</p>
        <div className="mb-8">
          <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">₹0</span>
          <span className="text-zinc-500 text-sm">/mo</span>
        </div>
        
        <div className="flex flex-col gap-3 text-xs text-zinc-600 w-full mb-8 text-left">
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Up to 5 Customers</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> 1 Team Member</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Basic WhatsApp reminders</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Standard Support</div>
        </div>

        <Button 
          onClick={handleFreeAction}
          variant={isLoggedIn ? "outline" : "default"}
          className="w-full mt-auto rounded-xl py-5 font-semibold text-sm"
        >
          {isLoggedIn ? "Current Plan" : "Get Started Free"}
        </Button>
      </div>

      {/* Plus Plan */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
        <h3 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">Plus</h3>
        <p className="text-xs text-zinc-500 mb-6">Ideal for growing small teams</p>
        <div className="mb-8">
          <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">₹999</span>
          <span className="text-zinc-500 text-sm">/mo</span>
        </div>
        
        <div className="flex flex-col gap-3 text-xs text-zinc-600 w-full mb-8 text-left">
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Up to 50 Customers</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> 3 Team Members</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Automated WhatsApp & Email</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> AI Invoice drafting</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Standard Support</div>
        </div>

        <Button 
          onClick={handleSubscribe}
          disabled={loading}
          variant="outline"
          className="w-full mt-auto rounded-xl py-5 font-semibold text-sm border-zinc-300 hover:bg-zinc-100"
        >
          {isLoggedIn ? "Upgrade to Plus" : "Get Started with Plus"}
        </Button>
      </div>

      {/* Business Plan */}
      <div className="bg-white border-2 border-brand-500/50 rounded-3xl p-6 flex flex-col items-center text-center shadow-[0_0_40px_-10px_rgba(0,71,255,0.2)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 text-[11px] font-bold uppercase tracking-wider mb-3">
          <Zap className="w-3 h-3" /> Most Popular
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">Business</h3>
        <p className="text-xs text-zinc-500 mb-6">Full automation for established teams</p>
        <div className="mb-8">
          <span className="text-4xl font-extrabold text-zinc-900 tracking-tight">₹2250</span>
          <span className="text-zinc-500 text-sm">/mo</span>
        </div>
        
        <div className="flex flex-col gap-3 text-xs text-zinc-900 w-full mb-8 text-left font-medium">
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Unlimited Customers</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Unlimited Team Members</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Advanced AI Automation</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Bulk WhatsApp & Email</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Priority 24/7 Support</div>
        </div>

        <Button 
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full mt-auto rounded-xl py-5 font-semibold text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-[0_0_20px_-5px_rgba(0,71,255,0.5)] transition-all hover:scale-[1.02]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isLoggedIn ? "Upgrade to Business" : "Get Started with Business"}
        </Button>
      </div>

      {/* Enterprise Plan */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
        <h3 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">Enterprise</h3>
        <p className="text-xs text-zinc-500 mb-6">For large scale custom requirements</p>
        <div className="mb-8 py-2">
          <span className="text-2xl font-bold text-zinc-900 tracking-tight">Custom Plan</span>
        </div>
        
        <div className="flex flex-col gap-3 text-xs text-zinc-600 w-full mb-8 text-left">
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Custom Customer Limits</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Unlimited Team Members</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Dedicated Account Manager</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> Custom API & Webhooks</div>
          <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-brand-500 shrink-0" /> 99.9% Uptime SLA & 24/7 Support</div>
        </div>

        <Button 
          onClick={handleContactSales}
          variant="outline"
          className="w-full mt-auto rounded-xl py-5 font-semibold text-sm border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors"
        >
          Contact Sales
        </Button>
      </div>
    </div>
  )
}
