'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, DollarSign, StickyNote, Calendar, Loader2 } from 'lucide-react'
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
  DialogTrigger 
} from '@/components/ui/dialog'

export function CustomerActions({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Dialog open states
  const [waOpen, setWaOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [remOpen, setRemOpen] = useState(false)

  // Form states
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [remDate, setRemDate] = useState('')
  const [remType, setRemType] = useState('CALL')

  const handleGenerateWA = async () => {
    toast.success('AI Message Generator will be available in Phase 12.')
    setWaOpen(false)
  }

  const handleRecordPayment = async () => {
    if (!payAmount || !payDate) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(payAmount), date: payDate })
      })
      if (res.ok) {
        toast.success('Payment recorded successfully')
        setPayOpen(false)
        router.refresh()
      } else {
        toast.error('Failed to record payment')
      }
    } catch (e) {
      toast.error('An error occurred')
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
        body: JSON.stringify({ content: noteContent })
      })
      if (res.ok) {
        toast.success('Note added successfully')
        setNoteOpen(false)
        setNoteContent('')
        router.refresh()
      } else {
        toast.error('Failed to add note')
      }
    } catch (e) {
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
        body: JSON.stringify({ dueDate: remDate, taskType: remType })
      })
      if (res.ok) {
        toast.success('Reminder created successfully')
        setRemOpen(false)
        router.refresh()
      } else {
        toast.error('Failed to create reminder')
      }
    } catch (e) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-surface-card border-surface-border border-brand-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        
        {/* WhatsApp Dialog */}
        <Dialog open={waOpen} onOpenChange={setWaOpen}>
          <DialogTrigger asChild>
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
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
              <DollarSign className="w-4 h-4 mr-2" />
              Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-card border-surface-border text-white">
            <DialogHeader>
              <DialogTitle>Record Payment Received</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Manually record a payment made outside the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount Received (₹)</Label>
                <Input 
                  type="number" 
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  placeholder="0.00" 
                  className="bg-black/20 border-surface-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Payment</Label>
                <Input 
                  type="date" 
                  value={payDate}
                  onChange={e => setPayDate(e.target.value)}
                  className="bg-black/20 border-surface-border [color-scheme:dark]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPayOpen(false)} className="border-surface-border hover:bg-white/5 hover:text-white" disabled={loading}>Cancel</Button>
              <Button onClick={handleRecordPayment} className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
          <DialogTrigger asChild>
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
                  onChange={e => setNoteContent(e.target.value)}
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
          <DialogTrigger asChild>
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
                <Select value={remType} onValueChange={setRemType}>
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
                  onChange={e => setRemDate(e.target.value)}
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
