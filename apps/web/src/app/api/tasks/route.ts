import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getTasks } from '@/lib/services/tasks'
import type { TaskStatus, TaskType } from '@autostate/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  const { searchParams } = new URL(request.url)
  
  const status = (searchParams.get('status') || 'PENDING') as TaskStatus
  const type = (searchParams.get('type') as TaskType) || undefined
  const assignedTo = searchParams.get('assignedTo') || undefined

  try {
    const result = await getTasks({
      db: user.db,
      status,
      type,
      assignedTo,
      requestingUserRole: user.role,
      requestingUserId: user.id
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[TASKS_GET]', error)
    if (error.message === "Unauthorized to view other users' assigned tasks") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
