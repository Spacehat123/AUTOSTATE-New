import React from 'react'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@autostate/database'
import { PricingClient } from './pricing-client'
import { Badge } from '@/components/ui/badge'

export default async function AppPricingPage() {
  const user = await getCurrentUser()
  const subscription = await prisma.subscription.findUnique({
    where: { companyId: user.companyId },
  })

  const currentPlan = subscription?.plan || 'FREE'
  const status = subscription?.status || 'TRIALING'

  const variantId = '1933245' // From specifications

  return (
    <div className="p-6 md:p-12 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Subscription & Billing</h1>
          <p className="text-zinc-500 mt-1">Manage your plan and billing details.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
          <div className="text-sm text-zinc-500 font-medium px-2">Current Status:</div>
          <Badge variant={currentPlan === 'FREE' ? 'secondary' : 'default'} className="px-3 py-1 text-xs uppercase font-bold tracking-wider">
            {currentPlan}
          </Badge>
          <Badge variant={status === 'ACTIVE' ? 'default' : 'outline'} className="px-3 py-1 text-xs uppercase font-bold tracking-wider">
            {status}
          </Badge>
        </div>
      </div>

      <div className="mt-8">
        <PricingClient proVariantId={variantId} isLoggedIn={true} />
      </div>
    </div>
  )
}
