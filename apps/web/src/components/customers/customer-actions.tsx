'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, DollarSign, StickyNote, Calendar, Loader2, Plus, Minus } from 'lucide-react'
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
  const [openInvoices, setOpenInvoices] = useState<OpenInvoice[]>(initialOpenInvoices ?? [])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

  // --- Note / reminder state ---
  const [noteContent, setNoteContent] = useState('')
  const [remDate, setRemDate] = useState('')
  const [remType, setRemType] = useState('CALL')

  // Fetch open invoices when the payment dialog opens
  useEffect(() => {
    if (!payOpen) return
    if (openInvoices.length > 0) return // already loaded from SSR prop
    setLoadingInvoices(true)
    fetch(`/api/customers/${customerId}/open-invoices`)
      .then((r) => r.json())
      .then((data: OpenInvoice[]) => {
        setOpenInvoices(data)
        if (data.length === 1) {
          const first = data[0]!
          setAllocations([{ invoiceId: first.id, amount: String(toNumber(first.outstandingAmount)) }])
          setPayAmount(String(toNumber(first.outstandingAmount)))
        }
      })
      .catch(() => toast.error('Could not load invoices'))
      .finally(() => setLoadingInvoices(false))
  }, [payOpen, customerId, openInvoices.length])

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
        setOpenInvoices([]) // force re-fetch next time
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

  // ----- Render -------------------------------------------------------------

  return (
    <Card className="bg-surface-card border-surface-border border-brand-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
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
          <DialogContent className="bg-surface-card border-surface-border text-white">
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
              <Button variant="outline" onClick={() => setWaOpen(false)} className="border-surface-border hover:bg-white/5 hover:text-white">Cancel</Button>
              <Button onClick={handleGenerateWA} className="bg-brand-500 hover:bg-brand-600 text-white">Got it</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        <Dialog open={payOpen} onOpenChange={setPayOpen}>
          <DialogTrigger>
            <Button variant="outline" className="w-full border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
              <DollarSign className="w-4 h-4 mr-2" />
              Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-card border-surface-border text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Record Payment Received</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Allocate this payment against one or more outstanding invoices.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">

              {/* Payment header fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Amount Received (₹)</Label>
                  <Input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-black/20 border-surface-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Date Received</Label>
                  <Input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="bg-black/20 border-surface-border [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Reference / UTR (optional)</Label>
                  <Input
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="e.g. UTR12345"
                    className="bg-black/20 border-surface-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Method (optional)</Label>
                  <Select value={payMethod} onValueChange={setPayMethod}>
                    <SelectTrigger className="bg-black/20 border-surface-border">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-card border-surface-border text-white">
                      <SelectItem value="BANK_TRANSFER" className="focus:bg-brand-500/20 focus:text-white">Bank Transfer / NEFT</SelectItem>
                      <SelectItem value="UPI" className="focus:bg-brand-500/20 focus:text-white">UPI</SelectItem>
                      <SelectItem value="CHEQUE" className="focus:bg-brand-500/20 focus:text-white">Cheque</SelectItem>
                      <SelectItem value="CASH" className="focus:bg-brand-500/20 focus:text-white">Cash</SelectItem>
                      <SelectItem value="OTHER" className="focus:bg-brand-500/20 focus:text-white">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Allocations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-zinc-400">Invoice Allocations</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSyncTotal}
                    className="text-xs text-zinc-500 hover:text-white h-6 px-2"
                  >
                    Sync total from allocations
                  </Button>
                </div>

                {loadingInvoices ? (
                  <div className="flex items-center gap-2 text-zinc-500 text-sm py-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading invoices…
                  </div>
                ) : openInvoices.length === 0 ? (
                  <p className="text-sm text-zinc-500 italic py-2">No open invoices found for this customer.</p>
                ) : (
                  <div className="space-y-2">
                    {allocations.map((alloc, i) => {
                      const selectedInv = openInvoices.find((inv) => inv.id === alloc.invoiceId)
                      const usedIds = allocations.filter((_, idx) => idx !== i).map((a) => a.invoiceId)
                      const available = openInvoices.filter((inv) => !usedIds.includes(inv.id))
                      return (
                        <div key={i} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-1">
                            <Select
                              value={alloc.invoiceId}
                              onValueChange={(v) => handleInvoiceSelect(i, v)}
                            >
                              <SelectTrigger className="bg-black/20 border-surface-border text-sm h-9">
                                <SelectValue placeholder="Select invoice" />
                              </SelectTrigger>
                              <SelectContent className="bg-surface-card border-surface-border text-white">
                                {available.map((inv) => (
                                  <SelectItem
                                    key={inv.id}
                                    value={inv.id}
                                    className="focus:bg-brand-500/20 focus:text-white"
                                  >
                                    <span className="font-medium">{inv.invoiceNumber}</span>
                                    <span className="ml-2 text-zinc-400 text-xs">
                                      bal ₹{fmt(inv.outstandingAmount)}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {selectedInv && (
                              <p className="text-[10px] text-zinc-500 pl-1">
                                Balance: ₹{fmt(selectedInv.outstandingAmount)} / Invoice: ₹{fmt(selectedInv.amount)}
                              </p>
                            )}
                          </div>
                          <Input
                            type="number"
                            value={alloc.amount}
                            onChange={(e) => updateAllocation(i, 'amount', e.target.value)}
                            placeholder="₹ amount"
                            className="bg-black/20 border-surface-border w-28 h-9 text-sm"
                          />
                          {allocations.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAllocation(i)}
                              className="text-zinc-500 hover:text-rose-400 h-9 w-9 shrink-0"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      )
                    })}

                    {allocations.length < openInvoices.length && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addAllocation}
                        className="text-xs text-zinc-500 hover:text-white h-7 px-2 gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add another invoice
                      </Button>
                    )}

                    {/* Balance indicator */}
                    <div className={`text-xs font-medium pt-1 ${balanced ? 'text-emerald-400' : 'text-amber-400'}`}>
                      Allocated: ₹{fmt(allocatedTotal)}
                      {!balanced && payAmountNum > 0 && (
                        <span className="ml-2 text-zinc-500">
                          (difference: ₹{fmt(Math.abs(payAmountNum - allocatedTotal))})
                        </span>
                      )}
                      {balanced && payAmountNum > 0 && ' ✓ Balanced'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPayOpen(false)}
                className="border-surface-border hover:bg-white/5 hover:text-white"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRecordPayment}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={loading || !balanced || openInvoices.length === 0}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
          <DialogTrigger>
            <Button variant="outline" className="w-full border-amber-500/30 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10">
              <StickyNote className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-card border-surface-border text-white">
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
              <Button variant="outline" onClick={() => setNoteOpen(false)} className="border-surface-border hover:bg-white/5 hover:text-white" disabled={loading}>Cancel</Button>
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
            <Button variant="outline" className="w-full border-surface-border text-zinc-300 hover:text-white hover:bg-white/5">
              <Calendar className="w-4 h-4 mr-2" />
              Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-card border-surface-border text-white">
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
                  <SelectContent className="bg-surface-card border-surface-border text-white">
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
              <Button variant="outline" onClick={() => setRemOpen(false)} className="border-surface-border hover:bg-white/5 hover:text-white" disabled={loading}>Cancel</Button>
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
