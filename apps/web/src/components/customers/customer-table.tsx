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
      className="-ml-4 h-8 text-[11px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors"
    >
      {label}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  )

  return (
    <div className="flex flex-col space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search customers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-surface-card border-surface-border text-foreground placeholder:text-muted-foreground/70 rounded-xl focus-visible:ring-brand-500 shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <Table>
          <TableHeader className="bg-surface-border/20 border-b border-surface-border">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground pl-6 h-12">Customer</TableHead>
              <TableHead className="h-12"><SortHeader label="Paid Amount" field="totalPaid" /></TableHead>
              <TableHead className="h-12"><SortHeader label="Outstanding" field="totalOutstanding" /></TableHead>
              <TableHead className="h-12"><SortHeader label="Oldest Invoice" field="oldestInvoiceDays" /></TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground h-12">Risk</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground h-12">Last Contact</TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground pr-6 h-12">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-500" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center border-none">
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
                <TableRow key={customer.id} className="border-b border-surface-border/50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group last:border-0">
                  <TableCell className="font-semibold text-foreground pl-6 py-4">{customer.name}</TableCell>
                  <TableCell className="py-4">
                    <CurrencyDisplay value={customer.totalPaid || 0} compact className="text-emerald-500 font-semibold" />
                  </TableCell>
                  <TableCell className="py-4">
                    <CurrencyDisplay value={customer.totalOutstanding} compact className="text-rose-500 font-semibold" />
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium py-4 text-sm">
                    {customer.oldestInvoiceDays > 0 ? `${customer.oldestInvoiceDays} days` : '-'}
                  </TableCell>
                  <TableCell className="py-4">
                    <RiskBadge score={customer.riskScore} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-medium py-4">
                    {customer.lastContact ? formatDistanceToNow(new Date(customer.lastContact), { addSuffix: true }) : 'Never'}
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <Link href={`/customers/${customer.id}`}>
                      <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity border-surface-border text-foreground hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/30 rounded-lg">
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
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm font-medium text-muted-foreground">
          Showing {data.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} customers
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-surface-border text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm text-foreground font-semibold px-2">
            Page {page} of {totalPages}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || total === 0}
            className="border-surface-border text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
