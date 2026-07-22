'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function CustomerLanguage({ customerId, initialLanguage }: { customerId: string, initialLanguage: string | null }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [language, setLanguage] = useState(initialLanguage || 'English')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/language`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredLanguage: language })
      })
      if (res.ok) {
        toast.success('Language updated')
        setOpen(false)
        router.refresh()
      } else {
        toast.error('Failed to update language')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md border border-surface-border">
        <Globe className="w-3.5 h-3.5" />
        {initialLanguage || 'Language'}
      </DialogTrigger>
      <DialogContent className="bg-surface-card border-surface-border text-foreground max-w-sm">
        <DialogHeader>
          <DialogTitle>Preferred Language</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Select the language for AI-generated collection messages.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={language} onValueChange={(val) => val && setLanguage(val)}>
            <SelectTrigger className="bg-black/20 border-surface-border">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-surface-card border-surface-border">
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="Hinglish">Hinglish</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-surface-border hover:bg-white/5" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-brand-500 hover:bg-brand-600 text-white" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
