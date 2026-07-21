import { NextRequest, NextResponse } from 'next/server'
// db is now fetched from user
import { getCurrentUser } from '@/lib/auth'
import { generateRelationshipSummary } from '@autostate/ai'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()

  try {
    const { id: customerId } = await params

    // 1. Fetch customer with current cache state
    const customer = await user.db.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // 2. Check if the cached summary is fresh (< 24 hours old)
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    if (
      customer.aiSummary &&
      customer.aiSummaryUpdatedAt &&
      customer.aiSummaryUpdatedAt > twentyFourHoursAgo
    ) {
      return NextResponse.json({
        summary: customer.aiSummary,
        cached: true
      })
    }

    // 3. Stale or null: we need to generate a new summary.
    // Fetch all related data required by the AI prompt.
    const customerWithRelations = await user.db.customer.findUniqueOrThrow({
      where: { id: customerId },
      include: {
        invoices: {
          orderBy: { dueDate: 'desc' },
          select: {
            amount: true,
            status: true,
            createdAt: true,
            dueDate: true,
            paidAt: true
          }
        },
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 20, // Only need recent comms for the summary
          select: {
            direction: true,
            type: true,
            timestamp: true,
            content: true
          }
        },
        promises: {
          orderBy: { expectedDate: 'desc' },
          select: {
            status: true,
            expectedDate: true,
            createdAt: true
          }
        }
      }
    })

    // 4. Call the LLM (via our model-agnostic package)
    const newSummary = await generateRelationshipSummary({
      customerName: customerWithRelations.name,
      invoices: customerWithRelations.invoices,
      messages: customerWithRelations.messages,
      promises: customerWithRelations.promises
    })

    // 5. Cache the new summary in the DB
    await user.db.customer.update({
      where: { id: customerId },
      data: {
        aiSummary: newSummary,
        aiSummaryUpdatedAt: now
      }
    })

    // 6. Return fresh result
    return NextResponse.json({
      summary: newSummary,
      cached: false
    })
  } catch (error) {
    console.error('[AI_SUMMARY_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
