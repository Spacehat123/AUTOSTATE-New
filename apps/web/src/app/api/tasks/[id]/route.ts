import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@autostate/database'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'DISMISSED', 'SNOOZED'])
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()

  try {
    const { id } = await params
    const body = await request.json()
    
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() }, 
        { status: 400 }
      )
    }
    
    const { status } = parsed.data
    
    // 1. Fetch task and eagerly load customer to verify multi-tenant boundaries
    const task = await prisma.task.findUnique({
      where: { id },
      include: { customer: true }
    })
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    // 2. Tenant isolation check
    if (task.customer.companyId !== user.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // 3. Perform mutation
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status }
    })
    
    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('[TASK_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
