'use client'

import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Loader2, TrendingUp, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { toast } from 'sonner'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
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
        <div className="bg-[#0f172a] p-3 rounded-lg shadow-lg border-none">
          <p className="text-sm text-zinc-400 mb-1">{label}</p>
          <p className="text-sm font-semibold text-foreground">
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
        
        <div className="flex bg-surface-card p-1 rounded-xl border border-surface-border w-fit shadow-sm">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setPeriod('month')}
            className={period === 'month' ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold rounded-lg' : 'text-muted-foreground hover:text-foreground font-medium rounded-lg'}
          >
            This Month
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setPeriod('quarter')}
            className={period === 'quarter' ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold rounded-lg' : 'text-muted-foreground hover:text-foreground font-medium rounded-lg'}
          >
            This Quarter
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setPeriod('year')}
            className={period === 'year' ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold rounded-lg' : 'text-muted-foreground hover:text-foreground font-medium rounded-lg'}
          >
            This Year
          </Button>
        </div>
      </div>

      {!data && loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat Card 1 */}
            <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-bold tracking-wider text-rose-500 uppercase">Outstanding</span>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-semibold text-foreground tracking-tight mb-4">
                <CurrencyDisplay value={data.totalOutstanding} />
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-500/10 text-rose-500 text-[11px] font-semibold px-2 py-0.5 rounded-md tracking-wide">- 0%</span>
                <span className="text-xs text-muted-foreground font-medium">vs last {period}</span>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-bold tracking-wider text-emerald-500 uppercase">Collected</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-semibold text-foreground tracking-tight mb-4">
                <CurrencyDisplay value={data.collectedThisPeriod} />
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-500 text-[11px] font-semibold px-2 py-0.5 rounded-md tracking-wide">- 0%</span>
                <span className="text-xs text-muted-foreground font-medium">vs last {period}</span>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-bold tracking-wider text-blue-500 uppercase">Collection Time</span>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-semibold text-foreground tracking-tight mb-4">
                {data.averageCollectionDays} <span className="text-xl text-muted-foreground">days</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500/10 text-blue-500 text-[11px] font-semibold px-2 py-0.5 rounded-md tracking-wide">- 0 days</span>
                <span className="text-xs text-muted-foreground font-medium">vs last {period}</span>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-surface-card rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-surface-border">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-bold tracking-wider text-purple-500 uppercase">Recovery Rate</span>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-semibold text-foreground tracking-tight mb-4">
                {data.recoveryRate}%
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-purple-500/10 text-purple-500 text-[11px] font-semibold px-2 py-0.5 rounded-md tracking-wide">+ 0%</span>
                <span className="text-xs text-muted-foreground font-medium">vs last {period}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-6">
            <div className="bg-surface-card border border-surface-border rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <div className="mb-8">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Outstanding Balance Trend
                </h2>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0047ff" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0047ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area 
                      type="monotone" 
                      dataKey="outstanding" 
                      stroke="#0047ff" 
                      strokeWidth={2} 
                      fill="url(#colorOutstanding)"
                      fillOpacity={1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-fit">
              <div className="mb-6">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Top Delayed Customers
                </h2>
              </div>
              
              {data.topDelayedCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-500/5 rounded-full flex items-center justify-center mb-4 border border-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-60" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1 tracking-tight">No delayed customers</h3>
                  <p className="text-sm text-muted-foreground">Everyone is paid up.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.topDelayedCustomers.map((customer, i) => (
                    <div key={customer.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-surface-border/50 flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                          {i + 1}
                        </div>
                        <div className="font-semibold text-sm text-foreground truncate pr-2" title={customer.name}>
                          {customer.name}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <CurrencyDisplay value={customer.outstanding} compact className="font-bold text-sm text-rose-500" />
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
