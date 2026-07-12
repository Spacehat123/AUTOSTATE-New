'use client'

import React from 'react'
import { format, isSameDay } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { MessageSquare, Mail, StickyNote, User } from 'lucide-react'

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

export function CommunicationTimeline({ messages }: { messages: any[] }) {
  if (!messages || messages.length === 0) {
    return (
      <Card className="bg-surface-card border-surface-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center">
          <EmptyState 
            icon={<MessageSquare />}
            title="No Messages"
            description="No communication history recorded."
            className="border-none bg-transparent"
          />
        </CardContent>
      </Card>
    )
  }

  const groups = groupMessagesByDate(messages)

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
        <CardTitle className="text-lg font-semibold text-white">Timeline</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-4">
            {/* Date Header */}
            <div className="flex justify-center">
              <span className="bg-surface-border/30 text-zinc-400 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                {format(group.date, 'MMM d, yyyy')}
              </span>
            </div>

            {/* Messages */}
            <div className="space-y-4 flex flex-col">
              {group.messages.map(msg => {
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
        ))}
      </CardContent>
    </Card>
  )
}
