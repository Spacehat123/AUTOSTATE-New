'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CurrencyDisplay } from '@/components/shared/currency-display'
import { RiskBadge } from '@/components/shared/risk-badge'
import { EmptyState } from '@/components/shared/empty-state'

export interface CustomerTableProps {
  initialData: any[]
  initialTotal: number
}

export function CustomerTable({ initialData, initialTotal }: CustomerTableProps) {
  const [data, setData] = useState<any[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const isFirstRender = React.useRef(true)
  
  // URL state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  const limit = 20
  const totalPages = Math.max(1, Math.ceil(total / limit))

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to page 1 on new search
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchCustomers = useCallback(async () => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    
    setLoading(true)
    try {
      const query = new URLSearchParams({
        search: debouncedSearch,
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      })
      const res = await fetch(`/api/customers?${query.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setData(json.data)
        setTotal(json.total)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page, sortBy, sortOrder])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc') // numbers sort desc first usually
    }
  }

  const SortHeader = ({ label, field }: { label: string, field: string }) => (
    <Button 
      variant="ghost" 
      onClick={() => handleSort(field)}
      className="-ml-4 h-8 text-xs font-semibold text-zinc-400 hover:text-white uppercase tracking-wider"
    >
      {label}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  )

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search customers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-card border-surface-border text-white placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-surface-border bg-surface-card overflow-hidden">
        <Table>
          <TableHeader className="bg-surface-border/20">
            <TableRow className="hover:bg-transparent border-surface-border">
              <TableHead className="font-semibold text-zinc-400 pl-6">Customer</TableHead>
              <TableHead><SortHeader label="Outstanding" field="totalOutstanding" /></TableHead>
              <TableHead><SortHeader label="Oldest Invoice" field="oldestInvoiceDays" /></TableHead>
              <TableHead className="font-semibold text-zinc-400">Risk</TableHead>
              <TableHead className="font-semibold text-zinc-400">Last Contact</TableHead>
              <TableHead className="text-right font-semibold text-zinc-400 pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-500" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center border-none">
                  <EmptyState 
                    icon={<Search />} 
                    title="No customers found" 
                    description="Try adjusting your search query." 
                    className="border-none bg-transparent"
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((customer) => (
                <TableRow key={customer.id} className="border-surface-border hover:bg-white/5 transition-colors group">
                  <TableCell className="font-medium text-white pl-6">{customer.name}</TableCell>
                  <TableCell>
                    <CurrencyDisplay value={customer.totalOutstanding} compact className="text-white font-medium" />
                  </TableCell>
                  <TableCell className="text-zinc-400 font-medium">
                    {customer.oldestInvoiceDays > 0 ? `${customer.oldestInvoiceDays} days` : '-'}
                  </TableCell>
                  <TableCell>
                    <RiskBadge score={customer.riskScore} />
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {customer.lastContact ? formatDistanceToNow(new Date(customer.lastContact), { addSuffix: true }) : 'Never'}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Link href={`/customers/${customer.id}`}>
                      <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity border-brand-500/20 text-brand-400 hover:bg-brand-500/10 hover:text-brand-300">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">
          Showing {data.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} customers
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-surface-border text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm text-zinc-400 font-medium px-2">
            Page {page} of {totalPages}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || total === 0}
            className="border-surface-border text-zinc-400 hover:text-white"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
