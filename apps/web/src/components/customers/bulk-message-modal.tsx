import React, { useState, useEffect } from 'react'
import { Loader2, X, Send, Bot, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface BulkMessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerIds: string[]
  onComplete: () => void
}

export function BulkMessageModal({ open, onOpenChange, customerIds, onComplete }: BulkMessageModalProps) {
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [tone, setTone] = useState('professional')
  const [language, setLanguage] = useState('preferred')
  
  const generateMessages = async () => {
    setLoading(true)
    setMessages([])
    try {
      const res = await fetch('/api/customers/bulk-generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds, tone, language: language === 'preferred' ? undefined : language })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      
      setMessages(data.map((m: any) => ({ ...m, status: 'pending', draft: m.message })))
    } catch (e: any) {
      toast.error(e.message)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  // Fetch when modal opens
  useEffect(() => {
    if (open && customerIds.length > 0) {
      generateMessages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSendAll = async () => {
    setSending(true)
    let successCount = 0
    let failCount = 0

    const updatedMessages = [...messages]
    
    for (let i = 0; i < updatedMessages.length; i++) {
      const msg = updatedMessages[i]
      if (msg.error || msg.status === 'sent') continue
      
      updatedMessages[i].status = 'sending'
      setMessages([...updatedMessages])

      try {
        const res = await fetch(`/api/customers/${msg.customerId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            content: msg.draft,
            type: 'WHATSAPP' 
          })
        })
        
        if (res.ok) {
          updatedMessages[i].status = 'sent'
          successCount++
        } else {
          updatedMessages[i].status = 'error'
          failCount++
        }
      } catch (e) {
        updatedMessages[i].status = 'error'
        failCount++
      }
      setMessages([...updatedMessages])
    }
    
    setSending(false)
    toast.success(`Sent ${successCount} messages. ${failCount > 0 ? `${failCount} failed.` : ''}`)
    if (failCount === 0) {
      setTimeout(() => {
        onOpenChange(false)
        onComplete()
      }, 1000)
    }
  }

  const allSent = messages.length > 0 && messages.every(m => m.status === 'sent' || m.error)

  return (
    <Dialog open={open} onOpenChange={(val) => !sending && onOpenChange(val)}>
      <DialogContent className="max-w-2xl bg-surface-card border-surface-border text-foreground max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-brand-500" />
            Bulk Generate Messages
          </DialogTitle>
          <DialogDescription>
            Generating AI collection messages for {customerIds.length} customer(s).
          </DialogDescription>
        </DialogHeader>
        
        {!loading && messages.length === 0 && (
          <div className="flex gap-4 mb-4">
            <Select value={tone} onValueChange={(val) => val && setTone(val)} disabled={loading || sending}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="firm">Firm</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={language} onValueChange={(val) => val && setLanguage(val)} disabled={loading || sending}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preferred">Default (Preferred)</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="hinglish">Hinglish</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateMessages} disabled={loading}>Regenerate</Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
              <p>Drafting personalized messages...</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`p-4 rounded-xl border ${msg.status === 'error' || msg.error ? 'border-rose-500/50 bg-rose-500/5' : 'border-surface-border bg-black/5 dark:bg-white/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm truncate">Customer ID: {msg.customerId}</span>
                  {msg.status === 'sending' && <Loader2 className="w-4 h-4 animate-spin text-brand-500" />}
                  {msg.status === 'sent' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {(msg.status === 'error' || msg.error) && <AlertCircle className="w-4 h-4 text-rose-500" />}
                </div>
                {msg.error ? (
                  <p className="text-sm text-rose-500">{msg.error}</p>
                ) : (
                  <Textarea 
                    value={msg.draft}
                    onChange={(e) => {
                      const newMsgs = [...messages];
                      newMsgs[i].draft = e.target.value;
                      setMessages(newMsgs);
                    }}
                    disabled={sending || msg.status === 'sent'}
                    className="text-sm min-h-[100px] resize-none"
                  />
                )}
              </div>
            ))
          )}
        </div>

        <DialogFooter className="pt-4 mt-4 border-t border-surface-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendAll} 
            disabled={loading || sending || allSent || messages.length === 0}
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            {sending ? 'Sending...' : allSent ? 'Sent' : 'Send All Messages'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
