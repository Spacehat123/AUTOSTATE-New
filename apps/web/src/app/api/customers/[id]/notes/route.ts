import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty')
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()

  try {
    const { id: customerId } = await params
    const body = await request.json()
    
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() }, 
        { status: 400 }
      )
    }
    
    const { content } = parsed.data
    
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }
    
    if (customer.companyId !== user.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const message = await prisma.message.create({
      data: {
        customerId,
        type: 'NOTE',
        direction: 'OUTGOING',
        content,
        timestamp: new Date()
      }
    })
    
    return NextResponse.json(message)
  } catch (error) {
    console.error('[CUSTOMER_NOTE_CREATE]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
