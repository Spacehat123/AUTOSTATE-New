'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Check, RotateCcw, Clock, Trash2, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'

export function ActionItemsSection({ initialItems = [] }: { initialItems?: any[] }) {
  const [items, setItems] = useState<any[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/action-items')
      if (res.ok) {
        const json = await res.json()
        setItems(json.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() })
      })

      if (!res.ok) throw new Error('Failed to add')
      const newItem = await res.json()
      setItems(prev => [newItem, ...prev])
      setTitle('')
    } catch (e) {
      toast.error('Failed to add action item')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setItems(prev => prev.filter(i => i.id !== id))
      await fetch(`/api/action-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
    } catch (e) {
      fetchItems() // revert on error
    }
  }

  const handleDelete = async (id: string) => {
    const itemToDelete = items.find(i => i.id === id)
    if (!itemToDelete) return

    try {
      setItems(prev => prev.filter(i => i.id !== id))
      await fetch(`/api/action-items/${id}`, { method: 'DELETE' })
      
      toast('Action item deleted', {
        action: {
          label: 'Undo',
          onClick: () => handleRestore(id)
        }
      })
    } catch (e) {
      toast.error('Failed to delete item')
      fetchItems() // revert
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await fetch(`/api/action-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedAt: null })
      })
      fetchItems()
    } catch (e) {
      toast.error('Failed to restore item')
    }
  }

  const pendingItems = items.filter(i => i.status === 'PENDING')

  if (loading) return <div className="h-24 animate-pulse bg-surface-card rounded-xl border border-surface-border"></div>

  return (
    <div className="flex flex-col gap-4 mb-8">
      <h2 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-brand-500" />
        Personal Action Items
      </h2>

      <Card className="bg-surface-card border-surface-border overflow-hidden">
        <form onSubmit={handleAdd} className="flex p-2 border-b border-surface-border/50 gap-2">
          <Input 
            placeholder="What needs to be done?" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="border-none bg-transparent focus-visible:ring-0 shadow-none text-base"
          />
          <Button type="submit" size="sm" disabled={!title.trim() || isSubmitting} className="bg-brand-500 hover:bg-brand-600 text-white shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </form>

        <div className="flex flex-col">
          {pendingItems.length === 0 ? (
            <div className="py-6 px-4 text-center text-zinc-500 text-sm">
              No pending action items. You're all caught up!
            </div>
          ) : (
            pendingItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 px-4 group border-b border-surface-border/50 last:border-0 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <button 
                    onClick={() => handleUpdateStatus(item.id, 'COMPLETED')}
                    className="w-5 h-5 rounded-full border border-zinc-500 flex items-center justify-center text-transparent hover:text-emerald-500 hover:border-emerald-500 transition-colors shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm text-foreground truncate">{item.title}</span>
                </div>
                
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-amber-400 hover:bg-amber-400/10" onClick={() => handleUpdateStatus(item.id, 'SNOOZED')}>
                    <Clock className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-rose-400 hover:bg-rose-400/10" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
