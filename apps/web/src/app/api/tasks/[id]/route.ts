import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { logAction, prisma } from '@autostate/database'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'DISMISSED', 'SNOOZED']).optional(),
  assignedTo: z.string().nullable().optional()
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
    
    const { status, assignedTo } = parsed.data
    
    // 1. Fetch task and verify multi-tenant boundaries explicitly (defense in depth)
    const task = await prisma.task.findUnique({
      where: { id },
      include: { customer: true }
    })
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.customer.companyId !== user.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 2. Validate Assignment RBAC
    if (assignedTo !== undefined) {
      if (user.role === 'MEMBER') {
        return NextResponse.json({ error: 'Members cannot assign tasks' }, { status: 403 })
      }

      if (assignedTo !== null) {
        // Validate target user exists and belongs to same company
        const assignee = await prisma.user.findUnique({
          where: { id: assignedTo }
        })

        if (!assignee || assignee.companyId !== user.companyId) {
          return NextResponse.json({ error: 'Invalid assignee' }, { status: 400 })
        }
        
        if (assignee.clerkId.startsWith('invite_')) {
          return NextResponse.json({ error: 'Cannot assign tasks to pending invites' }, { status: 400 })
        }

        // Admins can only assign to Members (or themselves, which we'll allow if they are admin)
        if (user.role === 'ADMIN' && assignee.role !== 'MEMBER' && assignee.id !== user.id) {
          return NextResponse.json({ error: 'Admins can only assign tasks to Members' }, { status: 403 })
        }
      }
    }
    
    // 3. Perform mutation
    const updateData: any = {}
    if (status !== undefined) {
      updateData.status = status === 'COMPLETED' ? 'DONE' : status
    }
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo
    }

    const updatedTask = await user.db.task.update({
      where: { id },
      data: updateData
    })
    
    logAction(user.companyId, user.id, 'task.updated', 'task', updatedTask.id, updateData)
    
    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('[TASK_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
