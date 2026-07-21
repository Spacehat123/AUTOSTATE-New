'use client'

import React, { useState } from 'react'
import { Sparkles, Loader2, Send, Copy, Check, MessageSquare } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface GenerateMessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  customerName: string
  onMessageSent?: () => void
}

type Tone = 'formal' | 'friendly' | 'firm'

export function GenerateMessageModal({
  open,
  onOpenChange,
  customerId,
  customerName,
  onMessageSent
}: GenerateMessageModalProps) {
  const [tone, setTone] = useState<Tone>('friendly')
  const [language, setLanguage] = useState('English')
  
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after exit animation
    setTimeout(() => {
      setMessage('')
      setTone('friendly')
      setLanguage('English')
    }, 300)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/generate-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone, language })
      })
      
      if (!res.ok) throw new Error('Failed to generate')
        
      const data = await res.json()
      setMessage(data.message)
    } catch (e) {
      toast.error('Failed to generate message')
    } finally {
      setGenerating(false)
    }
  }

  const handleSend = async () => {
    if (!message.trim()) return
    
    setSending(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message, type: 'WHATSAPP' })
      })
      
      if (!res.ok) throw new Error('Failed to send')
        
      toast.success('Message sent via WhatsApp!')
      onMessageSent?.()
      handleClose()
    } catch (e) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleCopy = async () => {
    if (!message) return
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-surface-card border-surface-border text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            AI Message Generator
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Draft a contextual collection message for {customerName}.
          </DialogDescription>
        </DialogHeader>

        {!message ? (
          <div className="space-y-6 py-4">
            {/* Tone Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">Select Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {(['formal', 'friendly', 'firm'] as Tone[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-2 text-sm rounded-md border capitalize transition-colors ${
                      tone === t 
                        ? 'bg-brand-500/20 border-brand-500 text-brand-300 font-medium'
                        : 'bg-black/20 border-surface-border text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">Language</label>
              <div className="grid grid-cols-3 gap-2">
                {['English', 'Hindi', 'Hinglish'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      language === l 
                        ? 'bg-brand-500/20 border-brand-500 text-brand-300 font-medium'
                        : 'bg-black/20 border-surface-border text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={generating}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Drafting Message...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Draft
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex justify-between items-center">
                <span>Edit your message</span>
                <button 
                  onClick={() => setMessage('')} 
                  className="text-xs text-brand-400 hover:text-brand-300 underline"
                >
                  Start over
                </button>
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-48 bg-black/20 border-surface-border text-white resize-none focus:border-brand-500/50"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex-1 border-surface-border bg-black/20 text-white hover:bg-white/5"
              >
                {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy to Clipboard
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send via WhatsApp
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
