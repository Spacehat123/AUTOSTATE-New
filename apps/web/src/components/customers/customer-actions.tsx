'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, DollarSign, StickyNote, Calendar, Loader2, Plus, Minus, Link as LinkIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'

// ----- Types ----------------------------------------------------------------

interface OpenInvoice {
  id: string
  invoiceNumber: string
  amount: number | string
  outstandingAmount: number | string
  status: string
  dueDate: string
}

interface Allocation {
  invoiceId: string
  amount: string
}

// ----- Helpers --------------------------------------------------------------

function fmt(value: number | string) {
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

function toNumber(value: number | string) {
  return typeof value === 'number' ? value : parseFloat(value)
}

// ----- Component ------------------------------------------------------------

export function CustomerActions({
  customerId,
  openInvoices: initialOpenInvoices,
}: {
  customerId: string
  openInvoices?: OpenInvoice[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Dialog open states
  const [waOpen, setWaOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [remOpen, setRemOpen] = useState(false)

  // --- Payment dialog state ---
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [payRef, setPayRef] = useState('')
  const [payMethod, setPayMethod] = useState('')
  const [allocations, setAllocations] = useState<Allocation[]>([{ invoiceId: '', amount: '' }])
  const openInvoices = initialOpenInvoices ?? []

  // --- Note / reminder state ---
  const [noteContent, setNoteContent] = useState('')
  const [remDate, setRemDate] = useState('')
  const [remType, setRemType] = useState('CALL')

  // Derived: allocated total
  const allocatedTotal = allocations.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0)
  const payAmountNum = parseFloat(payAmount) || 0
  const balanced = Math.abs(allocatedTotal - payAmountNum) < 0.005

  // Allocation helpers
  const addAllocation = () => setAllocations((prev) => [...prev, { invoiceId: '', amount: '' }])
  const removeAllocation = (i: number) =>
    setAllocations((prev) => prev.filter((_, idx) => idx !== i))
  const updateAllocation = (i: number, field: keyof Allocation, value: string) =>
    setAllocations((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)))

  // Auto-fill amount when an invoice is selected
  const handleInvoiceSelect = (i: number, invoiceId: string) => {
    const inv = openInvoices.find((inv) => inv.id === invoiceId)
    const alreadyUsed = allocations.some((a, idx) => idx !== i && a.invoiceId === invoiceId)
    if (alreadyUsed) {
      toast.error('This invoice is already in the allocation list')
      return
    }
    setAllocations((prev) =>
      prev.map((a, idx) =>
        idx === i
          ? { invoiceId, amount: inv ? String(toNumber(inv.outstandingAmount)) : a.amount }
          : a,
      ),
    )
  }

  // Recalculate total from allocations
  const handleSyncTotal = () => {
    setPayAmount(allocatedTotal > 0 ? String(allocatedTotal.toFixed(2)) : '')
  }

  // For a single selected invoice, the received amount is the allocation.
  // This makes a partial payment retain the unpaid balance by default instead
  // of leaving the selector at the invoice's full outstanding amount.
  const handlePaymentAmountChange = (value: string) => {
    setPayAmount(value)
    if (allocations.length === 1 && allocations[0]?.invoiceId) {
      setAllocations([{ invoiceId: allocations[0].invoiceId, amount: value }])
    }
  }

  // ----- Handlers -----------------------------------------------------------

  const handleGenerateWA = () => {
    toast.success('AI Message Generator will be available in Phase 12.')
    setWaOpen(false)
  }

  const handleRecordPayment = async () => {
    if (!payAmount || !payDate) return toast.error('Enter payment amount and date')
    if (!balanced) return toast.error(`Allocations (₹${fmt(allocatedTotal)}) must equal payment amount (₹${fmt(payAmountNum)})`)
    const invalidAlloc = allocations.find((a) => !a.invoiceId || !a.amount || parseFloat(a.amount) <= 0)
    if (invalidAlloc) return toast.error('All allocations need an invoice and a positive amount')

    // Validate against outstanding balances
    for (const alloc of allocations) {
      const inv = openInvoices.find((i) => i.id === alloc.invoiceId)
      if (inv && parseFloat(alloc.amount) > toNumber(inv.outstandingAmount) + 0.005) {
        return toast.error(`Allocation for ${inv.invoiceNumber} exceeds its outstanding balance of ₹${fmt(inv.outstandingAmount)}`)
      }
    }

    setLoading(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(payAmount),
          receivedAt: new Date(payDate).toISOString(),
          reference: payRef || undefined,
          method: payMethod || undefined,
          allocations: allocations.map((a) => ({
            invoiceId: a.invoiceId,
            amount: parseFloat(a.amount),
          })),
        }),
      })

      if (res.ok) {
        toast.success('Payment recorded successfully')
        setPayOpen(false)
        // Reset
        setPayAmount('')
        setPayDate(new Date().toISOString().slice(0, 10))
        setPayRef('')
        setPayMethod('')
        setAllocations([{ invoiceId: '', amount: '' }])
        router.refresh()
      } else {
        const body = await res.json().catch(() => ({}))
        toast.error(body?.error ?? 'Failed to record payment')
      }
    } catch {
      toast.error('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteContent) return toast.error('Note cannot be empty')
    setLoading(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent }),
      })
      if (res.ok) {
        toast.success('Note added successfully')
        setNoteOpen(false)
        setNoteContent('')
        router.refresh()
      } else {
        toast.error('Failed to add note')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReminder = async () => {
    if (!remDate) return toast.error('Please select a date')
    setLoading(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: remDate, taskType: remType }),
      })
      if (res.ok) {
        toast.success('Reminder created successfully')
        setRemOpen(false)
        router.refresh()
      } else {
        toast.error('Failed to create reminder')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyPortalLink = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/portal-link`, {
        method: 'POST'
      })
      if (res.ok) {
        const data = await res.json()
        await navigator.clipboard.writeText(data.url)
        toast.success('Portal link copied to clipboard')
      } else {
        toast.error('Failed to generate portal link')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  // ----- Render -------------------------------------------------------------

  return (
    <Card className="bg-surface-card border-surface-border border-brand-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
          Quick Actions
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopyPortalLink}
            disabled={loading}
            className="text-xs h-7 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20"
          >
            {loading ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <LinkIcon className="w-3 h-3 mr-1.5" />}
            Copy Portal Link
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">

        {/* WhatsApp Dialog */}
        <Dialog open={waOpen} onOpenChange={setWaOpen}>
          <DialogTrigger>
            <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-card border-surface-border text-foreground">
            <DialogHeader>
              <DialogTitle>Generate WhatsApp Message</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Use AI to generate a polite but firm payment reminder.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-6 text-center">
              <p className="text-sm font-medium text-brand-400 bg-brand-500/10 px-4 py-2 rounded-lg">
                ✨ AI generation unlocks in Phase 12.9
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWaOpen(false)} className="border-surface-border hover:bg-white/5 hover:text-foreground">Cancel</Button>
              <Button onClick={handleGenerateWA} className="bg-brand-500 hover:bg-brand-600 text-white">Got it</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        <RecordPaymentModal 
          openInvoices={openInvoices as any} 
          trigger={
            <Button variant="outline" className="w-full border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
              <DollarSign className="w-4 h-4 mr-2" />
              Payment
            </Button>
          } 
        />

        {/* Add Note Dialog */}
        <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
          <DialogTrigger>
            <Button variant="outline" className="w-full border-amber-500/30 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10">
              <StickyNote className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-card border-surface-border text-foreground">
            <DialogHeader>
              <DialogTitle>Add Internal Note</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Log a phone call, meeting, or general observation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Note Content</Label>
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type your note here..."
                  className="bg-black/20 border-surface-border min-h-[120px] resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNoteOpen(false)} className="border-surface-border hover:bg-white/5 hover:text-foreground" disabled={loading}>Cancel</Button>
              <Button onClick={handleAddNote} className="bg-amber-500 hover:bg-amber-600 text-white" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Reminder Dialog */}
        <Dialog open={remOpen} onOpenChange={setRemOpen}>
          <DialogTrigger>
            <Button variant="outline" className="w-full border-surface-border text-zinc-300 hover:text-foreground hover:bg-white/5">
              <Calendar className="w-4 h-4 mr-2" />
              Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-card border-surface-border text-foreground">
            <DialogHeader>
              <DialogTitle>Create Task / Reminder</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Schedule a follow-up action for this customer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Action Type</Label>
                <Select value={remType} onValueChange={(v) => setRemType(v || 'CALL')}>
                  <SelectTrigger className="bg-black/20 border-surface-border">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-card border-surface-border text-foreground">
                    <SelectItem value="CALL" className="focus:bg-brand-500/20 focus:text-white">Call Customer</SelectItem>
                    <SelectItem value="SEND_REMINDER" className="focus:bg-brand-500/20 focus:text-white">Send Reminder</SelectItem>
                    <SelectItem value="ESCALATE" className="focus:bg-brand-500/20 focus:text-white">Escalate to Owner</SelectItem>
                    <SelectItem value="FOLLOW_UP" className="focus:bg-brand-500/20 focus:text-white">General Follow Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={remDate}
                  onChange={(e) => setRemDate(e.target.value)}
                  className="bg-black/20 border-surface-border [color-scheme:dark]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRemOpen(false)} className="border-surface-border hover:bg-white/5 hover:text-foreground" disabled={loading}>Cancel</Button>
              <Button onClick={handleCreateReminder} className="bg-brand-500 hover:bg-brand-600 text-white" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  )
}
