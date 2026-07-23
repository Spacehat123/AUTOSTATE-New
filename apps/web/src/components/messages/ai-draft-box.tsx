'use client'

import React, { useState } from 'react'
import { Sparkles, Check, Edit2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface AIDraftBoxProps {
  messageId: string
  content: string
  onApprove: (messageId: string) => Promise<void>
  onEdit: (content: string) => void
}

export function AIDraftBox({ messageId, content, onApprove, onEdit }: AIDraftBoxProps) {
  const [isApproving, setIsApproving] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      await onApprove(messageId)
    } catch (e) {
      toast.error('Failed to approve draft')
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <div className="mx-4 mb-4 p-4 rounded-xl border border-brand-500/30 bg-brand-500/10 relative flex-shrink-0">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
      <div className="flex items-start gap-3 relative">
        <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-brand-400" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">
            AI Draft Suggestion
          </div>
          <div className="text-sm text-zinc-300 mb-4 bg-black/20 p-3 rounded-lg border border-surface-border">
            {content}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isApproving}
              className="bg-brand-500 hover:bg-brand-600 text-white text-xs h-8 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {isApproving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
              Approve & Send
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(content)}
              disabled={isApproving}
              className="border-brand-500/30 text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 text-xs h-8"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
