'use client'

import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'

interface ConversationRow {
  customerId: string
  customerName: string
  phone: string
  latestMessage: string
  latestMessageAt: string
  latestMessageDirection: string
  latestMessageType: string
  unreadCount: number
}

interface MessageInboxProps {
  conversations: ConversationRow[]
  selectedId: string | null
  onSelect: (customerId: string) => void
}

// Generate a consistent hue from a string so each customer gets the same color
function getAvatarColor(name: string): string {
  const colors = [
    'bg-rose-500',
    'bg-pink-500',
    'bg-violet-500',
    'bg-indigo-500',
    'bg-blue-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-orange-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]!
}

export function MessageInbox({ conversations, selectedId, onSelect }: MessageInboxProps) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          icon={<MessageSquare />}
          title="No conversations yet"
          description="When customers reply via WhatsApp, their messages will appear here."
          className="border-none bg-transparent"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-surface-border overflow-y-auto h-full">
      {conversations.map(conv => {
        const isSelected = conv.customerId === selectedId
        const initial = conv.customerName.charAt(0).toUpperCase()
        const avatarColor = getAvatarColor(conv.customerName)
        const isOutgoing = conv.latestMessageDirection === 'OUTGOING'

        return (
          <button
            key={conv.customerId}
            onClick={() => onSelect(conv.customerId)}
            className={`w-full text-left px-4 py-4 flex items-center gap-3 transition-colors group
              ${isSelected
                ? 'bg-brand-500/15 border-l-2 border-brand-500'
                : 'hover:bg-white/5 border-l-2 border-transparent'
              }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-11 h-11 rounded-full ${avatarColor} flex items-center justify-center text-foreground font-bold text-lg shadow-md`}>
                {initial}
              </div>
              {conv.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                  {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className={`font-semibold truncate ${isSelected ? 'text-foreground' : 'text-zinc-200'} ${conv.unreadCount > 0 ? 'font-bold' : ''}`}>
                  {conv.customerName}
                </span>
                <span className="text-[10px] text-zinc-500 flex-shrink-0">
                  {formatDistanceToNow(new Date(conv.latestMessageAt), { addSuffix: false })}
                </span>
              </div>
              <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-zinc-300 font-medium' : 'text-zinc-500'}`}>
                {isOutgoing && <span className="text-zinc-600 mr-1">You:</span>}
                {conv.latestMessage}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
