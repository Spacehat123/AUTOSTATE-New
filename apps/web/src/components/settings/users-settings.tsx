'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, Users, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface User {
  id: string
  name: string | null
  email: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  createdAt: string
}

export function UsersSettings() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/settings/users')
      if (res.status === 403) {
        setAccessDenied(true)
        setLoading(false)
        return
      }
      
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      toast.error('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Optimistic UI update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as User['role'] } : u))
    
    try {
      const res = await fetch(`/api/settings/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update role')
      }
      
      toast.success('User role updated')
    } catch (error: any) {
      toast.error(error.message)
      // Revert optimistic update on failure by refetching
      fetchUsers()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="bg-surface-card border border-rose-500/30 rounded-xl p-8 max-w-2xl text-center space-y-4">
        <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white mb-2">Access Denied</h3>
          <p className="text-zinc-400">You must be the company OWNER to manage team members.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden max-w-4xl">
      <div className="p-6 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">Team Members</h2>
            <p className="text-sm text-zinc-400">Manage user roles and access to your company account.</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-surface-border">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-white/5 text-xs font-medium text-zinc-400 uppercase tracking-wider">
          <div className="col-span-4">Name / Email</div>
          <div className="col-span-3">Joined</div>
          <div className="col-span-5 text-right">Role</div>
        </div>
        
        {users.map((user) => (
          <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors">
            <div className="col-span-4">
              <div className="font-medium text-zinc-200">{user.name || 'Invited User'}</div>
              <div className="text-sm text-zinc-500">{user.email}</div>
            </div>
            <div className="col-span-3 text-sm text-zinc-400">
              {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="col-span-5 flex justify-end">
              <Select
                value={user.role}
                onValueChange={(val) => handleRoleChange(user.id, val || 'MEMBER')}
              >
                <SelectTrigger className="w-[130px] h-9 bg-black/20 border-surface-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
