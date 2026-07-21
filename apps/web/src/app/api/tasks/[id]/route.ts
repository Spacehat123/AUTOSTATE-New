import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
// db is now fetched from user
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
    
    // 1. Fetch task and verify multi-tenant boundaries (handled by user.db)
    const task = await user.db.task.findUnique({
      where: { id },
      include: { customer: true }
    })
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    // 2. Tenant isolation check is implicit with user.db
    
    // 3. Perform mutation
    const updatedTask = await user.db.task.update({
      where: { id },
      data: { status: status === 'COMPLETED' ? 'DONE' : status }
    })
    
    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('[TASK_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
