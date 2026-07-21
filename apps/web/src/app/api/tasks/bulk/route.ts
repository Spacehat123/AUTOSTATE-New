import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { logAction } from '@autostate/database/audit'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  
  try {
    const { taskIds, status } = await request.json()

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: 'taskIds must be a non-empty array' }, { status: 400 })
    }

    if (!['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Validate all taskIds belong to the caller's company
    const tasks = await user.db.task.findMany({
      where: {
        id: { in: taskIds }
      }
    })

    if (tasks.length !== taskIds.length) {
      return NextResponse.json({ error: 'One or more tasks not found or do not belong to you' }, { status: 403 })
    }

    // Update tasks
    await user.db.task.updateMany({
      where: {
        id: { in: taskIds }
      },
      data: { status }
    })

    // Log individual actions
    for (const taskId of taskIds) {
      await logAction(user.companyId, user.id, 'task.bulk_status_update', 'Task', taskId, { status })
    }

    // Log summary
    await logAction(user.companyId, user.id, 'task.bulk_status_change', 'Company', user.companyId, { count: taskIds.length, status })

    return NextResponse.json({ success: true, count: taskIds.length })
  } catch (error) {
    console.error('[TASKS_BULK_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
