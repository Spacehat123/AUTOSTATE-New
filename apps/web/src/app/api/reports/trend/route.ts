import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    // 1. Fetch all invoices for the company
    const invoices = await prisma.invoice.findMany({
      where: {
        customer: {
          companyId: user.companyId
        }
      },
      select: {
        amount: true,
        outstandingAmount: true,
        createdAt: true,
        paidDate: true,
        status: true
      }
    })

    // 2. Generate the last 30 days
    const trend: Array<{ date: string; outstanding: number }> = []
    const now = new Date()
    now.setHours(23, 59, 59, 999) // End of today

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      let dayOutstanding = 0

      // Calculate outstanding balance as it was at the end of 'date'
      for (const inv of invoices) {
        if (new Date(inv.createdAt) <= date) {
          // If it was paid, and the paidDate is after this date, it was still outstanding
          if (inv.status === 'PAID' && inv.paidDate) {
            if (new Date(inv.paidDate) > date) {
              dayOutstanding += typeof inv.amount === 'number' ? inv.amount : inv.amount.toNumber()
            }
          } else {
            // If it's currently OVERDUE or PARTIAL or PENDING, it was outstanding on this date
            // For simplicity in MVP without a payment ledger, we use current outstanding amount
            dayOutstanding += typeof inv.outstandingAmount === 'number' 
              ? inv.outstandingAmount 
              : inv.outstandingAmount.toNumber()
          }
        }
      }

      trend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        outstanding: dayOutstanding
      })
    }

    return NextResponse.json(trend)

  } catch (error) {
    console.error('[TREND_GET]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
