'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export function BillingSettings() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    fetch('/api/billing')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        toast.error('Failed to load billing information')
        setLoading(false)
      })
  }, [])

  const handleUpgrade = async (variantId: string) => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    )
  }

  const { subscription, limits, usage } = data

  const customerPercentage = Math.min((usage.customers / limits.maxCustomers) * 100, 100)
  const userPercentage = Math.min((usage.users / limits.maxUsers) * 100, 100)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>View your current subscription plan and status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold mb-2">{subscription.plan}</p>
              <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {subscription.status}
              </Badge>
              {subscription.currentPeriodEnd && (
                <p className="text-sm text-surface-icon mt-2">
                  Renews on: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            {subscription.plan === 'FREE' && (
              <Button 
                onClick={() => handleUpgrade('1933245')}
                disabled={checkoutLoading}
                className="bg-brand-primary text-white"
              >
                {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Upgrade to Pro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Limits</CardTitle>
          <CardDescription>Track your usage against your plan's limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2 text-sm font-medium">
              <span>Customers</span>
              <span>{usage.customers} / {limits.maxCustomers}</span>
            </div>
            <Progress value={customerPercentage} className="h-2" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2 text-sm font-medium">
              <span>Team Members</span>
              <span>{usage.users} / {limits.maxUsers}</span>
            </div>
            <Progress value={userPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
