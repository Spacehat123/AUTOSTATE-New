'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, Users, AlertTriangle, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
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
  
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER')
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/team')
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
      const res = await fetch(`/api/team/${userId}`, {
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

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the company?')) return
    
    try {
      const res = await fetch(`/api/team/${userId}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to remove user')
      }
      
      toast.success('User removed')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsInviting(true)
    
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, forceResend: false })
      })

      if (res.status === 409) {
        const error = await res.json()
        if (error.isDuplicate) {
          if (confirm(error.error + '\n\nDo you want to revoke the old invitation and send a new one?')) {
            // Force resend
            const resendRes = await fetch('/api/team/invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: inviteEmail, role: inviteRole, forceResend: true })
            })
            
            if (!resendRes.ok) {
              const resendError = await resendRes.json()
              throw new Error(resendError.error || 'Failed to resend invitation')
            }
            
            toast.success('New invitation sent!')
            setInviteOpen(false)
            setInviteEmail('')
            fetchUsers()
            return
          } else {
            return
          }
        }
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to invite user')
      }
      
      toast.success('Invitation sent!')
      setInviteOpen(false)
      setInviteEmail('')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsInviting(false)
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
          <h3 className="text-lg font-medium text-foreground mb-2">Access Denied</h3>
          <p className="text-zinc-400">You must be the company OWNER to manage team members.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden max-w-4xl">
      <div className="p-6 border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-foreground">Team Members</h2>
            <p className="text-sm text-zinc-400">Manage user roles and access to your company account.</p>
          </div>
        </div>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger 
            render={
              <Button className="bg-brand-500 text-white hover:bg-brand-600 gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite to Team</DialogTitle>
              <DialogDescription>
                Send an invitation email to add someone to your company.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Email Address</label>
                <Input 
                  type="email" 
                  required 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Role</label>
                <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-brand-500 text-white hover:bg-brand-600" disabled={isInviting}>
                  {isInviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Invitation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
            <div className="col-span-5 flex justify-end items-center gap-3">
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
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 h-9 w-9"
                onClick={() => handleDelete(user.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
