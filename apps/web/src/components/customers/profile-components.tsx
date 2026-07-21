'use client'

import React from 'react'
import { format } from 'date-fns'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, MessageCircle, AlertCircle, FileText } from 'lucide-react'

export function InvoiceList({ invoices }: { invoices: any[] }) {
  if (!invoices || invoices.length === 0) {
    return (
      <Card className="bg-surface-card border-surface-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="text-zinc-400 text-sm">No invoices found.</CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-surface-card border-surface-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex justify-between items-center">
          Invoices
          <span className="text-xs font-medium text-zinc-400 bg-surface-border/30 px-2.5 py-1 rounded-full">
            {invoices.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex justify-between items-center p-3 rounded-lg border border-surface-border/50 bg-white/5 hover:bg-white/10 transition-colors group">
              <div>
                <div className="font-medium text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-500" />
                  {inv.invoiceNumber}
                </div>
                <div className="text-xs text-zinc-400 mt-1">Due: {format(new Date(inv.dueDate), 'MMM d, yyyy')}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground">
                  <CurrencyDisplay value={inv.outstandingAmount} compact />
                </div>
                <div className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${inv.status === 'OVERDUE' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {inv.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function CustomerActions({ customerId }: { customerId: string }) {
  return (
    <Card className="bg-surface-card border-surface-border border-brand-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </Button>
        <Button variant="outline" className="w-full border-surface-border text-zinc-300 hover:text-foreground hover:bg-white/5">
          <Phone className="w-4 h-4 mr-2" />
          Log Call
        </Button>
        <Button variant="outline" className="w-full border-surface-border text-zinc-300 hover:text-foreground hover:bg-white/5">
          <AlertCircle className="w-4 h-4 mr-2" />
          Escalate
        </Button>
        <Button variant="outline" className="w-full border-surface-border text-zinc-300 hover:text-foreground hover:bg-white/5">
          Record Pay
        </Button>
      </CardContent>
    </Card>
  )
}

export function CommunicationTimeline({ messages }: { messages: any[] }) {
  if (!messages || messages.length === 0) {
    return (
      <Card className="bg-surface-card border-surface-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="text-zinc-400 text-sm">No communication history found.</CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-surface-card border-surface-border overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative border-l border-surface-border/50 ml-3 space-y-6 pb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="relative pl-6">
              <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-surface-card ${msg.direction === 'INCOMING' ? 'bg-emerald-500' : 'bg-brand-500'}`} />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`font-semibold ${msg.direction === 'INCOMING' ? 'text-emerald-400' : 'text-brand-400'}`}>
                    {msg.direction === 'INCOMING' ? 'From Customer' : 'To Customer'}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500">{format(new Date(msg.timestamp), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <div className="text-sm text-zinc-300 bg-white/5 p-3 rounded-md border border-surface-border/50 mt-1">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AiSummary({ summary }: { summary: string | null }) {
  if (!summary) return null
  return (
    <Card className="bg-surface-card border-brand-500/30 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none" />
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold text-brand-400 flex items-center gap-2 uppercase tracking-widest">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
          AI Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <p className="text-sm text-zinc-300 leading-relaxed font-medium">{summary}</p>
      </CardContent>
    </Card>
  )
}
