import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { logAction, prisma } from '@autostate/database'

const promiseSchema = z.object({
  customerId: z.string(),
  messageId: z.string().optional(),
  expectedDate: z.string().datetime().or(z.date()),
  amount: z.number().optional(),
  aiConfidence: z.number().optional(),
  createdByAI: z.boolean().default(false)
})

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const body = await request.json()
    const parsed = promiseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { customerId, messageId, expectedDate, amount, aiConfidence, createdByAI } = parsed.data

    // 1. Verify customer belongs to this user's company
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { companyId: true, name: true }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    if (customer.companyId !== user.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 2. Create the Promise AND the Follow-up Task in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newPromise = await tx.promise.create({
        data: {
          customerId,
          messageId,
          expectedDate: new Date(expectedDate),
          amount,
          aiConfidence,
          createdByAI,
          status: 'PENDING'
        }
      })

      const dueDate = new Date(expectedDate)
      dueDate.setDate(dueDate.getDate() + 1) // Follow up the day after the promise date

      const newTask = await tx.task.create({
        data: {
          customerId,
          taskType: 'FOLLOW_UP',
          priority: 80, // High priority for checking kept promises
          status: 'PENDING',
          reason: `Follow up on payment promise made for ${new Date(expectedDate).toLocaleDateString()}.`,
          // Add metadata/links to the task if schema supports it, for now reason is enough
        }
      })

      return newPromise
    })

    logAction(user.companyId, user.id, createdByAI ? 'promise.created_by_ai' : 'promise.create', 'promise', result.id, {
      customerId,
      amount
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[PROMISES_POST]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
