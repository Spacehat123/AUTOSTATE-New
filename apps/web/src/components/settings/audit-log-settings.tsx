'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type AuditLog = {
  id: string
  action: string
  entityType: string
  entityId: string
  metadata: any
  createdAt: string
  user: {
    name: string
    email: string
  }
}

export function AuditLogSettings() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [entityType, setEntityType] = useState<string>('all')

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true)
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          limit: '20'
        })
        if (entityType !== 'all') {
          query.append('entityType', entityType)
        }
        
        const res = await fetch(`/api/audit-log?${query.toString()}`)
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error('You do not have permission to view the audit log.')
          }
          throw new Error('Failed to fetch audit logs')
        }
        
        const data = await res.json()
        setLogs(data.data)
        setTotalPages(data.totalPages || 1)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [page, entityType])

  const getEntityLink = (log: AuditLog) => {
    switch (log.entityType) {
      case 'invoice':
        return `/invoices` // We don't have individual invoice pages yet, or maybe /customers/[id]?
      case 'customer':
      case 'message':
      case 'task':
      case 'promise':
        if (log.metadata?.customerId) {
          return `/customers/${log.metadata.customerId}`
        }
        return '#'
      case 'user':
        return '/settings/team'
      default:
        return '#'
    }
  }

  const formatAction = (action: string) => {
    return action.split('.').join(' ').replace(/_/g, ' ')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>Recent actions performed by team members.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={entityType} onValueChange={(val) => { setEntityType(val); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="invoice">Invoices</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="promise">Promises</SelectItem>
                <SelectItem value="user">Users/Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity logs found.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const link = getEntityLink(log)
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{log.user.name || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">{log.user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {formatAction(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={link} className="text-brand-500 hover:underline">
                            {log.entityType} ({log.entityId.slice(0, 8)}...)
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
