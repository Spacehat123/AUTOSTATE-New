import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@autostate/database'

export const dynamic = 'force-dynamic'

const postSchema = z.object({
  title: z.string().min(1).max(255),
  notes: z.string().optional(),
  priority: z.number().int().min(0).max(100).optional(),
  dueDate: z.string().datetime().optional()
})

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const actionItems = await prisma.actionItem.findMany({
      where: {
        userId: user.id,
        companyId: user.companyId,
        deletedAt: null
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { dueDate: 'asc' }, // Soonest first
        { priority: 'desc' }, // Highest priority first
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ data: actionItems })
  } catch (error) {
    console.error('[ACTION_ITEMS_GET]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  try {
    const body = await request.json()
    const parsed = postSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() }, 
        { status: 400 }
      )
    }

    const { title, notes, priority, dueDate } = parsed.data

    const actionItem = await prisma.actionItem.create({
      data: {
        title,
        notes,
        priority: priority ?? 50,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: user.id,
        companyId: user.companyId
      }
    })

    return NextResponse.json(actionItem)
  } catch (error) {
    console.error('[ACTION_ITEMS_POST]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
