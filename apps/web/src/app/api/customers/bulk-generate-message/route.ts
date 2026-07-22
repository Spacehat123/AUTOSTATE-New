import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { generateCollectionMessage } from '@autostate/ai/message-generator'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const { customerIds, tone = 'professional', language } = await request.json()

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json({ error: 'customerIds must be a non-empty array' }, { status: 400 })
    }

    if (customerIds.length > 25) {
      return NextResponse.json({ error: 'Maximum of 25 customers per bulk generation request' }, { status: 400 })
    }

    // Check rate limit if implemented (Phase 22.3)
    // const { checkRateLimit } = await import('@/lib/rate-limit')
    // await checkRateLimit(user.companyId, 'bulk-generate', 10) // 10 requests per hour

    // Verify all customers belong to company and fetch their data
    const customers = await user.db.customer.findMany({
      where: {
        id: { in: customerIds }
      },
      include: {
        invoices: {
          where: { status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } }
        }
      }
    })

    if (customers.length !== customerIds.length) {
      return NextResponse.json({ error: 'One or more customers not found or do not belong to you' }, { status: 403 })
    }

    const results = []

    // Process sequentially to avoid thundering-herd API spend spikes
    for (const customer of customers) {
      if (!customer.invoices || customer.invoices.length === 0) {
        results.push({
          customerId: customer.id,
          message: 'No open invoices found to collect on.'
        })
        continue
      }

      try {
        const outstandingAmount = customer.invoices.reduce(
          (sum: number, inv: any) => sum + Number(inv.outstandingAmount || 0),
          0
        )
        const invoiceNumbers = customer.invoices.map((inv: any) => inv.invoiceNumber)

        let daysOverdue = 0
        if (customer.invoices.length > 0) {
          const oldestDue = customer.invoices.reduce(
            (oldest: Date, inv: any) => inv.dueDate < oldest ? inv.dueDate : oldest,
            customer.invoices[0]!.dueDate
          )
          const msPerDay = 1000 * 60 * 60 * 24
          const now = new Date()
          now.setHours(0, 0, 0, 0)
          daysOverdue = Math.max(0, Math.floor((now.getTime() - new Date(oldestDue).getTime()) / msPerDay))
        }

        const generated = await generateCollectionMessage({
          customerName: customer.name,
          outstandingAmount,
          daysOverdue,
          invoiceNumbers,
          language: language || customer.preferredLanguage || 'English',
          tone: tone as any,
          recentMessages: []
        })
        
        results.push({
          customerId: customer.id,
          message: generated
        })
      } catch (err: any) {
        results.push({
          customerId: customer.id,
          error: 'Failed to generate message'
        })
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('[CUSTOMERS_BULK_GENERATE_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
