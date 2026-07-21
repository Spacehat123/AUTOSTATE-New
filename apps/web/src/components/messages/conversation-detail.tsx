'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Sparkles, Loader2, CheckCircle, X, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CommunicationTimeline } from '@/components/customers/communication-timeline'
import { toast } from 'sonner'

interface ParsedReply {
  intent: 'promise_to_pay' | 'dispute' | 'payment_made' | 'other'
  promisedDate?: string
  promisedAmount?: number
  confidence?: number
}

interface ConversationDetailProps {
  customerId: string
  customerName: string
}

export function ConversationDetail({ customerId, customerName }: ConversationDetailProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [parsedReply, setParsedReply] = useState<ParsedReply | null>(null)
  const [savingPromise, setSavingPromise] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/customers/${customerId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (e) {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    setMessages([])
    setParsedReply(null)
    setMessageText('')
    fetchMessages()
  }, [customerId])

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!messageText.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageText })
      })
      if (res.ok) {
        setMessageText('')
        await fetchMessages()
        toast.success('Message sent')
      } else {
        toast.error('Failed to send message')
      }
    } catch (e) {
      toast.error('An error occurred')
    } finally {
      setSending(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`/api/customers/${customerId}/generate-message`)
      if (res.ok) {
        const data = await res.json()
        setMessageText(data.message || '')
        toast.success('AI message generated!')
      } else {
        toast.error('AI generation not available yet')
      }
    } catch (e) {
      toast.error('AI generation not available yet')
    } finally {
      setGenerating(false)
    }
  }

  const handleSavePromise = async () => {
    if (!parsedReply) return
    setSavingPromise(true)
    try {
      const res = await fetch('/api/promises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          expectedDate: parsedReply.promisedDate,
          expectedAmount: parsedReply.promisedAmount
        })
      })
      if (res.ok) {
        toast.success('Promise to pay saved!')
        setParsedReply(null)
      } else {
        toast.error('Failed to save promise')
      }
    } catch (e) {
      toast.error('An error occurred')
    } finally {
      setSavingPromise(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-border flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
          {customerName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-foreground">{customerName}</div>
          <div className="text-xs text-zinc-500">WhatsApp conversation</div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="p-4">
            <CommunicationTimeline messages={messages} />
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* AI Promise Detection Panel */}
      {parsedReply?.intent === 'promise_to_pay' && (
        <div className="mx-4 mb-3 p-4 rounded-xl border border-brand-500/30 bg-brand-500/10 relative flex-shrink-0">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
          <div className="flex items-start justify-between gap-4 relative">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-brand-400" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-1">
                  AI Detected: Promise to Pay
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                  {parsedReply.promisedDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />
                      {new Date(parsedReply.promisedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  {parsedReply.promisedAmount && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      ₹{parsedReply.promisedAmount.toLocaleString('en-IN')}
                    </span>
                  )}
                  {parsedReply.confidence && (
                    <span className="text-xs text-zinc-500 font-medium bg-white/5 px-2 py-0.5 rounded-full">
                      {Math.round(parsedReply.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setParsedReply(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 ml-11">
            <Button
              size="sm"
              onClick={handleSavePromise}
              disabled={savingPromise}
              className="bg-brand-500 hover:bg-brand-600 text-white text-xs h-8 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {savingPromise ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
              Yes, Save Promise
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setParsedReply(null)}
              className="text-zinc-400 hover:text-zinc-300 h-8 text-xs"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Message Composer */}
      <div className="px-4 pb-4 flex-shrink-0 space-y-2">
        <Textarea
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Ctrl+Enter to send)"
          className="bg-black/20 border-surface-border text-white placeholder:text-zinc-600 resize-none min-h-[80px] focus:border-brand-500/50"
        />
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
            className="border-brand-500/30 text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 text-xs h-8"
          >
            {generating
              ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              : <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            }
            Generate AI Message
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={sending || !messageText.trim()}
            className="bg-brand-500 hover:bg-brand-600 text-white h-8 text-xs shadow-[0_0_10px_rgba(59,130,246,0.3)] disabled:opacity-40"
          >
            {sending
              ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              : <Send className="w-3.5 h-3.5 mr-1.5" />
            }
            Send
          </Button>
        </div>
        <p className="text-[10px] text-zinc-600">Ctrl+Enter to send · Messages are sent via WhatsApp</p>
      </div>
    </div>
  )
}
