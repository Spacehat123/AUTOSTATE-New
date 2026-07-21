import { NextRequest, NextResponse } from 'next/server'
// db is passed via user
import { getCurrentUser } from '@/lib/auth'
import { startOfMonth, startOfQuarter, startOfYear, differenceInDays } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'month'

    // Compute date range based on period
    const now = new Date()
    let startDate: Date
    switch (period) {
      case 'year':
        startDate = startOfYear(now)
        break
      case 'quarter':
        startDate = startOfQuarter(now)
        break
      case 'month':
      default:
        startDate = startOfMonth(now)
        break
    }

    // Fetch all invoices for the company to compute metrics
    // We fetch them in memory to safely handle Prisma.Decimal math
    const invoices = await user.db.invoice.findMany({
      where: {},
      include: {
        customer: {
          select: { id: true, name: true }
        }
      }
    })

    // 1. totalOutstanding (all time, not just this period)
    const outstandingInvoices = invoices.filter(inv => inv.status !== 'PAID')
    const totalOutstanding = outstandingInvoices.reduce(
      (sum: number, inv: any) => sum + (typeof inv.outstandingAmount === 'number' ? inv.outstandingAmount : (inv.outstandingAmount as any).toNumber()),
      0
    )

    // 2. collectedThisPeriod
    const paidThisPeriod = invoices.filter(
      inv => inv.status === 'PAID' && inv.paidAt && inv.paidAt >= startDate
    )
    const collectedThisPeriod = paidThisPeriod.reduce(
      (sum: number, inv: any) => sum + (typeof inv.amount === 'number' ? inv.amount : (inv.amount as any).toNumber()),
      0
    )

    // 3. averageCollectionDays
    let averageCollectionDays = 0
    if (paidThisPeriod.length > 0) {
      const totalDays = paidThisPeriod.reduce(
        (sum: number, inv: any) => sum + differenceInDays(new Date(inv.paidAt!), new Date(inv.createdAt)),
        0
      )
      averageCollectionDays = Math.round(totalDays / paidThisPeriod.length)
    }

    // 4. recoveryRate = (collectedThisPeriod / totalBilledThisPeriod) * 100
    // totalBilledThisPeriod = invoices created in this period
    const billedThisPeriod = invoices.filter(inv => new Date(inv.createdAt) >= startDate)
    const totalBilledThisPeriod = billedThisPeriod.reduce(
      (sum: number, inv: any) => sum + (typeof inv.amount === 'number' ? inv.amount : (inv.amount as any).toNumber()),
      0
    )
    
    let recoveryRate = 0
    if (totalBilledThisPeriod > 0) {
      recoveryRate = Math.round((collectedThisPeriod / totalBilledThisPeriod) * 100)
    }

    // 5. topDelayedCustomers
    const customerBalances: Record<string, { id: string; name: string; outstanding: number }> = {}
    
    for (const inv of outstandingInvoices) {
      if (!customerBalances[inv.customerId]) {
        customerBalances[inv.customerId] = {
          id: inv.customerId,
          name: inv.customer.name,
          outstanding: 0
        }
      }
      const amt = typeof inv.outstandingAmount === 'number' ? inv.outstandingAmount : (inv.outstandingAmount as any).toNumber()
      customerBalances[inv.customerId]!.outstanding += amt
    }

    const topDelayedCustomers = Object.values(customerBalances)
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, 5)

    return NextResponse.json({
      totalOutstanding,
      collectedThisPeriod,
      averageCollectionDays,
      recoveryRate,
      topDelayedCustomers
    })

  } catch (error) {
    console.error('[REPORTS_GET]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
