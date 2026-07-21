import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
// db is now passed down from user
import { getCurrentUser } from '@/lib/auth'
import { generateCollectionMessage } from '@autostate/ai'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  tone: z.enum(['formal', 'friendly', 'firm']).default('professional' as any).catch('formal'),
  language: z.string().default('English').catch('English')
})

async function handleGenerate(
  customerId: string,
  db: any,
  tone: 'formal' | 'friendly' | 'firm',
  language: string
) {
  // 1. Fetch customer and verify company
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      invoices: {
        where: { status: { in: ['OVERDUE', 'PARTIAL'] } },
        select: {
          invoiceNumber: true,
          outstandingAmount: true,
          dueDate: true
        }
      },
      messages: {
        orderBy: { timestamp: 'desc' },
        take: 3, // Only last 3 messages for immediate context
        select: { content: true }
      }
    }
  })

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  // 2. Calculate aggregates for the prompt
  const outstandingAmount = customer.invoices.reduce(
    (sum, inv) => sum + (typeof inv.outstandingAmount === 'number' ? inv.outstandingAmount : inv.outstandingAmount.toNumber()),
    0
  )

  const invoiceNumbers = customer.invoices.map(inv => inv.invoiceNumber)

  // Calculate days overdue based on the oldest overdue invoice
  let daysOverdue = 0
  if (customer.invoices.length > 0) {
    const oldestDue = customer.invoices.reduce(
      (oldest, inv) => inv.dueDate < oldest ? inv.dueDate : oldest,
      customer.invoices[0]!.dueDate
    )
    const msPerDay = 1000 * 60 * 60 * 24
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    daysOverdue = Math.max(0, Math.floor((now.getTime() - new Date(oldestDue).getTime()) / msPerDay))
  }

  const recentMessages = customer.messages.map(m => m.content).reverse()

  // 3. Call the AI model
  const message = await generateCollectionMessage({
    customerName: customer.name,
    outstandingAmount,
    daysOverdue,
    invoiceNumbers,
    language,
    tone,
    recentMessages
  })

  return NextResponse.json({ message })
}

// Support GET for the simple "Generate AI Message" button in the conversation detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  try {
    const { id: customerId } = await params
    return await handleGenerate(customerId, user.db, 'friendly', 'English')
  } catch (error) {
    console.error('[GENERATE_MESSAGE_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Support POST for the advanced generator modal (Phase 12.9)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  try {
    const { id: customerId } = await params
    
    // Parse body gracefully (if empty, fall back to defaults)
    let body = {}
    try {
      body = await request.json()
    } catch (e) {
      // ignore JSON parse error, just use empty body for defaults
    }

    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 })
    }

    return await handleGenerate(customerId, user.db, parsed.data.tone, parsed.data.language)
  } catch (error) {
    console.error('[GENERATE_MESSAGE_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
