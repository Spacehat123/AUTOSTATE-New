'use client'

import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Button } from '@/components/ui/button'
import { Loader2, TrendingUp, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

type Period = 'month' | 'quarter' | 'year'

interface ReportData {
  totalOutstanding: number
  collectedThisPeriod: number
  averageCollectionDays: number
  recoveryRate: number
  topDelayedCustomers: Array<{
    id: string
    name: string
    outstanding: number
  }>
}

interface TrendData {
  date: string
  outstanding: number
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<ReportData | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReports() {
      setLoading(true)
      try {
        const [reportsRes, trendRes] = await Promise.all([
          fetch(`/api/reports?period=${period}`),
          fetch(`/api/reports/trend`)
        ])
        
        if (!reportsRes.ok || !trendRes.ok) throw new Error('Failed to fetch data')
        
        const reportsJson = await reportsRes.json()
        const trendJson = await trendRes.json()
        
        setData(reportsJson)
        setTrendData(trendJson)
      } catch (e) {
        toast.error('Failed to load reporting data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchReports()
  }, [period])

  // Custom Tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-card border border-surface-border p-3 rounded-lg shadow-lg">
          <p className="text-sm text-zinc-400 mb-1">{label}</p>
          <p className="text-sm font-semibold text-brand-400">
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Reports" 
          subtitle="Financial performance overview" 
        />
        
        <div className="flex bg-surface-card p-1 rounded-lg border border-surface-border w-fit">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setPeriod('month')}
            className={period === 'month' ? 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 hover:text-brand-300' : 'text-zinc-400 hover:text-white'}
          >
            This Month
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setPeriod('quarter')}
            className={period === 'quarter' ? 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 hover:text-brand-300' : 'text-zinc-400 hover:text-white'}
          >
            This Quarter
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setPeriod('year')}
            className={period === 'year' ? 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 hover:text-brand-300' : 'text-zinc-400 hover:text-white'}
          >
            This Year
          </Button>
        </div>
      </div>

      {!data && loading ? (
        <div className="flex items-center justify-center h-64 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Outstanding"
              value={`₹${data.totalOutstanding.toLocaleString('en-IN')}`}
              icon={<AlertCircle className="w-4 h-4 text-rose-400" />}
              trend={{ value: 0, direction: 'up' }}
            />
            <StatCard
              title={`Collected This ${period.charAt(0).toUpperCase() + period.slice(1)}`}
              value={`₹${data.collectedThisPeriod.toLocaleString('en-IN')}`}
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            />
            <StatCard
              title="Avg Collection Time"
              value={`${data.averageCollectionDays} days`}
              icon={<Clock className="w-4 h-4 text-blue-400" />}
            />
            <StatCard
              title="Recovery Rate"
              value={`${data.recoveryRate}%`}
              icon={<TrendingUp className="w-4 h-4 text-brand-400" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-card border border-surface-border rounded-xl overflow-hidden">
              <div className="p-5 border-b border-surface-border">
                <h2 className="text-lg font-medium text-white">Outstanding Balance Trend</h2>
                <p className="text-sm text-zinc-400">Last 30 days</p>
              </div>
              <div className="p-5 h-[350px] w-full" style={{ background: '#1e293b' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10} 
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569' }} />
                    <Line 
                      type="monotone" 
                      dataKey="outstanding" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={false}
                      activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden h-fit">
              <div className="p-5 border-b border-surface-border">
                <h2 className="text-lg font-medium text-white">Top Delayed Customers</h2>
                <p className="text-sm text-zinc-400">Highest outstanding balances</p>
              </div>
              
              {data.topDelayedCustomers.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  No delayed customers to show.
                </div>
              ) : (
                <div className="divide-y divide-surface-border">
                  {data.topDelayedCustomers.map((customer, i) => (
                    <div key={customer.id} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-surface-background flex items-center justify-center text-xs font-medium text-zinc-300 shrink-0">
                          {i + 1}
                        </div>
                        <div className="font-medium text-zinc-200 truncate pr-2 max-w-[120px]" title={customer.name}>
                          {customer.name}
                        </div>
                      </div>
                      <div className="font-medium text-rose-400 shrink-0">
                        <CurrencyDisplay value={customer.outstanding} compact className="font-semibold text-rose-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
