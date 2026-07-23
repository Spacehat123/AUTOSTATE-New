'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, Loader2, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface OpenInvoice {
  id: string
  invoiceNumber: string
  amount: number | string
  outstandingAmount: number | string
  customer?: { id: string; name: string }
}

interface Allocation {
  invoiceId: string
  amount: string
}

function fmt(value: number | string) {
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

function toNumber(value: number | string) {
  return typeof value === 'number' ? value : parseFloat(value)
}

export function RecordPaymentModal({
  openInvoices,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  defaultInvoiceId,
}: {
  openInvoices: OpenInvoice[]
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultInvoiceId?: string
}) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen

  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [payRef, setPayRef] = useState('')
  const [payMethod, setPayMethod] = useState('')
  
  // If defaultInvoiceId is passed, try to initialize allocation with it
  const initialAllocation = defaultInvoiceId && openInvoices.find(i => i.id === defaultInvoiceId)
    ? [{ invoiceId: defaultInvoiceId, amount: String(toNumber(openInvoices.find(i => i.id === defaultInvoiceId)!.outstandingAmount)) }]
    : [{ invoiceId: '', amount: '' }]
    
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocation)

  // Initialize payAmount if defaultInvoiceId is passed
  React.useEffect(() => {
    if (open && defaultInvoiceId && !payAmount) {
      const inv = openInvoices.find(i => i.id === defaultInvoiceId)
      if (inv) {
        setPayAmount(String(toNumber(inv.outstandingAmount)))
        setAllocations([{ invoiceId: defaultInvoiceId, amount: String(toNumber(inv.outstandingAmount)) }])
      }
    }
  }, [open, defaultInvoiceId])

  const allocatedTotal = allocations.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0)
  const payAmountNum = parseFloat(payAmount) || 0
  const balanced = Math.abs(allocatedTotal - payAmountNum) < 0.005

  const addAllocation = () => setAllocations((prev) => [...prev, { invoiceId: '', amount: '' }])
  const removeAllocation = (i: number) => setAllocations((prev) => prev.filter((_, idx) => idx !== i))
  const updateAllocation = (i: number, field: keyof Allocation, value: string) =>
    setAllocations((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)))

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

  const handleSyncTotal = () => {
    setPayAmount(allocatedTotal > 0 ? String(allocatedTotal.toFixed(2)) : '')
  }

  const handlePaymentAmountChange = (value: string) => {
    setPayAmount(value)
    if (allocations.length === 1 && allocations[0]?.invoiceId) {
      setAllocations([{ invoiceId: allocations[0].invoiceId, amount: value }])
    }
  }

  const handleRecordPayment = async () => {
    if (!payAmount || !payDate) return toast.error('Enter payment amount and date')
    if (!balanced) return toast.error(`Allocations (₹${fmt(allocatedTotal)}) must equal payment amount (₹${fmt(payAmountNum)})`)
    const invalidAlloc = allocations.find((a) => !a.invoiceId || !a.amount || parseFloat(a.amount) <= 0)
    if (invalidAlloc) return toast.error('All allocations need an invoice and a positive amount')

    for (const alloc of allocations) {
      const inv = openInvoices.find((i) => i.id === alloc.invoiceId)
      if (inv && parseFloat(alloc.amount) > toNumber(inv.outstandingAmount) + 0.005) {
        return toast.error(`Allocation for ${inv.invoiceNumber} exceeds its outstanding balance of ₹${fmt(inv.outstandingAmount)}`)
      }
    }

    setIsSubmitting(true)
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
        setOpen(false)
        setPayAmount('')
        setPayDate(new Date().toISOString().slice(0, 10))
        setPayRef('')
        setPayMethod('')
        setAllocations([{ invoiceId: '', amount: '' }])
        
        startTransition(() => {
          router.refresh()
        })
      } else {
        const body = await res.json().catch(() => ({}))
        toast.error(body?.error ?? 'Failed to record payment')
      }
    } catch {
      toast.error('Network error — please try again')
    } finally {
      setIsSubmitting(false)
    }
  }

  const loading = isSubmitting || isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-surface-card border-surface-border text-foreground max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment Received</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Allocate this payment against one or more outstanding invoices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Amount Received (₹)</Label>
              <Input
                type="number"
                value={payAmount}
                onChange={(e) => handlePaymentAmountChange(e.target.value)}
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
              <Select value={payMethod} onValueChange={(v) => setPayMethod(v ?? '')}>
                <SelectTrigger className="bg-black/20 border-surface-border">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="bg-surface-card border-surface-border text-foreground">
                  <SelectItem value="BANK_TRANSFER" className="focus:bg-brand-500/20 focus:text-white">Bank Transfer / NEFT</SelectItem>
                  <SelectItem value="UPI" className="focus:bg-brand-500/20 focus:text-white">UPI</SelectItem>
                  <SelectItem value="CHEQUE" className="focus:bg-brand-500/20 focus:text-white">Cheque</SelectItem>
                  <SelectItem value="CASH" className="focus:bg-brand-500/20 focus:text-white">Cash</SelectItem>
                  <SelectItem value="OTHER" className="focus:bg-brand-500/20 focus:text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400">Invoice Allocations</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSyncTotal}
                className="text-xs text-zinc-500 hover:text-foreground h-6 px-2"
              >
                Sync total from allocations
              </Button>
            </div>

            {openInvoices.length === 0 ? (
              <p className="text-sm text-zinc-500 italic py-2">No open invoices found.</p>
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
                          onValueChange={(v) => handleInvoiceSelect(i, v ?? '')}
                        >
                          <SelectTrigger className="bg-black/20 border-surface-border text-sm h-9">
                            <SelectValue placeholder="Select invoice" />
                          </SelectTrigger>
                          <SelectContent className="bg-surface-card border-surface-border text-foreground">
                            {available.map((inv) => (
                              <SelectItem
                                key={inv.id}
                                value={inv.id}
                                className="focus:bg-brand-500/20 focus:text-white"
                              >
                                <span className="font-medium">{inv.invoiceNumber}</span>
                                {inv.customer && <span className="ml-1 text-zinc-400">({inv.customer.name})</span>}
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
                    className="text-xs text-zinc-500 hover:text-foreground h-7 px-2 gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add another invoice
                  </Button>
                )}

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
            onClick={() => setOpen(false)}
            className="border-surface-border hover:bg-white/5 hover:text-foreground"
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
  )
}
