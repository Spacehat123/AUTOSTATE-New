'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskCard } from '@/components/tasks/task-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { isToday, isPast } from 'date-fns'

export function TasksPageClient({ 
  initialTasks, 
  currentUserRole, 
  teamMembers 
}: { 
  initialTasks: any[], 
  currentUserRole?: string, 
  teamMembers?: any[] 
}) {
  const [tasks, setTasks] = useState<any[]>(initialTasks)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('today')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const isFirstRender = React.useRef(true)

  const fetchTasks = useCallback(async (tab: string) => {
    if (isFirstRender.current && (tab === 'today' || tab === 'pending')) {
      isFirstRender.current = false
      return
    }
    
    setLoading(true)
    try {
      let status = 'PENDING'
      if (tab === 'snoozed') status = 'SNOOZED'
      if (tab === 'done') status = 'COMPLETED'
      
      const res = await fetch(`/api/tasks?status=${status}`)
      if (res.ok) {
        const json = await res.json()
        setTasks(json.data)
      }
    } catch (e) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks(activeTab)
    setSelectedIds(new Set())
  }, [activeTab, fetchTasks])

  // Compute filtered tasks
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'today') {
      if (task.status !== 'PENDING') return false
      if (!task.dueDate) return true
      const d = new Date(task.dueDate)
      return isToday(d) || isPast(d) // due today or overdue
    }
    if (activeTab === 'pending') return task.status === 'PENDING'
    if (activeTab === 'snoozed') return task.status === 'SNOOZED'
    if (activeTab === 'done') return task.status === 'COMPLETED'
    return true
  })

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      // Optimistic update
      setTasks(current => current.filter(t => t.id !== taskId))
      
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!res.ok) {
        toast.error('Failed to update task')
        fetchTasks(activeTab) // revert
      } else {
        toast.success(`Task marked as ${newStatus.toLowerCase()}`)
      }
    } catch (e) {
      toast.error('An error occurred')
      fetchTasks(activeTab) // revert
    }
  }

  const handleAssign = async (taskId: string, newAssigneeId: string) => {
    try {
      // Optimistic update
      setTasks(current => current.map(t => t.id === taskId ? { ...t, assignedTo: newAssigneeId || null } : t))
      
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: newAssigneeId || null })
      })
      
      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || 'Failed to assign task')
        fetchTasks(activeTab) // revert
      } else {
        toast.success('Task reassigned successfully')
      }
    } catch (e) {
      toast.error('An error occurred')
      fetchTasks(activeTab) // revert
    }
  }

  const handleBulkUpdate = async (newStatus: string) => {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    try {
      const res = await fetch('/api/tasks/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskIds: Array.from(selectedIds),
          status: newStatus
        })
      })
      if (!res.ok) throw new Error('Failed')
      toast.success(`Updated ${selectedIds.size} tasks`)
      setSelectedIds(new Set())
      fetchTasks(activeTab)
    } catch (e) {
      toast.error('Failed to update tasks')
    } finally {
      setBulkLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
        <TabsList className="bg-surface-card border border-surface-border w-full grid grid-cols-4">
          <TabsTrigger value="today" className="data-[state=active]:bg-brand-500 data-[state=active]:text-white">Today</TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-brand-500 data-[state=active]:text-white">Pending</TabsTrigger>
          <TabsTrigger value="snoozed" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">Snoozed</TabsTrigger>
          <TabsTrigger value="done" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Done</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading && !isFirstRender.current ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-12 border border-surface-border/50 rounded-xl bg-surface-card/30">
          <EmptyState 
            icon={<CheckCircle2 className="w-12 h-12 text-emerald-500" />}
            title="All caught up!"
            description={activeTab === 'today' ? "No tasks for today. Great work." : `No ${activeTab} tasks found.`}
            className="border-none bg-transparent"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredTasks.map(task => (
            <TaskCard 
              key={task.id}
              task={task}
              onComplete={() => handleUpdateStatus(task.id, 'COMPLETED')}
              onSnooze={() => handleUpdateStatus(task.id, 'SNOOZED')}
              currentUserRole={currentUserRole}
              teamMembers={teamMembers}
              onAssign={handleAssign}
              selected={selectedIds.has(task.id)}
              onSelect={(checked) => {
                const next = new Set(selectedIds)
                if (checked) next.add(task.id)
                else next.delete(task.id)
                setSelectedIds(next)
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-200">
          <div className="bg-foreground text-background px-6 py-3 rounded-full shadow-2xl flex items-center gap-6">
            <span className="text-sm font-semibold whitespace-nowrap">
              {selectedIds.size} selected
            </span>
            <div className="w-px h-4 bg-background/20" />
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-full"
                onClick={() => handleBulkUpdate('COMPLETED')}
                disabled={bulkLoading}
              >
                {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                Mark Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
