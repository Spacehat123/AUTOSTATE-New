'use client'

import React, { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, isSameDay } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { MessageSquare, Mail, StickyNote, User, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useOptimistic } from 'react'

// Helper to group by date
const groupMessagesByDate = (messages: any[]) => {
  const groups: { date: Date; messages: any[] }[] = []
  
  messages.forEach(msg => {
    const msgDate = new Date(msg.timestamp)
    const lastGroup = groups[groups.length - 1]
    
    if (lastGroup && isSameDay(lastGroup.date, msgDate)) {
      lastGroup.messages.push(msg)
    } else {
      groups.push({ date: msgDate, messages: [msg] })
    }
  })
  
  return groups
}

export function CommunicationTimeline({ customerId, messages = [] }: { customerId: string, messages?: any[] }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [msgType, setMsgType] = useState('WHATSAPP')
  const [isPending, startTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: any) => [...state, newMessage].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [optimisticMessages])

  const handleSend = async () => {
    if (!content.trim()) return
    const newMsg = {
      id: `temp-${Date.now()}`,
      content,
      type: msgType,
      direction: 'OUTGOING',
      timestamp: new Date().toISOString()
    }
    
    startTransition(() => {
      addOptimisticMessage(newMsg)
    })
    
    const prevContent = content
    setContent('')
    
    try {
      const res = await fetch(`/api/customers/${customerId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: prevContent, type: msgType })
      })
      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || 'Failed to send message')
        setContent(prevContent)
      } else {
        router.refresh()
      }
    } catch (error) {
      toast.error('Network error')
      setContent(prevContent)
    }
  }

  const groups = groupMessagesByDate(optimisticMessages)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'WHATSAPP': return <MessageSquare className="w-3 h-3" />
      case 'EMAIL': return <Mail className="w-3 h-3" />
      case 'NOTE': return <StickyNote className="w-3 h-3" />
      default: return <MessageSquare className="w-3 h-3" />
    }
  }

  return (
    <Card className="bg-surface-card border-surface-border h-full max-h-[800px] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b border-surface-border/50 pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Timeline</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {optimisticMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState 
              icon={<MessageSquare />}
              title="No Messages"
              description="No communication history recorded."
              className="border-none bg-transparent"
            />
          </div>
        ) : (
          groups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-4">
              {/* Date Header */}
              <div className="flex justify-center">
                <span className="bg-surface-border/30 text-zinc-400 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                  {format(group.date, 'MMM d, yyyy')}
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-4 flex flex-col">
                {group.messages.map((msg: any) => {
                  const isIncoming = msg.direction === 'INCOMING'
                  const isNote = msg.type === 'NOTE'

                  if (isNote) {
                    return (
                      <div key={msg.id} className="flex flex-col items-center my-4">
                        <div className="bg-white/5 border border-surface-border/50 rounded-lg p-3 text-sm italic text-zinc-400 flex items-start gap-2 max-w-[80%]">
                          <StickyNote className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span>{msg.content}</span>
                            <div className="text-[10px] text-zinc-500 mt-1 flex justify-start">
                              {format(new Date(msg.timestamp), 'h:mm a')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={msg.id} className={`flex w-full ${isIncoming ? 'justify-start' : 'justify-end'}`}>
                      <div className="flex items-end gap-2 max-w-[85%]">
                        
                        {isIncoming && (
                          <div className="w-6 h-6 rounded-full bg-surface-border flex items-center justify-center flex-shrink-0 mb-[18px]">
                            <User className="w-3 h-3 text-zinc-400" />
                          </div>
                        )}

                        <div className="flex flex-col">
                          <div 
                            className={`p-3 text-sm rounded-2xl ${
                              isIncoming 
                                ? 'bg-zinc-800 text-zinc-200 rounded-bl-sm' 
                                : 'bg-brand-600 text-white rounded-br-sm shadow-md'
                            }`}
                          >
                            {msg.content}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 text-[10px] text-zinc-500 ${isIncoming ? 'justify-start ml-1' : 'justify-end mr-1'}`}>
                            {getTypeIcon(msg.type)}
                            <span>{format(new Date(msg.timestamp), 'h:mm a')}</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>

      <CardFooter className="flex-shrink-0 border-t border-surface-border/50 p-4 gap-2 flex-col">
        <div className="flex w-full gap-2 items-end">
          <Select value={msgType} onValueChange={setMsgType}>
            <SelectTrigger className="w-[110px] bg-black/20 border-surface-border h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
            </SelectContent>
          </Select>
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Type a ${msgType.toLowerCase()} message...`}
            className="flex-1 min-h-[40px] max-h-[120px] bg-black/20 border-surface-border resize-none py-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button 
            onClick={handleSend}
            disabled={!content.trim() || isPending}
            size="icon"
            className="h-10 w-10 shrink-0 bg-brand-500 hover:bg-brand-600 text-white"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
